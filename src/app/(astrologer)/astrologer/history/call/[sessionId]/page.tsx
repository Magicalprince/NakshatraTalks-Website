'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallInterface } from '@/components/features/call';
import {
  useActiveCall,
  useEndCallSessionAstrologer,
} from '@/hooks/useAstrologerDashboard';
import { useCallTimer } from '@/hooks/useCallSession';
import { callService } from '@/lib/services/call.service';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { useQueueStore } from '@/stores/queue-store';
import { supabaseRealtime } from '@/lib/services/supabase-realtime.service';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

type CallStatus = 'connecting' | 'ringing' | 'connected' | 'ended';

export default function AstrologerCallSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { addToast } = useUIStore();
  const user = useAuthStore((s) => s.user);

  // Local state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [sessionSummary, setSessionSummary] = useState<{
    duration: number;
    durationFormatted?: string;
    totalCost: number;
  } | null>(null);

  // Persisted user info — stored once on first load, survives activeSession becoming null after call ends
  const [storedUserName, setStoredUserName] = useState<string>('User');
  const [storedUserImage, setStoredUserImage] = useState<string | undefined>(undefined);
  const [storedPricePerMinute, setStoredPricePerMinute] = useState<number>(0);

  // Local connected-at timestamp (fallback for timer when API startTime is delayed)
  const [connectedAt, setConnectedAt] = useState<string | null>(null);

  // Twilio room reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roomRef = useRef<any>(null);
  const callStatusRef = useRef<CallStatus>(callStatus);
  callStatusRef.current = callStatus;

  // Track whether Twilio connection has been initiated
  const twilioConnectedRef = useRef(false);

  // Track whether endSession API has been called (prevent duplicate calls)
  const endSessionCalledRef = useRef(false);

  // Fetch active session via astrologer endpoint (now properly unwrapped)
  const {
    data: activeSession,
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useActiveCall();

  // Twilio credentials: queue-store (set during accept) → activeSession fallback
  const storeTwilioToken = useQueueStore((s) => s.twilioToken);
  const storeTwilioRoomName = useQueueStore((s) => s.twilioRoomName);
  const twilioToken = storeTwilioToken || activeSession?.twilioToken || null;
  const twilioRoomName = storeTwilioRoomName || activeSession?.twilioRoomName || null;

  // End session via astrologer endpoint
  const { mutate: endSession } = useEndCallSessionAstrologer();

  // Persist user info & price from activeSession (survives activeSession becoming null after call ends)
  useEffect(() => {
    if (activeSession?.user?.name) {
      setStoredUserName(activeSession.user.name);
      setStoredUserImage(activeSession.user.image || undefined);
    }
    if (activeSession?.pricePerMinute) {
      setStoredPricePerMinute(activeSession.pricePerMinute);
    }
  }, [activeSession]);

  // Call type — platform only supports audio calls (all calls have twilioRoomName)
  const callType = 'audio' as const;
  const callTypeRef = useRef(callType);
  callTypeRef.current = callType;

  // Timer: use API startTime if available, fallback to local connectedAt
  const startTime = activeSession?.startTime || connectedAt;
  const pricePerMinute = activeSession?.pricePerMinute ?? storedPricePerMinute;

  // Call timer — also get raw duration/cost for local fallback in summary
  const { duration: timerDuration, cost: timerCost, formattedDuration, formattedCost } = useCallTimer(
    callStatus === 'connected' ? startTime || undefined : undefined,
    pricePerMinute
  );

  // Refs to capture latest timer values for doEndSession callback
  const timerDurationRef = useRef(timerDuration);
  const timerCostRef = useRef(timerCost);
  timerDurationRef.current = timerDuration;
  timerCostRef.current = timerCost;

  // End session helper — calls API and sets summary (prevents duplicate calls)
  // Uses local timer values as fallback when backend returns 0 (e.g. billing_started_at was null)
  const doEndSession = useCallback(() => {
    if (endSessionCalledRef.current) return;
    endSessionCalledRef.current = true;

    // Capture local timer values at end time for fallback
    const localDuration = timerDurationRef.current;
    const localCost = timerCostRef.current;

    endSession(sessionId, {
      onSuccess: (response) => {
        const data = response.data;
        // Prefer API totalEarnings (astrologer's earnings after commission),
        // fallback to API totalCost, then to locally calculated cost.
        // Use ?? to avoid skipping legitimate 0 values.
        const earnings = data?.totalEarnings ?? data?.totalCost ?? localCost;
        setSessionSummary({
          duration: data?.durationSeconds ?? data?.duration ?? localDuration,
          durationFormatted: data?.durationFormatted,
          totalCost: earnings,
        });
      },
      onError: (error) => {
        // On error, show summary with locally calculated values
        endSessionCalledRef.current = false;
        setSessionSummary({
          duration: localDuration,
          totalCost: localCost,
        });
        addToast({
          type: 'error',
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to end call',
        });
      },
    });
  }, [endSession, sessionId, addToast]);

  // Attach remote participant tracks to a MediaStream
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attachParticipantTracks = useCallback((participant: any) => {
    const stream = new MediaStream();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addTrack = (track: any) => {
      if (track.kind === 'audio' || track.kind === 'video') {
        stream.addTrack(track.mediaStreamTrack);
        setRemoteStream(new MediaStream(stream.getTracks()));
      }
    };

    // Attach existing tracks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participant.tracks.forEach((publication: any) => {
      if (publication.isSubscribed && publication.track) {
        addTrack(publication.track);
      }
    });

    // Listen for new tracks
    participant.on('trackSubscribed', addTrack);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    participant.on('trackUnsubscribed', (track: any) => {
      if (track.mediaStreamTrack) {
        stream.removeTrack(track.mediaStreamTrack);
        setRemoteStream(new MediaStream(stream.getTracks()));
      }
    });
  }, []);

  // Connect to Twilio room — runs once when credentials are available
  useEffect(() => {
    // Guard: skip if no credentials, already connected, or already initiated
    if (!twilioToken || !twilioRoomName || roomRef.current || twilioConnectedRef.current) return;

    // Mark as initiated immediately to prevent duplicate connections from re-renders
    twilioConnectedRef.current = true;

    const token: string = twilioToken;
    const roomName: string = twilioRoomName;

    async function connectToRoom() {
      try {
        const Video = await import('twilio-video');

        setCallStatus('ringing');

        const localTracks = await Video.createLocalTracks({
          audio: true,
          video: false, // Audio-only calls
        });

        const localMediaStream = new MediaStream();
        localTracks.forEach((track) => {
          if ('mediaStreamTrack' in track) {
            localMediaStream.addTrack(track.mediaStreamTrack);
          }
        });
        setLocalStream(localMediaStream);

        const room = await Video.connect(token, {
          name: roomName,
          tracks: localTracks,
        });

        roomRef.current = room;
        setCallStatus('connected');
        setConnectedAt(new Date().toISOString());

        // Confirm connection with backend — triggers billing when both parties confirm
        try {
          const confirmRes = await callService.confirmConnection(sessionId, room.sid);
          if (confirmRes.data?.bothConnected) {
            console.log('[AstrologerCall] Both parties connected — billing started');
          }
        } catch (err) {
          console.warn('[AstrologerCall] Failed to confirm connection (non-critical):', err);
        }

        // Handle existing participants
        room.participants.forEach(attachParticipantTracks);

        // Handle new participants joining
        room.on('participantConnected', attachParticipantTracks);

        // Handle participants leaving — remote party hung up
        room.on('participantDisconnected', () => {
          setRemoteStream(null);
          // Remote participant left → disconnect and auto-end session
          room.disconnect();
        });

        // Handle room disconnection (fires after room.disconnect())
        room.on('disconnected', (_room, error) => {
          setCallStatus('ended');
          roomRef.current = null;
          // Stop ALL local tracks to release microphone/camera
          localTracks.forEach((track) => {
            if ('stop' in track) track.stop();
          });
          if (error) {
            console.warn('Twilio room disconnected with error:', error.message);
          }
          // Auto-end session on backend when room disconnects
          doEndSession();
        });
      } catch (error) {
        twilioConnectedRef.current = false; // Allow retry on error
        if (process.env.NODE_ENV === 'development') console.error('Twilio connect error:', error);

        const isDenied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError');
        addToast({
          type: 'error',
          title: isDenied ? 'Permission Denied' : 'Connection Error',
          message: isDenied
            ? 'Camera/microphone access was denied. Please allow access in your browser settings and reload.'
            : 'Failed to connect to call. Please try again.',
        });
      }
    }

    connectToRoom();
  }, [twilioToken, twilioRoomName, attachParticipantTracks, addToast, doEndSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      localStream?.getTracks().forEach(track => track.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time events via Supabase Broadcast
  useEffect(() => {
    if (!user?.id || !sessionId) return;

    // Supabase: billing events
    const unsubBilling = supabaseRealtime.subscribeToBillingEvents(user.id, {
      onLowBalance: (payload) => {
        if (payload.sessionId === sessionId) {
          addToast({
            type: 'warning',
            title: 'Low Balance',
            message: `Only ${payload.remainingMinutes ?? 0} minute(s) remaining.`,
          });
        }
      },
      onCallEndedBalance: (payload) => {
        if (payload.sessionId === sessionId) {
          setCallStatus('ended');
          if (roomRef.current) {
            roomRef.current.disconnect();
            roomRef.current = null;
          }
          addToast({
            type: 'error',
            title: 'Call Ended',
            message: 'Call ended due to insufficient balance.',
          });
          refetchSession();
        }
      },
      onCallEnded: (payload) => {
        if (payload.sessionId === sessionId && callStatusRef.current !== 'ended') {
          setCallStatus('ended');
          if (roomRef.current) {
            roomRef.current.disconnect();
            roomRef.current = null;
          }
          if (payload.duration != null && payload.totalCost != null) {
            setSessionSummary({
              duration: payload.duration,
              durationFormatted: payload.durationFormatted,
              totalCost: payload.totalCost,
            });
          }
          refetchSession();
        }
      },
      onBothConnected: (payload) => {
        if (payload.sessionId === sessionId) {
          setCallStatus('connected');
        }
      },
    });

    // Supabase: session updates (user ends call)
    const unsubSession = supabaseRealtime.subscribeToSessionUpdate(sessionId, (payload) => {
      if ((payload.status === 'completed' || payload.status === 'cancelled') && callStatusRef.current !== 'ended') {
        setCallStatus('ended');
        if (roomRef.current) {
          roomRef.current.disconnect();
          roomRef.current = null;
        }
        if (payload.duration != null && payload.totalCost != null) {
          setSessionSummary({
            duration: payload.duration,
            totalCost: payload.totalCost,
          });
        }
        addToast({
          type: 'info',
          title: 'Call Ended',
          message: 'The user has ended the call session.',
        });
      }
    });

    return () => {
      unsubBilling();
      unsubSession();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, sessionId]);

  // Handle mute toggle
  const handleToggleMute = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.localParticipant.audioTracks.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (publication: any) => {
          if (isMuted) {
            publication.track.enable();
          } else {
            publication.track.disable();
          }
        }
      );
    }
    setIsMuted(prev => !prev);
  }, [isMuted]);

  // Handle video toggle (no-op for audio-only calls)
  const handleToggleVideo = useCallback(() => {
    // Audio-only platform — no video tracks to toggle
  }, []);

  // Handle speaker toggle
  const handleToggleSpeaker = useCallback(() => {
    setIsSpeakerOn(prev => !prev);
  }, []);

  // Handle end call (user clicks End button)
  const handleEndCall = useCallback(() => {
    setCallStatus('ended');

    // Disconnect from Twilio room
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    // Stop local media
    localStream?.getTracks().forEach(track => track.stop());

    // End session on backend
    doEndSession();
  }, [localStream, doEndSession]);

  // Handle close summary / navigate to dashboard
  const handleCloseSummary = useCallback(() => {
    router.push('/astrologer/dashboard');
  }, [router]);

  // Loading state
  if (isSessionLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-4">
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        <Skeleton className="w-32 h-6 mb-2" />
        <Skeleton className="w-20 h-4" />
      </div>
    );
  }

  // Error state
  if (sessionError && !activeSession) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-status-error" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">
          Session Not Found
        </h2>
        <p className="text-white/70 text-center mb-4">
          {sessionError instanceof Error
            ? sessionError.message
            : 'Unable to load call session.'}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetchSession()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button variant="primary" onClick={() => router.push('/astrologer/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CallInterface
      sessionId={sessionId}
      astrologerId=""
      astrologerName={storedUserName}
      astrologerImage={storedUserImage}
      callType={callType}
      status={callStatus}
      duration={formattedDuration}
      cost={formattedCost}
      localStream={localStream}
      remoteStream={remoteStream}
      isLocalVideoEnabled={false}
      isRemoteVideoEnabled={false}
      isMuted={isMuted}
      isSpeakerOn={isSpeakerOn}
      sessionSummary={sessionSummary || undefined}
      costLabel="Amount Received"
      isAstrologer={true}
      onToggleMute={handleToggleMute}
      onToggleVideo={handleToggleVideo}
      onToggleSpeaker={handleToggleSpeaker}
      onEndCall={handleEndCall}
      onClose={handleCloseSummary}
      isLoading={isSessionLoading}
    />
  );
}
