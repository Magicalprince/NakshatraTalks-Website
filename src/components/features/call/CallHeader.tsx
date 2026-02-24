'use client';

/**
 * CallHeader — Avatar with animated rings, name, status, and live metrics.
 *
 * Connecting/Ringing: Concentric expanding ring pulses radiating outward.
 * Connected: Static glowing ring + green status dot, live timer & cost.
 * Ended: Dimmed state.
 */

import { Avatar } from '@/components/ui/Avatar';
import { Clock, IndianRupee, Phone, Video } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface CallHeaderProps {
  astrologerName: string;
  astrologerImage?: string;
  callType: 'audio' | 'video';
  duration: string;
  cost?: string;
  status: 'connecting' | 'ringing' | 'connected' | 'ended';
  className?: string;
}

export function CallHeader({
  astrologerName,
  astrologerImage,
  callType,
  duration,
  cost,
  status,
  className,
}: CallHeaderProps) {
  const isPreConnect = status === 'connecting' || status === 'ringing';
  const isConnected = status === 'connected';
  const isEnded = status === 'ended';

  // Status text & icon
  const getStatusInfo = () => {
    switch (status) {
      case 'connecting':
        return { text: 'Connecting', color: 'text-indigo-300' };
      case 'ringing':
        return { text: 'Ringing', color: 'text-amber-300' };
      case 'connected':
        return {
          text: callType === 'video' ? 'Video Call' : 'Audio Call',
          color: 'text-emerald-400',
        };
      case 'ended':
        return { text: 'Call Ended', color: 'text-white/40' };
      default:
        return { text: '', color: 'text-white/60' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('flex flex-col items-center', className)}
    >
      {/* ── Avatar with animated rings ───────────────────────────── */}
      <div className="relative mb-6">
        {/* Expanding ring pulses (connecting / ringing) */}
        {isPreConnect && (
          <>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-indigo-400/30"
                style={{
                  animation: `nt-ring-expand 2.8s ${i * 0.9}s infinite ease-out`,
                }}
              />
            ))}
          </>
        )}

        {/* Connected glow ring */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -inset-3 rounded-full border-2 border-emerald-500/25"
          />
        )}

        {/* Avatar container — ringing gets subtle pulse */}
        <motion.div
          animate={
            status === 'ringing'
              ? { scale: [1, 1.04, 1] }
              : {}
          }
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <Avatar
            src={astrologerImage}
            alt={astrologerName}
            size="xl"
            className={cn(
              'w-28 h-28 border-[3px]',
              isConnected
                ? 'border-emerald-500/40'
                : isPreConnect
                  ? 'border-indigo-400/30'
                  : 'border-white/10'
            )}
          />
        </motion.div>

        {/* Online indicator dot */}
        {isConnected && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-[#111B33] shadow-[0_0_12px_rgba(16,185,129,0.5)]"
          />
        )}
      </div>

      {/* ── Name ─────────────────────────────────────────────────── */}
      <h2
        className={cn(
          'text-2xl font-bold font-lexend tracking-tight mb-1',
          isEnded ? 'text-white/40' : 'text-white'
        )}
      >
        {astrologerName}
      </h2>

      {/* ── Status line ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-5">
        {isConnected && (
          callType === 'video'
            ? <Video className="w-3.5 h-3.5 text-emerald-400" />
            : <Phone className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span className={cn('text-sm font-medium tracking-wide', statusInfo.color)}>
          {statusInfo.text}
        </span>

        {/* Ringing dots */}
        {isPreConnect && (
          <span className="flex gap-0.5 ml-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                className="w-1 h-1 rounded-full bg-current"
              />
            ))}
          </span>
        )}
      </div>

      {/* ── Live timer & cost (connected only) ───────────────────── */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            {/* Duration pill */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.06] backdrop-blur-sm rounded-full border border-white/[0.08]">
              <Clock className="w-3.5 h-3.5 text-white/50" />
              <span className="text-white font-mono text-sm tracking-wider">{duration}</span>
            </div>

            {/* Cost pill */}
            {cost && (
              <div className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.06] backdrop-blur-sm rounded-full border border-white/[0.08]">
                <IndianRupee className="w-3.5 h-3.5 text-white/50" />
                <span className="text-white text-sm font-medium">{cost}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
