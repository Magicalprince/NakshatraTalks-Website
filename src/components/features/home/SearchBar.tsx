'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse-chat?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <motion.form
      onSubmit={handleSearch}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative max-w-2xl mx-auto"
    >
      <div
        className={cn(
          'relative rounded-2xl bg-white shadow-card transition-all duration-300',
          isFocused && 'shadow-lg ring-2 ring-primary/20'
        )}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search astrologers by name, specialization..."
          className="w-full h-14 pl-12 pr-4 rounded-2xl border-0 text-base font-lexend text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </div>

      {/* Quick filters */}
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
    </motion.form>
  );
}
