'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AstrologerGrid, FilterChips, SortDropdown } from '@/components/features/astrologer';
import { SearchBar } from '@/components/features/home/SearchBar';
import { useChatAstrologers, useFilterOptions, useSearchAstrologers } from '@/hooks/useBrowseData';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useQueueStore } from '@/stores/queue-store';
import { AstrologerFilters, Astrologer } from '@/types/api.types';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Default specializations and languages (fallback if API call fails)
const DEFAULT_SPECIALIZATIONS = [
  'Vedic Astrology',
  'Tarot Reading',
  'Numerology',
  'Palmistry',
  'Vastu',
  'Horoscope',
  'Kundli',
  'Face Reading',
  'Prashna Kundli',
  'Lal Kitab',
];

const DEFAULT_LANGUAGES = [
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Punjabi',
];

export default function BrowseChatPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const { createRequest, setSelectedAstrologer } = useQueueStore();

  // State
  const [filters, setFilters] = useState<AstrologerFilters>({});
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience' | 'orders'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Fetch astrologers
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useChatAstrologers(filters, sortBy, sortOrder);

  // Fetch filter options
  const { data: filterOptions } = useFilterOptions();

  // Search astrologers
  const { data: searchResults, isLoading: isSearchLoading } = useSearchAstrologers(
    searchQuery,
    isSearching && searchQuery.length >= 2
  );

  // Flatten pages for display
  const astrologers = useMemo(() => {
    if (isSearching && searchResults) {
      return searchResults;
    }
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page?.data || []);
  }, [data, isSearching, searchResults]);

  // Handle astrologer chat action
  const handleChatAction = (astrologer: Astrologer) => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: 'Login Required',
        message: 'Please login to start a chat session',
      });
      router.push(`/login?redirect=/browse-chat`);
      return;
    }

    const isOnline = astrologer.isOnline ?? astrologer.isAvailable;
    if (!isOnline) {
      addToast({
        type: 'warning',
        title: 'Astrologer Unavailable',
        message: `${astrologer.name} is currently busy. Please try again later.`,
      });
      return;
    }

    // Set selected astrologer and create connection request
    setSelectedAstrologer(astrologer);
    createRequest(astrologer, 'chat');

    // Show connection request modal (handled by global modal system)
    // The queue store will manage the connection flow
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length >= 2);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string, newOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy as typeof sortBy);
    setSortOrder(newOrder);
  };

  // Handle filter change
  const handleFiltersChange = (newFilters: AstrologerFilters) => {
    setFilters(newFilters);
    setIsSearching(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-text-primary">Chat with Astrologer</h1>
            </div>
          </div>

          {/* Search */}
          <SearchBar
            placeholder="Search astrologers..."
            onSearch={handleSearch}
            className="mb-4"
            showQuickFilters={false}
          />

          {/* Filters and Sort */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 overflow-hidden">
              <FilterChips
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableSpecializations={filterOptions?.specializations || DEFAULT_SPECIALIZATIONS}
                availableLanguages={filterOptions?.languages || DEFAULT_LANGUAGES}
              />
            </div>
            <SortDropdown
              value={sortBy}
              order={sortOrder}
              onChange={handleSortChange}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Results count */}
        {!isLoading && !isSearchLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-text-secondary mb-4"
          >
            {isSearching && searchQuery
              ? `${astrologers.length} results for "${searchQuery}"`
              : `${astrologers.length} astrologers available for chat`}
          </motion.p>
        )}

        {/* Astrologer Grid */}
        <AstrologerGrid
          astrologers={astrologers}
          variant="chat"
          isLoading={isLoading || isSearchLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={!isSearching && hasNextPage}
          fetchNextPage={fetchNextPage}
          onAstrologerAction={handleChatAction}
        />
      </div>
    </div>
  );
}
