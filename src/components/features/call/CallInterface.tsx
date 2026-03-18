'use client';

/**
 * CallInterface — Full-screen immersive call experience
 *
 * Cosmic dark theme with animated star field, pulsing rings around avatar,
 * glassmorphic floating controls. Handles audio, video, connecting, and ended states.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  onClose?: () => void;
  isLoading?: boolean;
  /** Label for cost in summary — "Total Cost" (user side) or "Amount Received" (astrologer side) */
  costLabel?: string;
  /** Hide rate/review in summary for astrologer side */
  isAstrologer?: boolean;
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
  onClose,
  isLoading,
  costLabel,
  isAstrologer = false,
}: CallInterfaceProps) {
  const [showSummary, setShowSummary] = useState(false);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const isVideoCall = callType === 'video';
  const isConnected = status === 'connected';
  const isPreConnect = status === 'connecting' || status === 'ringing';

  const isEnded = status === 'ended';

  // Play remote audio stream (essential for audio calls — video calls use <video> element)
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream ?? null;
    }
  }, [remoteStream]);

  // Speaker toggle: mute/unmute the remote audio element
  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !isSpeakerOn;
    }
  }, [isSpeakerOn]);

  // End call — triggers onEndCall which calls API; summary shows via auto-show effect
  const handleEndCall = useCallback(() => {
    onEndCall();
  }, [onEndCall]);

  // Auto-show summary on external call termination (remote disconnect, low balance, etc.)
  useEffect(() => {
    if (isEnded && sessionSummary && !showSummary) {
      setShowSummary(true);
    }
  }, [isEnded, sessionSummary, showSummary]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #070B14 0%, #0F1629 40%, #151D35 100%)' }}
      >
        <Skeleton className="w-28 h-28 rounded-full mb-6 bg-white/10" />
        <Skeleton className="w-36 h-5 mb-2 bg-white/10" />
        <Skeleton className="w-24 h-4 bg-white/10" />
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
        costLabel={costLabel}
        isAstrologer={isAstrologer}
        onStartNewCall={onStartNewCall}
        onClose={onClose || (() => setShowSummary(false))}
      />
    );
  }

  // Video call (connected) — remote video background
  if (isVideoCall && isConnected) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        {/* Remote video as background */}
        <VideoPlayer
          stream={remoteStream}
          muted={!isSpeakerOn}
          isVideoEnabled={isRemoteVideoEnabled}
          participantName={astrologerName}
          className="absolute inset-0"
        />

        {/* Local PiP */}
        <PipVideo
          stream={localStream}
          isVideoEnabled={isLocalVideoEnabled}
        />

        {/* Top overlay — timer & cost */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex items-center gap-3 px-5 py-2.5 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-mono text-sm tracking-wide">{duration}</span>
            </div>
            {cost && (
              <>
                <span className="w-px h-4 bg-white/20" />
                <span className="text-white/80 text-sm font-medium">{cost}</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-10">
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
            disabled={isEnded}
          />
        </div>
      </div>
    );
  }

  // Audio call / video pre-connect — full cosmic immersive screen
  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Hidden audio player for remote stream (audio calls have no <video> element) */}
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />

      {/* Deep cosmic gradient background */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #070B14 0%, #0D1221 30%, #111B33 60%, #0F1629 100%)' }}
      />

      {/* Ambient radial glow behind avatar area */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 40%, transparent 70%)',
            animation: 'nt-glow-pulse 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Star field */}
      <StarField />

      {/* Main content - centered vertically */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full">
        {/* Spacer top */}
        <div className="flex-shrink-0 h-16" />

        {/* Center content — avatar, name, status, timer */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <CallHeader
            astrologerName={astrologerName}
            astrologerImage={astrologerImage}
            callType={callType}
            duration={duration}
            cost={cost}
            status={status}
          />
        </div>

        {/* Bottom controls */}
        <div className="flex-shrink-0 pb-10 w-full">
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
            disabled={isPreConnect || isEnded}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Star Field Background ──────────────────────────────────────────

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.8 + 0.4,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2.5,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animation: `nt-twinkle ${star.duration}s ${star.delay}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}
