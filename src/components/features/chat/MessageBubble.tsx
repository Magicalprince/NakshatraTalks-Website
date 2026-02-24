'use client';

/**
 * MessageBubble Component — Professional Web Chat Bubble
 * - Primary color for user messages (right-aligned)
 * - White card for received messages (left-aligned)
 * - Subtle entrance animation, modern rounded corners
 * - WhatsApp-style tick marks with failed state
 */

import { ChatMessage } from '@/types/api.types';
import { cn } from '@/utils/cn';
import { Check, CheckCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  astrologerImage?: string;
  astrologerName?: string;
  showTimestamp?: boolean;
  isConsecutive?: boolean;
  status?: MessageStatus;
}

export function MessageBubble({
  message,
  isCurrentUser,
  showTimestamp = true,
  isConsecutive = false,
  status,
}: MessageBubbleProps) {
  const content = message.content || message.message || '';

  const formatTime = (timestamp: string | undefined | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getMessageStatus = (): MessageStatus => {
    if (status) return status;
    if (message.status) return message.status as MessageStatus;
    if (message.isRead) return 'read';
    if (message.id) return 'delivered';
    return 'sent';
  };

  const renderTickMarks = () => {
    if (!isCurrentUser) return null;

    const currentStatus = getMessageStatus();

    if (currentStatus === 'failed') {
      return <AlertCircle className="w-3 h-3 text-red-400" strokeWidth={2.5} />;
    }

    const tickColor = currentStatus === 'read' ? '#34B7F1' : 'rgba(255,255,255,0.6)';

    switch (currentStatus) {
      case 'sending':
        return <Check className="w-3 h-3 opacity-40" style={{ color: tickColor }} strokeWidth={2.5} />;
      case 'sent':
        return <Check className="w-3 h-3" style={{ color: tickColor }} strokeWidth={2.5} />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" style={{ color: tickColor }} strokeWidth={2.5} />;
      case 'read':
        return <CheckCheck className="w-3 h-3" style={{ color: '#34B7F1' }} strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'w-full',
        isCurrentUser ? 'flex justify-end' : 'flex justify-start',
        isConsecutive ? 'mb-0.5' : 'mb-3'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] lg:max-w-[60%] px-4 py-2.5',
          isCurrentUser
            ? cn(
                'bg-primary text-white',
                'rounded-2xl',
                isConsecutive ? 'rounded-tr-lg' : 'rounded-tr-sm'
              )
            : cn(
                'bg-white text-gray-800 shadow-sm border border-gray-100',
                'rounded-2xl',
                isConsecutive ? 'rounded-tl-lg' : 'rounded-tl-sm'
              )
        )}
      >
        {/* Message Text */}
        <p className="text-[15px] leading-relaxed font-lexend whitespace-pre-wrap break-words">
          {content}
        </p>

        {/* Timestamp and Status */}
        {showTimestamp && (
          <div className="flex items-center justify-end gap-1.5 mt-1 -mb-0.5">
            <span
              className={cn(
                'text-[10px] font-lexend',
                isCurrentUser ? 'text-white/50' : 'text-gray-400'
              )}
            >
              {formatTime(message.createdAt)}
            </span>
            {renderTickMarks()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
