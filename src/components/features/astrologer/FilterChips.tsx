'use client';

import { useState } from 'react';
import { AstrologerFilters } from '@/types/api.types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  Filter,
  X,
  Star,
  Clock,
  Languages,
  IndianRupee,
  ChevronDown,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterChipsProps {
  filters: AstrologerFilters;
  onFiltersChange: (filters: AstrologerFilters) => void;
  availableSpecializations?: string[];
  availableLanguages?: string[];
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'price', label: 'Price' },
  { value: 'experience', label: 'Experience' },
  { value: 'orders', label: 'Popular' },
];

const QUICK_FILTERS = [
  { key: 'isOnline', label: 'Online Now', value: true },
  { key: 'minRating', label: '4+ Rating', value: 4 },
  { key: 'minExperience', label: '5+ Years', value: 5 },
];

export function FilterChips({
  filters,
  onFiltersChange,
  availableSpecializations = [],
  availableLanguages = [],
}: FilterChipsProps) {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AstrologerFilters>(filters);

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([_key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value === true;
    return value !== undefined && value !== null;
  }).length;

  const handleQuickFilter = (key: string, value: boolean | number) => {
    const newFilters = { ...filters };
    if ((filters as Record<string, unknown>)[key] === value) {
      delete (newFilters as Record<string, unknown>)[key];
    } else {
      (newFilters as Record<string, unknown>)[key] = value;
    }
    onFiltersChange(newFilters);
  };

  const isQuickFilterActive = (key: string, value: boolean | number) => {
    return (filters as Record<string, unknown>)[key] === value;
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsFilterModalOpen(false);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
    setIsFilterModalOpen(false);
  };

  const toggleSpecialization = (spec: string) => {
    const current = localFilters.specializations || [];
    const updated = current.includes(spec)
      ? current.filter((s) => s !== spec)
      : [...current, spec];
    setLocalFilters({ ...localFilters, specializations: updated });
  };

  const toggleLanguage = (lang: string) => {
    const current = localFilters.languages || [];
    const updated = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang];
    setLocalFilters({ ...localFilters, languages: updated });
  };

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* Filter button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1 flex-shrink-0"
          onClick={() => {
            setLocalFilters(filters);
            setIsFilterModalOpen(true);
          }}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* Quick filter chips */}
        {QUICK_FILTERS.map((filter) => (
          <Button
            key={filter.key}
            variant={isQuickFilterActive(filter.key, filter.value) ? 'primary' : 'outline'}
            size="sm"
            className="flex-shrink-0"
            onClick={() => handleQuickFilter(filter.key, filter.value)}
          >
            {filter.label}
          </Button>
        ))}

        {/* Active specialization chips */}
        <AnimatePresence>
          {filters.specializations?.map((spec) => (
            <motion.div
              key={spec}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="secondary"
                size="sm"
                className="gap-1 flex-shrink-0"
                onClick={() => {
                  const updated = filters.specializations?.filter((s) => s !== spec) || [];
                  onFiltersChange({ ...filters, specializations: updated });
                }}
              >
                {spec}
                <X className="w-3 h-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Clear all button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-status-error"
            onClick={handleClearFilters}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filters"
        className="max-w-md"
      >
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Specializations */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Specializations
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableSpecializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => toggleSpecialization(spec)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    localFilters.specializations?.includes(spec)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {spec}
                  {localFilters.specializations?.includes(spec) && (
                    <Check className="w-3 h-3 inline ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Languages className="w-4 h-4" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    localFilters.languages?.includes(lang)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {lang}
                  {localFilters.languages?.includes(lang) && (
                    <Check className="w-3 h-3 inline ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Price Range (per min)
            </h3>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice || ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-24"
              />
              <span className="text-text-muted">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice || ''}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-24"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Minimum Rating
            </h3>
            <div className="flex gap-2">
              {[3, 3.5, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      minRating: localFilters.minRating === rating ? undefined : rating,
                    })
                  }
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    localFilters.minRating === rating
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {rating}+
                  <Star className="w-3 h-3 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Minimum Experience
            </h3>
            <div className="flex gap-2">
              {[1, 3, 5, 10].map((years) => (
                <button
                  key={years}
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      minExperience: localFilters.minExperience === years ? undefined : years,
                    })
                  }
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    localFilters.minExperience === years
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {years}+ yrs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={handleClearFilters}>
            Clear All
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </div>
      </Modal>
    </>
  );
}

// Sort dropdown component
interface SortDropdownProps {
  value?: string;
  order?: 'asc' | 'desc';
  onChange: (sortBy: string, order: 'asc' | 'desc') => void;
}

export function SortDropdown({ value, order = 'desc', onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = SORT_OPTIONS.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        Sort: {currentOption?.label || 'Default'}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-modal border z-20 min-w-[150px]"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value, value === option.value && order === 'desc' ? 'asc' : 'desc');
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                >
                  {option.label}
                  {value === option.value && (
                    <span className="text-xs text-text-muted">
                      {order === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
