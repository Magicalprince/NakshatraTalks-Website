'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallInterface } from '@/components/features/call';
import {
  useCallSession,
  useTwilioToken,
  useEndCallSession,
  useCallTimer,
} from '@/hooks/useCallSession';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';

type CallStatus = 'connecting' | 'ringing' | 'connected' | 'ended';

export default function CallSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { addToast } = useUIStore();

  // Auth check
  const { isReady } = useRequireAuth();

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

  // Fetch session data
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useCallSession(sessionId);

  // Fetch Twilio token
  const { data: twilioTokenData } = useTwilioToken(sessionId);

  // End session mutation
  const { mutate: endSession } = useEndCallSession(sessionId);

  // Extract session info
  const session = sessionData?.session;
  const astrologer = sessionData?.astrologer;
  const callType = (session?.sessionType === 'video' ? 'video' : 'audio') as 'audio' | 'video';

  // Call timer
  const { formattedDuration, formattedCost } = useCallTimer(
    callStatus === 'connected' ? session?.startTime : undefined,
    session?.pricePerMinute
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

  // Connect to Twilio room
  useEffect(() => {
    if (!twilioTokenData?.token || !twilioTokenData?.roomName || roomRef.current) return;

    // Capture as non-null for closure
    const twilioToken: string = twilioTokenData.token;
    const twilioRoomName: string = twilioTokenData.roomName;
    let cancelled = false;

    async function connectToRoom() {
      try {
        // Dynamically import twilio-video (browser-only)
        const Video = await import('twilio-video');

        setCallStatus('ringing');

        const localTracks = await Video.createLocalTracks({
          audio: true,
          video: callType === 'video',
        });

        // Set local stream from local tracks
        const localMediaStream = new MediaStream();
        localTracks.forEach((track) => {
          if ('mediaStreamTrack' in track) {
            localMediaStream.addTrack(track.mediaStreamTrack);
          }
        });
        if (!cancelled) {
          setLocalStream(localMediaStream);
        }

        // Connect to the Twilio room
        const room = await Video.connect(twilioToken, {
          name: twilioRoomName,
          tracks: localTracks,
        });

        if (cancelled) {
          room.disconnect();
          return;
        }

        roomRef.current = room;
        setCallStatus('connected');

        // Handle existing participants
        room.participants.forEach(attachParticipantTracks);

        // Handle new participants joining
        room.on('participantConnected', attachParticipantTracks);

        // Handle participants leaving
        room.on('participantDisconnected', () => {
          setRemoteStream(null);
        });

        // Handle room disconnection
        room.on('disconnected', () => {
          setCallStatus('ended');
          localTracks.forEach((track) => {
            if ('stop' in track) track.stop();
          });
        });
      } catch (error) {
        if (cancelled) return;
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

    return () => {
      cancelled = true;
    };
  }, [twilioTokenData, callType, attachParticipantTracks, addToast]);

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

    endSession(undefined, {
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
  }, [localStream, endSession, addToast]);

  // Handle flip camera
  const handleFlipCamera = useCallback(async () => {
    if (!roomRef.current || callType !== 'video') return;

    try {
      const Video = await import('twilio-video');

      // Get current local video track
      const localParticipant = roomRef.current.localParticipant;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let currentPublication: any = null;
      localParticipant.videoTracks.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pub: any) => { currentPublication = pub; }
      );

      if (!currentPublication?.track) return;

      const settings = currentPublication.track.mediaStreamTrack.getSettings();
      const currentFacingMode = settings.facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      // Stop and unpublish old track
      currentPublication.track.stop();
      localParticipant.unpublishTrack(currentPublication.track);

      // Create new track with opposite facing mode
      const newTrack = await Video.createLocalVideoTrack({
        facingMode: newFacingMode,
      });

      // Publish new track
      localParticipant.publishTrack(newTrack);

      // Update local stream
      const newStream = new MediaStream([newTrack.mediaStreamTrack]);
      localParticipant.audioTracks.forEach(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pub: any) => {
          if (pub.track) newStream.addTrack(pub.track.mediaStreamTrack);
        }
      );
      setLocalStream(newStream);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to flip camera:', error);
      addToast({
        type: 'error',
        title: 'Camera Error',
        message: 'Failed to switch camera',
      });
    }
  }, [callType, addToast]);

  // Handle start new call
  const handleStartNewCall = useCallback(() => {
    if (astrologer?.id) {
      router.push(`/astrologer/${astrologer.id}`);
    }
  }, [astrologer?.id, router]);

  // Auth loading state
  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center p-4">
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        <Skeleton className="w-32 h-6 mb-2" />
        <Skeleton className="w-20 h-4" />
      </div>
    );
  }

  // Error state
  if (sessionError && !isSessionLoading) {
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
          <Button variant="primary" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CallInterface
      sessionId={sessionId}
      astrologerId={astrologer?.id || session?.astrologerId || ''}
      astrologerName={astrologer?.name || session?.astrologerName || 'Astrologer'}
      astrologerImage={astrologer?.image}
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
      onFlipCamera={handleFlipCamera}
      onStartNewCall={handleStartNewCall}
      isLoading={isSessionLoading}
    />
  );
}
