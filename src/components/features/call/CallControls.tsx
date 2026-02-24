'use client';

/**
 * CallControls — Glassmorphic floating control bar.
 *
 * Features:
 * - Clear active/inactive states (muted = red-tinted, unmuted = normal)
 * - End call button always enabled (even during connecting)
 * - Labeled icons for clarity
 * - Framer Motion tap animations
 */

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface CallControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  isVideoCall: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  onFlipCamera?: () => void;
  disabled?: boolean;
  className?: string;
}

export function CallControls({
  isMuted,
  isVideoEnabled,
  isSpeakerOn,
  isVideoCall,
  onToggleMute,
  onToggleVideo,
  onToggleSpeaker,
  onEndCall,
  onFlipCamera,
  disabled = false,
  className,
}: CallControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('flex justify-center px-6', className)}
    >
      <div className="flex items-end gap-3 px-6 py-4 bg-white/[0.06] backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Mute */}
        <ControlButton
          icon={isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          label={isMuted ? 'Unmute' : 'Mute'}
          isOff={isMuted}
          onClick={onToggleMute}
          disabled={disabled}
        />

        {/* Video (video calls only) */}
        {isVideoCall && (
          <ControlButton
            icon={isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            label={isVideoEnabled ? 'Camera' : 'Camera'}
            isOff={!isVideoEnabled}
            onClick={onToggleVideo}
            disabled={disabled}
          />
        )}

        {/* End Call — always enabled */}
        <div className="flex flex-col items-center gap-1.5 mx-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={onEndCall}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 text-white shadow-[0_0_24px_rgba(239,68,68,0.4)] hover:bg-red-600 transition-colors"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </motion.button>
          <span className="text-[10px] text-red-400/80 font-medium tracking-wide">End</span>
        </div>

        {/* Speaker */}
        <ControlButton
          icon={isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          label="Speaker"
          isOff={!isSpeakerOn}
          onClick={onToggleSpeaker}
          disabled={disabled}
        />

        {/* Flip Camera (video calls, camera enabled) */}
        {isVideoCall && isVideoEnabled && onFlipCamera && (
          <ControlButton
            icon={<RotateCcw className="w-5 h-5" />}
            label="Flip"
            isOff={false}
            onClick={onFlipCamera}
            disabled={disabled}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─── Individual Control Button ──────────────────────────────────────

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  isOff: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ControlButton({ icon, label, isOff, onClick, disabled }: ControlButtonProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
          isOff
            ? 'bg-white/[0.12] text-red-400 ring-1 ring-red-400/20'
            : 'bg-white/[0.12] text-white hover:bg-white/[0.18]',
          disabled && 'opacity-40 cursor-not-allowed hover:bg-white/[0.12]'
        )}
        title={label}
      >
        {icon}
      </motion.button>
      <span
        className={cn(
          'text-[10px] font-medium tracking-wide',
          isOff ? 'text-red-400/60' : 'text-white/40',
          disabled && 'opacity-40'
        )}
      >
        {label}
      </span>
    </div>
  );
}
