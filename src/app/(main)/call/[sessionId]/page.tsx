'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallInterface } from '@/components/features/call';
import {
  useCallSession,
  useEndCallSession,
  useCallTimer,
} from '@/hooks/useCallSession';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

type CallStatus = 'connecting' | 'ringing' | 'connected' | 'ended';

export default function CallSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { addToast } = useUIStore();

  // Local state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [sessionSummary, setSessionSummary] = useState<{
    duration: number;
    durationFormatted?: string;
    totalCost: number;
  } | null>(null);

  // Fetch session data
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useCallSession(sessionId);

  // End session mutation
  const { mutate: endSession } = useEndCallSession(sessionId);

  // Extract session info
  const session = sessionData?.session;
  const astrologer = sessionData?.astrologer;
  // Note: twilioData would be used in production for Twilio Video SDK integration
  // const twilioData = sessionData?.twilio;
  const callType = (session?.sessionType === 'video' ? 'video' : 'audio') as 'audio' | 'video';

  // Call timer
  const { formattedDuration, formattedCost } = useCallTimer(
    callStatus === 'connected' ? session?.startTime : undefined,
    session?.pricePerMinute
  );

  // Initialize media streams
  const initializeMedia = useCallback(async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === 'video',
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // In a real implementation, this would connect to Twilio
      // For now, we'll simulate the connection
      setCallStatus('ringing');

      // Simulate connection after 2 seconds
      setTimeout(() => {
        setCallStatus('connected');
      }, 2000);
    } catch (error) {
      console.error('Failed to get media devices:', error);
      addToast({
        type: 'error',
        title: 'Media Error',
        message: 'Failed to access camera/microphone. Please check permissions.',
      });
    }
  }, [callType, addToast]);

  // Initialize on mount
  useEffect(() => {
    if (sessionData && !localStream) {
      initializeMedia();
    }
  }, [sessionData, localStream, initializeMedia]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all tracks
      localStream?.getTracks().forEach(track => track.stop());
      remoteStream?.getTracks().forEach(track => track.stop());
    };
  }, [localStream, remoteStream]);

  // Handle mute toggle
  const handleToggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(prev => !prev);
    }
  }, [localStream]);

  // Handle video toggle
  const handleToggleVideo = useCallback(() => {
    if (localStream && callType === 'video') {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(prev => !prev);
    }
  }, [localStream, callType]);

  // Handle speaker toggle
  const handleToggleSpeaker = useCallback(() => {
    // In a real implementation, this would switch audio output
    setIsSpeakerOn(prev => !prev);
  }, []);

  // Handle end call
  const handleEndCall = useCallback(() => {
    setCallStatus('ended');

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
    if (!localStream || callType !== 'video') return;

    try {
      // Get current video track settings
      const videoTrack = localStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const currentFacingMode = settings.facingMode;

      // Stop current track
      videoTrack.stop();

      // Get new stream with opposite facing mode
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      });

      // Replace video track
      const newVideoTrack = newStream.getVideoTracks()[0];
      localStream.removeTrack(videoTrack);
      localStream.addTrack(newVideoTrack);

      // In Twilio, you would also need to update the published track
    } catch (error) {
      console.error('Failed to flip camera:', error);
      addToast({
        type: 'error',
        title: 'Camera Error',
        message: 'Failed to switch camera',
      });
    }
  }, [localStream, callType, addToast]);

  // Handle start new call
  const handleStartNewCall = useCallback(() => {
    if (astrologer?.id) {
      router.push(`/astrologer/${astrologer.id}`);
    }
  }, [astrologer?.id, router]);

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
