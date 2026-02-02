'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { RatingSlider } from './RatingSlider';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const REVIEW_TAGS = [
  'Accurate',
  'Helpful',
  'Professional',
  'Friendly',
  'Knowledgeable',
  'Patient',
  'Clear Communication',
  'Highly Recommend',
];

interface ReviewFormProps {
  astrologerName: string;
  astrologerImage?: string;
  sessionType: 'chat' | 'call';
  duration?: string;
  onSubmit: (data: ReviewFormData) => void;
  onSkip?: () => void;
  isLoading?: boolean;
}

export function ReviewForm({
  astrologerName,
  astrologerImage,
  sessionType,
  duration,
  onSubmit,
  onSkip,
  isLoading,
}: ReviewFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      tags: [],
    },
  });

  const rating = watch('rating');

  const handleRatingChange = (value: number) => {
    setValue('rating', value);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      const newTags = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      setValue('tags', newTags);
      return newTags;
    });
  };

  const handleFormSubmit = (data: ReviewFormData) => {
    onSubmit({
      ...data,
      tags: selectedTags,
    });
  };

  return (
    <Card className="p-6">
      {/* Astrologer Info */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar src={astrologerImage} alt={astrologerName} size="lg" />
        <div>
          <h3 className="font-semibold text-text-primary">{astrologerName}</h3>
          <p className="text-sm text-text-muted">
            {sessionType === 'chat' ? 'Chat Session' : 'Call Session'}
            {duration && ` • ${duration}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* Rating */}
        <div className="text-center mb-6">
          <p className="text-sm text-text-secondary mb-3">
            How was your experience?
          </p>
          <RatingSlider
            value={rating}
            onChange={handleRatingChange}
            size="lg"
            className="justify-center"
          />
          {errors.rating && (
            <p className="text-xs text-status-error mt-2">{errors.rating.message}</p>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6">
          <p className="text-sm text-text-secondary mb-3">
            What did you like? (Optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {REVIEW_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-secondary border-gray-300 hover:border-primary'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="text-sm font-medium text-text-primary mb-2 block">
            Write a review (Optional)
          </label>
          <textarea
            {...watch('comment') !== undefined ? {} : {}}
            onChange={(e) => setValue('comment', e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {onSkip && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onSkip}
              disabled={isLoading}
            >
              Skip
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={!rating || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
