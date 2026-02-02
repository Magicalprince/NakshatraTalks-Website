'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Phone, Video, MoreVertical, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import Link from 'next/link';

interface SessionHeaderProps {
  astrologerName: string;
  astrologerImage?: string;
  isOnline?: boolean;
  sessionStartTime?: string;
  pricePerMinute?: number;
  onEndSession?: () => void;
  onCallClick?: () => void;
  showCallButton?: boolean;
  className?: string;
  isAstrologer?: boolean;
}

export function SessionHeader({
  astrologerName,
  astrologerImage,
  isOnline = true,
  sessionStartTime,
  pricePerMinute,
  onEndSession,
  onCallClick,
  showCallButton = false,
  className,
  isAstrologer = false,
}: SessionHeaderProps) {
  const [duration, setDuration] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!sessionStartTime) return;

    const startTime = new Date(sessionStartTime).getTime();

    const updateDuration = () => {
      const now = Date.now();
      const diff = Math.floor((now - startTime) / 1000);
      setDuration(diff);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate cost
  const currentCost = pricePerMinute
    ? ((duration / 60) * pricePerMinute).toFixed(2)
    : null;

  return (
    <div
      className={cn(
        'bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <Link href={isAstrologer ? '/astrologer/chat' : '/'}>
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>

        {/* Astrologer Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              src={astrologerImage}
              alt={astrologerName}
              size="md"
            />
            {/* Online indicator */}
            <span
              className={cn(
                'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                isOnline ? 'bg-status-success' : 'bg-gray-400'
              )}
            />
          </div>

          <div>
            <h2 className="font-semibold text-text-primary">{astrologerName}</h2>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <span className="text-xs text-status-success">Online</span>
              ) : (
                <span className="text-xs text-text-muted">Offline</span>
              )}
              {sessionStartTime && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(duration)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Cost Display */}
        {currentCost && (
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-xs text-primary font-medium">₹{currentCost}</span>
          </div>
        )}

        {/* Call Buttons */}
        {showCallButton && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={onCallClick}
            >
              <Phone className="w-5 h-5 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={onCallClick}
            >
              <Video className="w-5 h-5 text-primary" />
            </Button>
          </>
        )}

        {/* Menu Button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-[150px]">
                {onEndSession && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEndSession();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-status-error hover:bg-gray-50"
                  >
                    End Session
                  </button>
                )}
                {!isAstrologer && (
                  <Link
                    href={`/astrologer/${astrologerName}`}
                    className="block px-4 py-2 text-sm text-text-primary hover:bg-gray-50"
                    onClick={() => setShowMenu(false)}
                  >
                    View Profile
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
