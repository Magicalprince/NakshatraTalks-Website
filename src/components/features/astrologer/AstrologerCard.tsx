'use client';

import { Astrologer } from '@/types/api.types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Star, MessageCircle, Phone, Clock, Languages, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AstrologerCardProps {
  astrologer: Astrologer;
  variant?: 'chat' | 'call';
  onAction?: (astrologer: Astrologer) => void;
}

export function AstrologerCard({ astrologer, variant = 'chat', onAction }: AstrologerCardProps) {
  // Handle both property naming conventions
  const isOnline = astrologer.isOnline ?? astrologer.isAvailable;
  const profileImage = astrologer.profileImage ?? astrologer.image;
  const specializations = astrologer.specializations ?? astrologer.specialization;
  const chatPrice = astrologer.chatPrice ?? astrologer.chatPricePerMinute ?? astrologer.pricePerMinute;
  const callPrice = astrologer.callPrice ?? astrologer.callPricePerMinute ?? astrologer.pricePerMinute;
  const price = variant === 'chat' ? chatPrice : callPrice;

  const handleAction = () => {
    if (onAction) {
      onAction(astrologer);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-cardHover transition-shadow duration-200">
        <div className="p-4">
          {/* Header with avatar and basic info */}
          <div className="flex gap-3">
            <Link href={`/astrologer/${astrologer.id}`}>
              <div className="relative">
                <Avatar
                  src={profileImage}
                  fallback={astrologer.name}
                  size="lg"
                  className="cursor-pointer"
                />
                {/* Online indicator */}
                <span
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    isOnline ? 'bg-status-success' : 'bg-gray-400'
                  }`}
                />
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Link href={`/astrologer/${astrologer.id}`}>
                <h3 className="font-semibold text-text-primary truncate hover:text-primary transition-colors">
                  {astrologer.name}
                </h3>
              </Link>

              {/* Specializations */}
              <p className="text-sm text-text-secondary truncate">
                {specializations?.slice(0, 2).join(', ')}
              </p>

              {/* Rating and experience */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span className="text-sm font-medium">{astrologer.rating?.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-text-muted">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{astrologer.experience} yrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="flex items-center gap-1 mt-3">
            <Languages className="w-4 h-4 text-text-muted" />
            <span className="text-xs text-text-secondary">
              {astrologer.languages?.slice(0, 3).join(', ')}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {specializations?.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-text-primary" />
              <span className="text-lg font-bold text-text-primary">{price}</span>
              <span className="text-xs text-text-muted">/min</span>
            </div>

            <Button
              variant={isOnline ? 'primary' : 'outline'}
              size="sm"
              onClick={handleAction}
              disabled={!isOnline}
              className="gap-1"
            >
              {variant === 'chat' ? (
                <>
                  <MessageCircle className="w-4 h-4" />
                  {isOnline ? 'Chat' : 'Busy'}
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  {isOnline ? 'Call' : 'Busy'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Skeleton component for loading state
export function AstrologerCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-2" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mt-3" />
        <div className="flex gap-1 mt-2">
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}
