'use client';

/**
 * MessageInput Component
 * Design matches mobile app with:
 * - Gray rounded input field
 * - Primary color send button (circular)
 * - Clean minimal design
 */

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'audio') => void;
  onTyping?: () => void;
  onImageSelect?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
  isUploading?: boolean;
  sending?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = 'Message',
  sending = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle message change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      onTyping?.();

      // Auto-resize textarea
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
      }
    },
    [onTyping]
  );

  // Handle send
  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || sending) return;

    onSendMessage(trimmedMessage, 'text');
    setMessage('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [message, disabled, sending, onSendMessage]);

  // Handle key press
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !sending && !disabled;

  return (
    <div className="bg-white border-t border-gray-100">
      {/* Input Container */}
      <div className="px-2 py-2">
        <div className="flex items-end gap-2">
          {/* Text Input */}
          <div className="flex-1 bg-[#F3F4F6] rounded-3xl px-4 py-2">
            <textarea
              ref={inputRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled || sending}
              rows={1}
              className={cn(
                'w-full bg-transparent resize-none',
                'focus:outline-none',
                'text-[16px] font-lexend text-black placeholder:text-black/40',
                'min-h-[24px] max-h-[100px]',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            />
          </div>

          {/* Send Button */}
          <motion.button
            whileTap={{ scale: canSend ? 0.9 : 1 }}
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0',
              'bg-primary text-white transition-opacity',
              canSend ? 'opacity-100' : 'opacity-50'
            )}
            style={{
              boxShadow: canSend ? '0 2px 8px rgba(41, 48, 166, 0.3)' : undefined,
            }}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" fill="white" strokeWidth={2} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
