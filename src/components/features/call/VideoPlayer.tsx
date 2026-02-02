'use client';

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

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Video disabled placeholder
  if (!isVideoEnabled || !stream) {
    return (
      <div
        className={cn(
          'relative bg-gray-900 flex items-center justify-center',
          className
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
            {isVideoEnabled ? (
              <User className="w-10 h-10 text-gray-400" />
            ) : (
              <VideoOff className="w-10 h-10 text-gray-400" />
            )}
          </div>
          {participantName && (
            <span className="text-white text-sm">{participantName}</span>
          )}
          {!isVideoEnabled && (
            <span className="text-gray-400 text-xs">Camera Off</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn('relative overflow-hidden bg-gray-900', className)}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={cn(
          'w-full h-full object-cover',
          isLocal && 'transform scale-x-[-1]' // Mirror local video
        )}
      />

      {/* Participant Name Overlay */}
      {participantName && (
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-sm">
          {participantName}
          {isLocal && ' (You)'}
        </div>
      )}
    </motion.div>
  );
}

// Picture-in-Picture local video
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
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={cn(
        'absolute top-4 right-4 w-32 h-48 rounded-xl overflow-hidden shadow-lg cursor-pointer',
        'border-2 border-white/30',
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
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
