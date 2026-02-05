'use client';

/**
 * MessageBubble Component
 * Design matches mobile app with:
 * - Blue (#0084FF) background for user messages
 * - Yellow (#FEF3C7) background for astrologer messages
 * - WhatsApp-style tick marks for read status
 * - Rounded corners with tail effect
 */

import { ChatMessage } from '@/types/api.types';
import { cn } from '@/utils/cn';
import { Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

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
  // Get message content (handle both content and message fields)
  const content = message.content || message.message || '';

  // Format time like mobile app (12:30 pm)
  const formatTime = (timestamp: string | undefined | null) => {
    if (!timestamp) return '--:--';

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '--:--';

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Determine message status based on isRead field or passed status
  const getMessageStatus = (): MessageStatus => {
    if (status) return status;
    if (message.status) return message.status as MessageStatus;
    if (message.isRead) return 'read';
    if (message.id) return 'delivered';
    return 'sent';
  };

  // Render tick marks for user messages (WhatsApp style)
  const renderTickMarks = () => {
    if (!isCurrentUser) return null;

    const currentStatus = getMessageStatus();
    const tickColor = currentStatus === 'read' ? '#34B7F1' : 'rgba(255, 255, 255, 0.7)';

    switch (currentStatus) {
      case 'sending':
        return <Check className="w-3.5 h-3.5 opacity-50" style={{ color: tickColor }} strokeWidth={2.5} />;
      case 'sent':
        return <Check className="w-3.5 h-3.5" style={{ color: tickColor }} strokeWidth={2.5} />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5" style={{ color: tickColor }} strokeWidth={2.5} />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5" style={{ color: '#34B7F1' }} strokeWidth={2.5} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'w-full px-2',
        isCurrentUser ? 'flex justify-end' : 'flex justify-start',
        isConsecutive ? 'mb-0.5' : 'mb-2'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] px-3 py-2 shadow-sm',
          isCurrentUser
            ? cn(
                'bg-[#0084FF] text-white',
                'rounded-tl-[20px] rounded-bl-[20px] rounded-br-[20px]',
                isConsecutive ? 'rounded-tr-[8px]' : 'rounded-tr-[20px]'
              )
            : cn(
                'bg-[#FEF3C7] text-black border border-black/5',
                'rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px]',
                isConsecutive ? 'rounded-tl-[8px]' : 'rounded-tl-[20px]'
              )
        )}
      >
        {/* Message Text */}
        <p className="text-[15px] leading-5 font-lexend whitespace-pre-wrap break-words">
          {content}
        </p>

        {/* Timestamp and Tick Marks */}
        {showTimestamp && (
          <div className="flex items-center justify-end gap-1 mt-1">
            <span
              className={cn(
                'text-[11px] font-lexend',
                isCurrentUser ? 'text-white/70' : 'text-black/50'
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
