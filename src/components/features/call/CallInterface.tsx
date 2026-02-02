'use client';

import { useState, useCallback } from 'react';
import { CallControls } from './CallControls';
import { CallHeader } from './CallHeader';
import { VideoPlayer, PipVideo } from './VideoPlayer';
import { CallSummary } from './CallSummary';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';

interface CallInterfaceProps {
  sessionId: string;
  astrologerId: string;
  astrologerName: string;
  astrologerImage?: string;
  callType: 'audio' | 'video';
  status: 'connecting' | 'ringing' | 'connected' | 'ended';
  duration: string;
  cost?: string;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  isLocalVideoEnabled?: boolean;
  isRemoteVideoEnabled?: boolean;
  isMuted: boolean;
  isSpeakerOn: boolean;
  sessionSummary?: {
    duration: number;
    durationFormatted?: string;
    totalCost: number;
  };
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  onFlipCamera?: () => void;
  onStartNewCall?: () => void;
  isLoading?: boolean;
}

export function CallInterface({
  sessionId,
  astrologerId,
  astrologerName,
  astrologerImage,
  callType,
  status,
  duration,
  cost,
  localStream,
  remoteStream,
  isLocalVideoEnabled = true,
  isRemoteVideoEnabled = true,
  isMuted,
  isSpeakerOn,
  sessionSummary,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onEndCall,
  onFlipCamera,
  onStartNewCall,
  isLoading,
}: CallInterfaceProps) {
  const [, setIsFullscreen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const isVideoCall = callType === 'video';

  // Handle fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Show summary when call ends
  const handleEndCall = useCallback(() => {
    onEndCall();
    if (status === 'connected') {
      setShowSummary(true);
    }
  }, [onEndCall, status]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center">
        <Skeleton className="w-24 h-24 rounded-full mb-4" />
        <Skeleton className="w-32 h-5 mb-2" />
        <Skeleton className="w-24 h-4" />
      </div>
    );
  }

  // Call Summary Modal
  if (showSummary && sessionSummary) {
    return (
      <CallSummary
        sessionId={sessionId}
        astrologerId={astrologerId}
        astrologerName={astrologerName}
        astrologerImage={astrologerImage}
        callType={callType}
        duration={sessionSummary.duration}
        durationFormatted={sessionSummary.durationFormatted}
        totalCost={sessionSummary.totalCost}
        onStartNewCall={onStartNewCall}
        onClose={() => setShowSummary(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900">
      {/* Background - Gradient for audio, remote video for video calls */}
      {isVideoCall && status === 'connected' ? (
        // Video Call - Remote Video as Background
        <VideoPlayer
          stream={remoteStream}
          isVideoEnabled={isRemoteVideoEnabled}
          participantName={astrologerName}
          className="absolute inset-0"
        />
      ) : (
        // Audio Call or Connecting - Gradient Background
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary/80" />
      )}

      {/* Call Header - Shows for audio calls and when connecting */}
      {(!isVideoCall || status !== 'connected') && (
        <CallHeader
          astrologerName={astrologerName}
          astrologerImage={astrologerImage}
          callType={callType}
          duration={duration}
          cost={cost}
          status={status}
          className="relative z-10"
        />
      )}

      {/* Local Video PiP (Video calls only) */}
      {isVideoCall && status === 'connected' && (
        <PipVideo
          stream={localStream}
          isVideoEnabled={isLocalVideoEnabled}
        />
      )}

      {/* Timer and Cost Overlay for Video Calls */}
      {isVideoCall && status === 'connected' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 left-4 z-10"
        >
          <div className="flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-sm rounded-lg">
            <span className="text-white font-mono">{duration}</span>
            {cost && (
              <>
                <span className="text-white/50">|</span>
                <span className="text-white">{cost}</span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Call Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
        <CallControls
          isMuted={isMuted}
          isVideoEnabled={isLocalVideoEnabled}
          isSpeakerOn={isSpeakerOn}
          isVideoCall={isVideoCall}
          onToggleMute={onToggleMute}
          onToggleVideo={onToggleVideo}
          onToggleSpeaker={onToggleSpeaker}
          onEndCall={handleEndCall}
          onFlipCamera={onFlipCamera}
          onToggleFullscreen={handleToggleFullscreen}
          disabled={status !== 'connected'}
        />
      </div>

      {/* Connecting/Ringing Overlay */}
      {(status === 'connecting' || status === 'ringing') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-5"
        >
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                className="w-16 h-16 bg-white/20 rounded-full"
              />
            </motion.div>
            <p className="text-white text-lg">
              {status === 'connecting' ? 'Connecting...' : 'Ringing...'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
