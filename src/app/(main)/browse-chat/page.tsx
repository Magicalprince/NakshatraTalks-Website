'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AstrologerGrid, FilterChips, SortDropdown } from '@/components/features/astrologer';
import { SearchBar } from '@/components/features/home/SearchBar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageContainer } from '@/components/layout/PageContainer';
import { FilterSidebar } from '@/components/layout/FilterSidebar';
import { useChatAstrologers, useFilterOptions, useSearchAstrologers } from '@/hooks/useBrowseData';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useQueueStore } from '@/stores/queue-store';
import { AstrologerFilters, Astrologer } from '@/types/api.types';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const DEFAULT_SPECIALIZATIONS = [
  'Vedic Astrology', 'Tarot Reading', 'Numerology', 'Palmistry', 'Vastu',
  'Horoscope', 'Kundli', 'Face Reading', 'Prashna Kundli', 'Lal Kitab',
];

const DEFAULT_LANGUAGES = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Kannada',
  'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi',
];

export default function BrowseChatPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const { createRequest, setSelectedAstrologer } = useQueueStore();

  const [filters, setFilters] = useState<AstrologerFilters>({});
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience' | 'orders'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter sidebar state
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  const {
    data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage,
  } = useChatAstrologers(filters, sortBy, sortOrder);

  const { data: filterOptions } = useFilterOptions();

  const { data: searchResults, isLoading: isSearchLoading } = useSearchAstrologers(
    searchQuery, isSearching && searchQuery.length >= 2
  );

  const astrologers = useMemo(() => {
    if (isSearching && searchResults) return searchResults;
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page?.data || []);
  }, [data, isSearching, searchResults]);

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector<HTMLInputElement>('[data-search-input="browse-chat"]');
      searchInput?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleChatAction = (astrologer: Astrologer) => {
    if (!isAuthenticated) {
      addToast({ type: 'info', title: 'Login Required', message: 'Please login to start a chat session' });
      router.push(`/login?redirect=/browse-chat`);
      return;
    }
    const isOnline = astrologer.isOnline ?? astrologer.isAvailable;
    if (!isOnline) {
      addToast({ type: 'warning', title: 'Astrologer Unavailable', message: `${astrologer.name} is currently busy.` });
      return;
    }
    setSelectedAstrologer(astrologer);
    createRequest(astrologer, 'chat');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length >= 2);
  };

  const handleSortChange = (newSortBy: string, newOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy as typeof sortBy);
    setSortOrder(newOrder);
  };

  const handleFiltersChange = (newFilters: AstrologerFilters) => {
    setFilters(newFilters);
    setIsSearching(false);
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setSelectedSpecs([]);
    setSelectedLangs([]);
    setMinRating(0);
    setFilters({});
  };

  const specializations = filterOptions?.specializations || DEFAULT_SPECIALIZATIONS;
  const languages = filterOptions?.languages || DEFAULT_LANGUAGES;

  const activeFilterCount = Object.entries(filters).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value === true;
    return value !== undefined && value !== null;
  }).length;

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Chat with Astrologer' }]} />

        <div className="flex gap-8 pb-12">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0" aria-label="Filter options">
            <div className="sticky top-24">
              <FilterSidebar
                specializations={specializations}
                languages={languages}
                selectedSpecializations={selectedSpecs}
                selectedLanguages={selectedLangs}
                minRating={minRating}
                onSpecializationsChange={setSelectedSpecs}
                onLanguagesChange={setSelectedLangs}
                onRatingChange={setMinRating}
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-lexend">
                Chat with Astrologer
              </h1>
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <SearchBar
                    placeholder="Search astrologers..."
                    onSearch={handleSearch}
                    className="w-full [&_input]:focus:shadow-web-sm"
                    data-search-input="browse-chat"
                  />
                  {/* Keyboard shortcut hint */}
                  <div className="hidden sm:flex absolute right-10 top-1/2 -translate-y-1/2 items-center pointer-events-none">
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border-default bg-background-offWhite px-1.5 py-0.5 text-[10px] font-medium text-text-muted font-lexend">
                      <span className="text-xs">&#8984;</span>K
                    </kbd>
                  </div>
                </div>
                <SortDropdown value={sortBy} order={sortOrder} onChange={handleSortChange} />
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden flex-shrink-0 gap-1.5 relative"
                  onClick={() => setShowMobileFilters(true)}
                  aria-label={`Open filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Filter Chips */}
            <div className="lg:hidden mb-4">
              <FilterChips
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableSpecializations={specializations}
                availableLanguages={languages}
              />
            </div>

            {/* Results count */}
            {isLoading || isSearchLoading ? (
              <div className="mb-4">
                <Skeleton className="h-4 w-48 rounded" />
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4" aria-live="polite" aria-atomic="true">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-sm font-medium text-primary font-nunito">
                  <Search className="w-3.5 h-3.5" />
                  {isSearching && searchQuery
                    ? `${astrologers.length} results for "${searchQuery}"`
                    : `${astrologers.length} astrologers available`}
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1 rounded-full bg-status-error/5 px-2.5 py-1 text-xs font-medium text-status-error hover:bg-status-error/10 transition-colors font-nunito"
                    aria-label="Clear all filters"
                  >
                    <X className="w-3 h-3" />
                    Clear filters
                  </button>
                )}
              </div>
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
      </PageContainer>
    </div>
  );
}
