'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallInterface } from '@/components/features/call';
import {
  useActiveCall,
  useEndCallSessionAstrologer,
} from '@/hooks/useAstrologerDashboard';
import { useCallTimer } from '@/hooks/useCallSession';
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
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [sessionSummary, setSessionSummary] = useState<{
    duration: number;
    durationFormatted?: string;
    totalCost: number;
  } | null>(null);

  // Twilio room reference
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roomRef = useRef<any>(null);
  const callStatusRef = useRef<CallStatus>(callStatus);
  callStatusRef.current = callStatus;

  // Track whether Twilio connection has been initiated (prevent re-connection on re-renders)
  const twilioConnectedRef = useRef(false);

  // Fetch active session via astrologer endpoint
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

  // Extract session info from ActiveSession
  const sessionUser = activeSession?.user;
  // Default to audio — callType only used at connection time, so stable ref is fine
  const callType = (activeSession?.twilioRoomName ? 'video' : 'audio') as 'audio' | 'video';
  const callTypeRef = useRef(callType);
  callTypeRef.current = callType;

  // Call timer
  const { formattedDuration, formattedCost } = useCallTimer(
    callStatus === 'connected' ? activeSession?.startTime : undefined,
    activeSession?.pricePerMinute
  );

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
          video: callTypeRef.current === 'video',
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

        // Handle existing participants
        room.participants.forEach(attachParticipantTracks);

        // Handle new participants joining
        room.on('participantConnected', attachParticipantTracks);

        // Handle participants leaving — remote party hung up, end the call
        room.on('participantDisconnected', () => {
          setRemoteStream(null);
          // Remote participant left → disconnect our side too
          room.disconnect();
        });

        // Handle room disconnection (fires after room.disconnect() or remote disconnect)
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
  }, [twilioToken, twilioRoomName, attachParticipantTracks, addToast]);

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

  // Handle video toggle
  const handleToggleVideo = useCallback(() => {
    if (roomRef.current && callType === 'video') {
      roomRef.current.localParticipant.videoTracks.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (publication: any) => {
          if (isVideoEnabled) {
            publication.track.disable();
          } else {
            publication.track.enable();
          }
        }
      );
    }
    setIsVideoEnabled(prev => !prev);
  }, [isVideoEnabled, callType]);

  // Handle speaker toggle
  const handleToggleSpeaker = useCallback(() => {
    setIsSpeakerOn(prev => !prev);
  }, []);

  // Handle end call
  const handleEndCall = useCallback(() => {
    setCallStatus('ended');

    // Disconnect from Twilio room
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }

    // Stop local media
    localStream?.getTracks().forEach(track => track.stop());

    endSession(sessionId, {
      onSuccess: (response) => {
        if (response.data) {
          setSessionSummary({
            duration: response.data.durationSeconds || response.data.duration,
            totalCost: response.data.totalCost,
          });
        }
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to end call',
        });
      },
    });
  }, [localStream, endSession, sessionId, addToast]);

  // Handle back to dashboard
  const handleBackToDashboard = useCallback(() => {
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
      astrologerName={sessionUser?.name || 'User'}
      astrologerImage={sessionUser?.image || undefined}
      callType={callType}
      status={callStatus}
      duration={formattedDuration}
      cost={formattedCost}
      localStream={localStream}
      remoteStream={remoteStream}
      isLocalVideoEnabled={isVideoEnabled}
      isRemoteVideoEnabled={true}
      isMuted={isMuted}
      isSpeakerOn={isSpeakerOn}
      sessionSummary={sessionSummary || undefined}
      onToggleMute={handleToggleMute}
      onToggleVideo={handleToggleVideo}
      onToggleSpeaker={handleToggleSpeaker}
      onEndCall={handleEndCall}
      onStartNewCall={handleBackToDashboard}
      isLoading={isSessionLoading}
    />
  );
}
