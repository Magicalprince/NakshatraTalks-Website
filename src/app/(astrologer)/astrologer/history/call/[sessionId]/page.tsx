'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallInterface } from '@/components/features/call';
import { useCallSession, useCallTimer } from '@/hooks/useCallSession';
import { useUIStore } from '@/stores/ui-store';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AstrologerCallSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { addToast } = useUIStore();

  // Call controls state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream] = useState<MediaStream | null>(null);

  // Fetch session data
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useCallSession(sessionId);

  // Extract session info
  const session = sessionData?.session;
  const user = sessionData?.user;
  // Map ChatSession status to CallInterface status
  const callStatusMap: Record<string, 'connecting' | 'ringing' | 'connected' | 'ended'> = {
    active: 'connected',
    completed: 'ended',
    cancelled: 'ended',
  };
  const callStatus = session?.status ? callStatusMap[session.status] || 'connecting' : 'connecting';
  // Use sessionType from ChatSession, mapping 'call' to 'audio' and 'video' to 'video'
  const callType = (session?.sessionType === 'video' ? 'video' : 'audio') as 'audio' | 'video';

  // Timer for duration tracking (only when connected)
  const startTimeForTimer = callStatus === 'connected' ? session?.startTime : undefined;
  const { formattedDuration, cost, formattedCost } = useCallTimer(
    startTimeForTimer,
    session?.pricePerMinute || 0
  );

  // Initialize media streams
  useEffect(() => {
    const initMedia = async () => {
      if (callStatus !== 'connected') return;

      try {
        const constraints = {
          audio: true,
          video: callType === 'video',
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
      } catch {
        addToast({
          type: 'error',
          title: 'Media Access Error',
          message: 'Could not access your camera or microphone.',
        });
      }
    };

    initMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus, callType, addToast]);

  // Handle mute toggle
  const handleToggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  }, [localStream, isMuted]);

  // Handle video toggle
  const handleToggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoEnabled(!isVideoEnabled);
  }, [localStream, isVideoEnabled]);

  // Handle speaker toggle
  const handleToggleSpeaker = useCallback(() => {
    setIsSpeakerOn(!isSpeakerOn);
    // In real implementation, this would route audio to speaker
  }, [isSpeakerOn]);

  // Handle end call
  const handleEndCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    // In real implementation, call API to end session
    addToast({
      type: 'success',
      title: 'Call Ended',
      message: 'The call session has been ended.',
    });
    router.push('/astrologer/history');
  }, [localStream, addToast, router]);

  // Handle session end
  const handleSessionEnd = useCallback(() => {
    router.push('/astrologer/history');
  }, [router]);

  // Loading state
  if (isSessionLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center">
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        <Skeleton className="w-32 h-5 mb-2" />
        <Skeleton className="w-24 h-4" />
      </div>
    );
  }

  // Error state
  if (sessionError || !session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-offWhite p-4">
        <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-status-error" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Session Not Found
        </h2>
        <p className="text-text-secondary text-center mb-4">
          {sessionError instanceof Error
            ? sessionError.message
            : 'Unable to load call session.'}
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetchSession()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button variant="primary" onClick={() => router.push('/astrologer/history')}>
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  // Build session summary for ended sessions
  const sessionSummary =
    session.status === 'completed' && session.duration
      ? {
          duration: session.duration,
          durationFormatted: formattedDuration,
          totalCost: cost,
        }
      : undefined;

  return (
    <CallInterface
      sessionId={sessionId}
      astrologerId=""
      astrologerName={user?.name || 'User'}
      astrologerImage={user?.image}
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
      sessionSummary={sessionSummary}
      onToggleMute={handleToggleMute}
      onToggleVideo={handleToggleVideo}
      onToggleSpeaker={handleToggleSpeaker}
      onEndCall={handleEndCall}
      onStartNewCall={handleSessionEnd}
    />
  );
}
