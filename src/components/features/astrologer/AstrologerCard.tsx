'use client';

import { Astrologer } from '@/types/api.types';
import { IndianRupee, Star, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface AstrologerCardProps {
  astrologer: Astrologer;
  variant?: 'chat' | 'call' | 'grid';
  onAction?: (astrologer: Astrologer) => void;
  isLoading?: boolean;
}

export function AstrologerCard({ astrologer, variant = 'chat', onAction, isLoading }: AstrologerCardProps) {
  const isOnline = astrologer.isOnline ?? astrologer.isAvailable;
  const profileImage = astrologer.profileImage ?? astrologer.image;
  const specializations = astrologer.specializations ?? astrologer.specialization ?? [];
  const chatPrice = astrologer.chatPrice ?? astrologer.chatPricePerMinute ?? astrologer.pricePerMinute;
  const callPrice = astrologer.callPrice ?? astrologer.callPricePerMinute ?? astrologer.pricePerMinute;
  const price = variant === 'call' ? callPrice : chatPrice;
  const languages = astrologer.languages ?? [];
  const rating = astrologer.rating ?? 0;
  const totalCalls = astrologer.totalCalls ?? 0;
  const experience = astrologer.experience ?? 0;
  const actionLabel = variant === 'call' ? 'Call' : 'Chat';
  const ActionIcon = variant === 'call' ? Phone : MessageCircle;

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAction) onAction(astrologer);
  };

  // Unified vertical card layout for all variants — works properly in grid layouts
  return (
    <Link
      href={`/astrologer/${astrologer.id}`}
      className="block group h-full"
      aria-label={`View profile of ${astrologer.name}, ${specializations.slice(0, 2).join(' and ')}${isOnline ? ', currently online' : ''}`}
    >
      <div className="bg-white rounded-xl border border-border-default/60 overflow-hidden card-hover-lift h-full flex flex-col">
        {/* Image Section */}
        <div className="relative aspect-[4/3] bg-background-offWhite">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={astrologer.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <span className="text-5xl font-bold text-primary/25 font-lexend select-none">
                {astrologer.name.charAt(0)}
              </span>
            </div>
          )}
          {/* Online badge with ping animation */}
          {isOnline && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-status-success/90 rounded-md flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              <span className="text-[10px] font-semibold text-white font-lexend">Online</span>
            </div>
          )}
          {/* Rating badge */}
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-text-primary font-lexend">{rating.toFixed(1)}</span>
          </div>
          {/* Experience badge */}
          {experience > 0 && (
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white rounded-md text-[10px] font-semibold font-lexend">
              {experience}+ yrs
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 flex flex-col flex-1">
          {/* Name and specialization */}
          <div className="min-w-0">
            <h3 className="font-semibold text-base text-text-primary truncate font-lexend group-hover:text-primary transition-colors">
              {astrologer.name}
            </h3>
            <p className="text-xs text-text-muted mt-0.5 truncate font-lexend">
              {specializations.slice(0, 2).join(', ')}
            </p>
          </div>

          {/* Languages */}
          {languages.length > 0 && (
            <p className="text-xs text-text-secondary mt-1.5 truncate font-lexend">
              {languages.slice(0, 3).join(', ')}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted font-lexend">
            <span>{totalCalls.toLocaleString()} orders</span>
          </div>

          {/* Price & CTA — pushed to bottom */}
          <div className="flex items-center justify-between mt-auto pt-3">
            <div className="flex items-center bg-status-success/5 px-2 py-0.5 rounded-md">
              <IndianRupee className="w-3 h-3 text-status-success" />
              <span className="text-sm font-bold text-status-success font-lexend">{price}</span>
              <span className="text-xs text-text-muted font-lexend">/min</span>
            </div>

            <button
              onClick={handleAction}
              disabled={!isOnline || isLoading}
              aria-label={
                isLoading
                  ? 'Connecting...'
                  : isOnline
                    ? `${actionLabel} with ${astrologer.name}`
                    : `${astrologer.name} is currently unavailable`
              }
              className={cn(
                'px-4 py-1.5 rounded-lg font-medium text-sm font-lexend transition-all flex items-center gap-1.5',
                isOnline
                  ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-web-sm active:scale-[0.98]'
                  : 'bg-background-offWhite text-text-muted cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ActionIcon className="w-3.5 h-3.5" />
                  {actionLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function AstrologerCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border-default/60 overflow-hidden">
      <div className="aspect-[4/3] bg-background-offWhite skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="h-5 w-3/4 bg-gray-200/80 rounded skeleton-shimmer" />
          <div className="h-3 w-1/2 bg-gray-100 rounded skeleton-shimmer" />
        </div>
        <div className="h-3 w-2/3 bg-gray-100 rounded skeleton-shimmer" />
        <div className="h-3 w-1/3 bg-gray-100 rounded skeleton-shimmer" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-6 w-16 bg-gray-100 rounded-md skeleton-shimmer" />
          <div className="h-8 w-16 bg-gray-200/80 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
