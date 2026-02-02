'use client';

import { useRef } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Camera, Edit2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface ProfileHeaderProps {
  name?: string | null;
  phone: string;
  email?: string | null;
  profileImage?: string | null;
  onEditClick?: () => void;
  onImageUpload?: (file: File) => void;
  isUploading?: boolean;
  className?: string;
}

export function ProfileHeader({
  name,
  phone,
  email,
  profileImage,
  onEditClick,
  onImageUpload,
  isUploading,
  className,
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-gradient-to-r from-primary to-primary/80 rounded-b-3xl px-4 pt-6 pb-8',
        className
      )}
    >
      <div className="flex flex-col items-center">
        {/* Avatar with Edit Button */}
        <div className="relative mb-4">
          <Avatar
            src={profileImage}
            alt={name || 'User'}
            size="xl"
            className="w-24 h-24 border-4 border-white"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              'absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full',
              'flex items-center justify-center shadow-md',
              'hover:bg-gray-50 transition-colors',
              isUploading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Camera className="w-4 h-4 text-primary" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold text-white mb-1">
          {name || 'Add your name'}
        </h2>

        {/* Phone */}
        <p className="text-white/80 text-sm mb-1">{phone}</p>

        {/* Email */}
        {email && (
          <p className="text-white/70 text-xs">{email}</p>
        )}

        {/* Edit Button */}
        {onEditClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
    </motion.div>
  );
}
