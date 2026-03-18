'use client';

import { useState, FormEvent, useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const CATEGORIES = [
  'General',
  'Vedic',
  'Tarot',
  'Numerology',
  'Palmistry',
  'Vastu',
  'Remedies',
  'Relationships',
] as const;

const DURATION_OPTIONS = [30, 60, 90, 120] as const;

interface ScheduleSessionFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    category: string;
    scheduledStartTime: string;
    duration: number;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ScheduleSessionForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ScheduleSessionFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const todayString = useMemo(() => getTodayDateString(), []);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    if (!time) {
      newErrors.time = 'Time is required';
    }

    if (date && time) {
      const selectedDateTime = new Date(`${date}T${time}`);
      if (selectedDateTime <= new Date()) {
        newErrors.date = 'Scheduled time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const scheduledStartTime = new Date(`${date}T${time}`).toISOString();

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      scheduledStartTime,
      duration,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="session-title" className="block text-sm font-medium text-text-primary mb-1">
          Title <span className="text-status-error">*</span>
        </label>
        <input
          id="session-title"
          type="text"
          maxLength={100}
          placeholder="What's your session about?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="mt-1 flex justify-between">
          {errors.title && <p className="text-xs text-status-error">{errors.title}</p>}
          <p className="ml-auto text-xs text-text-tertiary">{title.length}/100</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="session-description" className="block text-sm font-medium text-text-primary mb-1">
          Description
        </label>
        <textarea
          id="session-description"
          maxLength={500}
          rows={3}
          placeholder="Tell viewers what to expect..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
        <p className="mt-1 text-right text-xs text-text-tertiary">{description.length}/500</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Category <span className="text-status-error">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-background-offWhite text-text-secondary hover:bg-primary/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {errors.category && <p className="mt-1 text-xs text-status-error">{errors.category}</p>}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="session-date" className="mb-1 block text-sm font-medium text-text-primary">
            Date <span className="text-status-error">*</span>
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              id="session-date"
              type="date"
              min={todayString}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-white py-3 pl-10 pr-4 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.date && <p className="mt-1 text-xs text-status-error">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="session-time" className="mb-1 block text-sm font-medium text-text-primary">
            Time <span className="text-status-error">*</span>
          </label>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              id="session-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border border-border-light bg-white py-3 pl-10 pr-4 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {errors.time && <p className="mt-1 text-xs text-status-error">{errors.time}</p>}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="mb-2 block text-sm font-medium text-text-primary">
          Duration <span className="text-status-error">*</span>
        </label>
        <div className="flex gap-2">
          {DURATION_OPTIONS.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setDuration(mins)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                duration === mins
                  ? 'bg-primary text-white'
                  : 'bg-background-offWhite text-text-secondary hover:bg-primary/10'
              }`}
            >
              {mins} min
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          Schedule Session
        </Button>
      </div>
    </form>
  );
}
