'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FilterSidebarProps {
  specializations: string[];
  languages: string[];
  selectedSpecializations: string[];
  selectedLanguages: string[];
  minRating: number;
  onSpecializationsChange: (specs: string[]) => void;
  onLanguagesChange: (langs: string[]) => void;
  onRatingChange: (rating: number) => void;
  onClear: () => void;
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-semibold font-lexend text-text-primary mb-3"
      >
        {title}
        <ChevronDown
          className={cn('h-4 w-4 text-text-muted transition-transform', isOpen && 'rotate-180')}
        />
      </button>
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
      />
      <span className="text-sm text-text-secondary font-nunito group-hover:text-text-primary transition-colors">
        {label}
      </span>
    </label>
  );
}

export function FilterSidebar({
  specializations,
  languages,
  selectedSpecializations,
  selectedLanguages,
  minRating,
  onSpecializationsChange,
  onLanguagesChange,
  onRatingChange,
  onClear,
}: FilterSidebarProps) {
  const hasFilters =
    selectedSpecializations.length > 0 || selectedLanguages.length > 0 || minRating > 0;

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecializations.includes(spec)) {
      onSpecializationsChange(selectedSpecializations.filter((s) => s !== spec));
    } else {
      onSpecializationsChange([...selectedSpecializations, spec]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      onLanguagesChange(selectedLanguages.filter((l) => l !== lang));
    } else {
      onLanguagesChange([...selectedLanguages, lang]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-md font-semibold font-lexend text-text-primary">Filters</h3>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors font-lexend"
          >
            Clear All
          </button>
        )}
      </div>

      <FilterSection title="Specialization">
        {specializations.map((spec) => (
          <CheckboxItem
            key={spec}
            label={spec}
            checked={selectedSpecializations.includes(spec)}
            onChange={() => toggleSpecialization(spec)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Language">
        {languages.map((lang) => (
          <CheckboxItem
            key={lang}
            label={lang}
            checked={selectedLanguages.includes(lang)}
            onChange={() => toggleLanguage(lang)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Minimum Rating">
        <div className="flex gap-2">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(rating)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors font-lexend',
                minRating === rating
                  ? 'bg-primary text-white border-primary'
                  : 'text-text-secondary border-gray-200 hover:border-primary/30'
              )}
            >
              {rating === 0 ? 'Any' : `${rating}+`}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
