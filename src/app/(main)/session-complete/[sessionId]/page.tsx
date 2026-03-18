'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { chatService } from '@/lib/services/chat.service';
import { callService } from '@/lib/services/call.service';
import { useUIStore } from '@/stores/ui-store';
import Image from 'next/image';

export default function SessionCompletePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToast = useUIStore((s) => s.addToast);

  const sessionId = params.sessionId as string;
  const sessionType = (searchParams.get('type') ?? 'chat') as 'chat' | 'call';
  const astrologerName = searchParams.get('astrologer') ?? 'Astrologer';
  const astrologerImage = searchParams.get('image') ?? '';
  const durationSeconds = parseInt(searchParams.get('duration') ?? '0', 10);
  const totalCost = parseFloat(searchParams.get('cost') ?? '0');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formattedDuration = `${Math.floor(durationSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(durationSeconds % 60).toString().padStart(2, '0')}`;

  const handleSubmitRating = async () => {
    if (rating === 0) {
      addToast({ type: 'warning', title: 'Please select a rating' });
      return;
    }

    setSubmitting(true);
    try {
      const service = sessionType === 'call' ? callService : chatService;
      const res = await service.rateSession(sessionId, rating, review || undefined);

      if (res.success) {
        addToast({ type: 'success', title: 'Thank you for your feedback!' });
        router.push('/');
      } else {
        addToast({ type: 'error', title: 'Failed to submit rating. Please try again.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Success Header */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle2 className="w-16 h-16 text-status-success mb-3" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary font-lexend">
            Session Complete
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Your {sessionType} session has ended
          </p>
        </div>

        {/* Session Summary */}
        <div className="bg-background-offWhite rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-background-surface flex-shrink-0">
              {astrologerImage ? (
                <Image
                  src={decodeURIComponent(astrologerImage)}
                  alt={astrologerName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary">
                  {astrologerName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-text-primary font-lexend">
                {decodeURIComponent(astrologerName)}
              </p>
              <p className="text-xs text-text-secondary capitalize">
                {sessionType} Session
              </p>
            </div>
          </div>

          <div className="flex justify-between border-t border-border pt-3">
            <div className="text-center flex-1">
              <p className="text-xs text-text-secondary">Duration</p>
              <p className="text-lg font-semibold text-text-primary font-lexend">
                {formattedDuration}
              </p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center flex-1">
              <p className="text-xs text-text-secondary">Total Cost</p>
              <p className="text-lg font-semibold text-text-primary font-lexend">
                ₹{totalCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Star Rating */}
        <div className="mb-4">
          <p className="text-sm font-medium text-text-primary mb-3 text-center">
            How was your experience?
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-9 h-9 transition-colors ${
                    star <= activeRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-none text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Review Text Area */}
        <div className="mb-6">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={3}
            className="w-full rounded-xl border border-border bg-background-offWhite p-3 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary resize-none font-lexend"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSubmitRating}
            isLoading={submitting}
            disabled={submitting}
          >
            Submit Rating
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="w-full"
            onClick={handleGoHome}
            disabled={submitting}
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
