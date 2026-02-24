'use client';

/**
 * VideoPlayer & PipVideo — Video stream rendering with dark-themed fallbacks.
 */

import { useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { User, VideoOff } from 'lucide-react';

interface VideoPlayerProps {
  stream?: MediaStream | null;
  muted?: boolean;
  isLocal?: boolean;
  isVideoEnabled?: boolean;
  participantName?: string;
  className?: string;
}

export function VideoPlayer({
  stream,
  muted = false,
  isLocal = false,
  isVideoEnabled = true,
  participantName,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Video disabled / no stream placeholder
  if (!isVideoEnabled || !stream) {
    return (
      <div
        className={cn(
          'relative flex items-center justify-center',
          className
        )}
        style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #111B33 100%)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 bg-white/[0.06] rounded-full flex items-center justify-center border border-white/[0.08]">
            {isVideoEnabled ? (
              <User className="w-12 h-12 text-white/20" />
            ) : (
              <VideoOff className="w-10 h-10 text-white/20" />
            )}
          </div>
          {participantName && (
            <span className="text-white/50 text-sm font-medium">{participantName}</span>
          )}
          {!isVideoEnabled && (
            <span className="text-white/25 text-xs">Camera Off</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('relative overflow-hidden bg-black', className)}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={cn(
          'w-full h-full object-cover',
          isLocal && 'transform scale-x-[-1]'
        )}
      />

      {/* Participant name overlay */}
      {participantName && (
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
          {participantName}
          {isLocal && ' (You)'}
        </div>
      )}
    </motion.div>
  );
}

// ─── Picture-in-Picture Local Video ─────────────────────────────────

interface PipVideoProps {
  stream?: MediaStream | null;
  isVideoEnabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PipVideo({
  stream,
  isVideoEnabled = true,
  onClick,
  className,
}: PipVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={cn(
        'absolute top-6 right-6 w-32 h-44 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer z-20',
        'border-2 border-white/15',
        className
      )}
    >
      {isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(180deg, #111B33 0%, #0D1221 100%)' }}
        >
          <div className="w-12 h-12 bg-white/[0.06] rounded-full flex items-center justify-center border border-white/[0.08]">
            <User className="w-6 h-6 text-white/25" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
