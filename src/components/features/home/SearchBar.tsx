'use client';

/**
 * SearchBar Component
 * Design matches mobile app with:
 * - Rounded pill shape
 * - Primary color border on focus
 * - Search icon and filter icon
 * - Subtle shadow
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showQuickFilters?: boolean;
}

export function SearchBar({
  placeholder = "Search astrologers...",
  onSearch,
  className,
  showQuickFilters = false,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/browse-chat?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn("relative", className)}
    >
      <div
        className={cn(
          'relative flex items-center h-[46px] rounded-full bg-white px-4 transition-all duration-200',
          isFocused
            ? 'border-2 border-secondary shadow-lg'
            : 'border border-primary shadow-md'
        )}
        style={{
          boxShadow: isFocused
            ? '0 4px 16px rgba(255, 207, 13, 0.3)'
            : '0 4px 16px rgba(41, 48, 166, 0.1)',
        }}
      >
        <Search
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isFocused ? 'text-secondary' : 'text-primary'
          )}
        />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 h-full ml-2.5 text-[13px] font-nunito text-primary placeholder:text-primary/60 bg-transparent focus:outline-none"
        />
        <button
          type="button"
          className="flex-shrink-0 p-1"
          onClick={() => router.push('/browse-chat?filter=true')}
        >
          <SlidersHorizontal className="h-[18px] w-[18px] text-primary" />
        </button>
      </div>

      {/* Quick filters - optional */}
      {showQuickFilters && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['Love & Relationship', 'Career', 'Marriage', 'Health', 'Finance'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => router.push(`/browse-chat?specialization=${encodeURIComponent(filter)}`)}
              className="px-4 py-2 rounded-full bg-white text-sm font-medium text-text-secondary hover:bg-primary hover:text-white transition-colors font-lexend shadow-sm"
            >
              {filter}
            </button>
          ))}
        </div>
      )}
    </motion.form>
  );
}
