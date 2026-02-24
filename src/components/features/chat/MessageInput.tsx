'use client';

/**
 * MessageInput Component — Professional Web Chat Input
 * - Auto-growing textarea with max height
 * - Clean rounded design
 * - Send button with smooth transition
 */

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

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
  placeholder = 'Type a message...',
  sending = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      onTyping?.();

      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
      }
    },
    [onTyping]
  );

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || sending) return;

    onSendMessage(trimmedMessage, 'text');
    setMessage('');

    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [message, disabled, sending, onSendMessage]);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !sending && !disabled;

  return (
    <div className="px-4 py-3">
      <div className="flex items-end gap-3">
        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || sending}
            rows={1}
            className={cn(
              'w-full bg-[#F3F4F6] rounded-2xl px-4 py-3',
              'resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white',
              'text-[15px] font-lexend text-gray-800 placeholder:text-gray-400',
              'min-h-[44px] max-h-[120px]',
              'border border-transparent focus:border-primary/20',
              'transition-all duration-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0',
            'transition-all duration-200',
            canSend
              ? 'bg-primary text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 active:scale-95'
              : 'bg-gray-200 text-gray-400'
          )}
        >
          {sending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-[18px] h-[18px]" fill={canSend ? 'white' : 'currentColor'} strokeWidth={0} />
          )}
        </button>
      </div>
    </div>
  );
}
