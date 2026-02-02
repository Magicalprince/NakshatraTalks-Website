'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Send, Paperclip, Mic, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'image' | 'audio') => void;
  onTyping?: () => void;
  onImageSelect?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
  isUploading?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  onImageSelect,
  disabled = false,
  placeholder = 'Type a message...',
  isUploading = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle message change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      onTyping?.();

      // Auto-resize textarea
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
      }
    },
    [onTyping]
  );

  // Handle send
  const handleSend = useCallback(() => {
    if (selectedImage) {
      onImageSelect?.(selectedImage);
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;

    onSendMessage(trimmedMessage, 'text');
    setMessage('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [message, selectedImage, disabled, onSendMessage, onImageSelect]);

  // Handle key press
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    setShowAttachmentMenu(false);
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative">
      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 right-0 p-2 bg-white border-t"
          >
            <div className="relative inline-block h-20">
              <Image
                src={imagePreview}
                alt="Preview"
                width={80}
                height={80}
                className="h-20 w-auto rounded-lg object-cover"
              />
              <button
                onClick={clearSelectedImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-status-error text-white rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttachmentMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 flex gap-2"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                // Voice message functionality would go here
                setShowAttachmentMenu(false);
              }}
              className="p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Input Area */}
      <div className="flex items-end gap-2 p-3 bg-white border-t">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-text-secondary"
          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full px-4 py-2 rounded-full border resize-none',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'text-sm min-h-[40px] max-h-[120px]',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-100'
            )}
          />
        </div>

        {/* Send Button */}
        <Button
          variant="primary"
          size="sm"
          className="p-2 rounded-full"
          onClick={handleSend}
          disabled={disabled || isUploading || (!message.trim() && !selectedImage)}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
