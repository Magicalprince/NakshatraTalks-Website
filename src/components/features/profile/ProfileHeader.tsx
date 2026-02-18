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
        'bg-gradient-to-br from-primary via-primary/90 to-primary-dark rounded-xl px-6 pt-6 pb-8 relative overflow-hidden',
        className
      )}
    >
      {/* Floating decorative circles for depth */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-4 left-6 w-16 h-16 rounded-full bg-white/5 animate-float" />
        <div className="absolute top-12 right-10 w-10 h-10 rounded-full bg-white/[0.07]" style={{ animationDelay: '2s', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-6 left-16 w-8 h-8 rounded-full bg-white/[0.04]" style={{ animationDelay: '4s', animation: 'float 7s ease-in-out infinite' }} />
        <div className="absolute bottom-3 right-20 w-14 h-14 rounded-full bg-white/[0.06]" style={{ animationDelay: '1s', animation: 'float 9s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/3 w-6 h-6 rounded-full bg-white/[0.05]" style={{ animationDelay: '3s', animation: 'float 6s ease-in-out infinite' }} />
      </div>

      <div className="flex flex-col items-center relative z-10">
        {/* Avatar with Edit Button */}
        <div className="relative mb-4">
          <Avatar
            src={profileImage}
            alt={name || 'User'}
            size="xl"
            className="w-24 h-24 border-4 border-white shadow-web-lg"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Upload profile photo"
            className={cn(
              'absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full',
              'flex items-center justify-center shadow-md',
              'hover:bg-gray-50 hover:scale-110 transition-all duration-200',
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
            aria-label="Choose profile image file"
          />
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold text-white mb-1 font-lexend">
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
            aria-label="Edit your profile information"
            className="mt-4 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
    </motion.div>
  );
}
