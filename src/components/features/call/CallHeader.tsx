'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Clock, IndianRupee } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

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
  // Status text
  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting...';
      case 'ringing':
        return 'Ringing...';
      case 'connected':
        return callType === 'video' ? 'Video Call' : 'Audio Call';
      case 'ended':
        return 'Call Ended';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center py-8 px-4',
        className
      )}
    >
      {/* Avatar */}
      <motion.div
        animate={status === 'ringing' ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="relative mb-4"
      >
        <Avatar
          src={astrologerImage}
          alt={astrologerName}
          size="xl"
          className="w-24 h-24 border-4 border-white/30"
        />
        {status === 'connected' && (
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-status-success rounded-full border-2 border-white" />
        )}
      </motion.div>

      {/* Name */}
      <h2 className="text-xl font-bold text-white mb-1">{astrologerName}</h2>

      {/* Status */}
      <p className="text-white/70 text-sm mb-4">{getStatusText()}</p>

      {/* Duration & Cost */}
      {status === 'connected' && (
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1 bg-white/20 text-white border-0">
            <Clock className="w-4 h-4" />
            {duration}
          </Badge>
          {cost && (
            <Badge variant="secondary" className="gap-1 bg-white/20 text-white border-0">
              <IndianRupee className="w-4 h-4" />
              {cost}
            </Badge>
          )}
        </div>
      )}

      {/* Ringing Animation */}
      {status === 'ringing' && (
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
