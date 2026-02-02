'use client';

import { ChatMessage } from '@/types/api.types';
import { cn } from '@/utils/cn';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  astrologerImage?: string;
  astrologerName?: string;
}

export function MessageBubble({
  message,
  isCurrentUser,
  showAvatar = false,
  astrologerImage,
  astrologerName,
}: MessageBubbleProps) {
  // Get message content (handle both content and message fields)
  const content = message.content || message.message || '';
  const status = message.status;

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Render status icon
  const renderStatusIcon = () => {
    if (!isCurrentUser) return null;

    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-text-muted" />;
      case 'sent':
        return <Check className="w-3 h-3 text-text-muted" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-text-muted" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-message-readTick" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-status-error" />;
      default:
        // Default to sent if isRead is true
        if (message.isRead) {
          return <CheckCheck className="w-3 h-3 text-message-readTick" />;
        }
        return <Check className="w-3 h-3 text-text-muted" />;
    }
  };

  // Render image message
  const renderImageMessage = () => {
    if (message.type !== 'image' || !content) return null;

    return (
      <div className="relative w-48 h-48 rounded-lg overflow-hidden">
        <Image
          src={content}
          alt="Image message"
          fill
          className="object-cover"
        />
      </div>
    );
  };

  // Render audio message
  const renderAudioMessage = () => {
    if (message.type !== 'audio' || !content) return null;

    return (
      <audio controls className="max-w-full">
        <source src={content} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-2 mb-2',
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {showAvatar && !isCurrentUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-200">
          {astrologerImage ? (
            <Image
              src={astrologerImage}
              alt={astrologerName || 'Astrologer'}
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-medium text-text-secondary">
              {astrologerName?.charAt(0) || 'A'}
            </div>
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 relative',
          isCurrentUser
            ? 'bg-message-user text-white rounded-br-sm'
            : 'bg-message-astrologer text-text-primary rounded-bl-sm',
          status === 'failed' && 'opacity-70'
        )}
      >
        {/* Message Content */}
        {message.type === 'text' && (
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        )}
        {message.type === 'image' && renderImageMessage()}
        {message.type === 'audio' && renderAudioMessage()}

        {/* Time and Status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isCurrentUser ? 'justify-end' : 'justify-start'
          )}
        >
          <span
            className={cn(
              'text-[10px]',
              isCurrentUser ? 'text-white/70' : 'text-text-muted'
            )}
          >
            {formatTime(message.createdAt)}
          </span>
          {renderStatusIcon()}
        </div>

        {/* Failed message retry hint */}
        {status === 'failed' && (
          <p className="text-[10px] text-status-error mt-1">
            Failed to send. Tap to retry.
          </p>
        )}
      </div>
    </motion.div>
  );
}
