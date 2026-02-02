'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Astrologer } from '@/types/api.types';
import { AstrologerCard, AstrologerCardSkeleton } from './AstrologerCard';
import { motion } from 'framer-motion';

interface AstrologerGridProps {
  astrologers: Astrologer[];
  variant: 'chat' | 'call';
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  onAstrologerAction?: (astrologer: Astrologer) => void;
}

export function AstrologerGrid({
  astrologers,
  variant,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onAstrologerAction,
}: AstrologerGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && fetchNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Initial loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <AstrologerCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!astrologers.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🔮</span>
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          No Astrologers Found
        </h3>
        <p className="text-text-secondary max-w-md">
          Try adjusting your filters or check back later when more astrologers are online.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {astrologers.map((astrologer, index) => (
          <motion.div
            key={astrologer.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <AstrologerCard
              astrologer={astrologer}
              variant={variant}
              onAction={onAstrologerAction}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <AstrologerCardSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
