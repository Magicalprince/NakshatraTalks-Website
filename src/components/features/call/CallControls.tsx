'use client';

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Maximize2,
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
  onToggleFullscreen?: () => void;
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
  onToggleFullscreen,
  disabled = false,
  className,
}: CallControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center justify-center gap-4 p-4 bg-black/50 backdrop-blur-sm rounded-full',
        className
      )}
    >
      {/* Mute Button */}
      <ControlButton
        icon={isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        isActive={!isMuted}
        onClick={onToggleMute}
        disabled={disabled}
        label={isMuted ? 'Unmute' : 'Mute'}
      />

      {/* Video Button (only for video calls) */}
      {isVideoCall && (
        <ControlButton
          icon={isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          isActive={isVideoEnabled}
          onClick={onToggleVideo}
          disabled={disabled}
          label={isVideoEnabled ? 'Camera Off' : 'Camera On'}
        />
      )}

      {/* End Call Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onEndCall}
        disabled={disabled}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center',
          'bg-status-error text-white shadow-lg',
          'hover:bg-status-error/90 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        title="End Call"
      >
        <PhoneOff className="w-7 h-7" />
      </motion.button>

      {/* Speaker Button */}
      <ControlButton
        icon={isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        isActive={isSpeakerOn}
        onClick={onToggleSpeaker}
        disabled={disabled}
        label={isSpeakerOn ? 'Speaker Off' : 'Speaker On'}
      />

      {/* Flip Camera (only for video calls with camera enabled) */}
      {isVideoCall && isVideoEnabled && onFlipCamera && (
        <ControlButton
          icon={<RotateCcw className="w-6 h-6" />}
          isActive={true}
          onClick={onFlipCamera}
          disabled={disabled}
          label="Flip Camera"
        />
      )}

      {/* Fullscreen Button */}
      {onToggleFullscreen && (
        <ControlButton
          icon={<Maximize2 className="w-6 h-6" />}
          isActive={true}
          onClick={onToggleFullscreen}
          disabled={disabled}
          label="Fullscreen"
        />
      )}
    </motion.div>
  );
}

// Individual control button
interface ControlButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}

function ControlButton({ icon, isActive, onClick, disabled, label }: ControlButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
        isActive
          ? 'bg-white/20 text-white hover:bg-white/30'
          : 'bg-white/10 text-white/70 hover:bg-white/20',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      title={label}
    >
      {icon}
    </motion.button>
  );
}
