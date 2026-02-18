'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ReviewForm } from '@/components/features/rating';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUIStore } from '@/stores/ui-store';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useChatSession } from '@/hooks/useChatSession';
import { useCallSession } from '@/hooks/useCallSession';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface SubmitReviewParams {
  sessionId: string;
  sessionType: 'chat' | 'call';
  rating: number;
  comment?: string;
  tags?: string[];
}

export default function RatingPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { addToast } = useUIStore();
  const [sessionType, setSessionType] = useState<'chat' | 'call' | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auth check
  const { isReady } = useRequireAuth();

  // Try fetching as chat session first
  const {
    data: chatSession,
    isLoading: isChatLoading,
    error: chatError,
  } = useChatSession(sessionId);

  // Try fetching as call session
  const {
    data: callSession,
    isLoading: isCallLoading,
    error: callError,
  } = useCallSession(sessionId);

  // Determine session type
  useEffect(() => {
    if (chatSession && !chatError) {
      setSessionType('chat');
    } else if (callSession && !callError) {
      setSessionType('call');
    }
  }, [chatSession, callSession, chatError, callError]);

  // Submit review mutation
  const { mutate: submitReview, isPending: isSubmitting } = useMutation({
    mutationFn: async (params: SubmitReviewParams) => {
      const endpoint =
        params.sessionType === 'chat'
          ? API_ENDPOINTS.CHAT.RATING(params.sessionId)
          : API_ENDPOINTS.CALL.RATING(params.sessionId);

      return apiClient.post(endpoint, {
        rating: params.rating,
        comment: params.comment,
        tags: params.tags,
      });
    },
    onSuccess: () => {
      setIsSubmitted(true);
      addToast({
        type: 'success',
        title: 'Review Submitted',
        message: 'Thank you for your feedback!',
      });
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: error instanceof Error ? error.message : 'Failed to submit review',
      });
    },
  });

  // Handle submit
  const handleSubmit = (data: { rating: number; comment?: string; tags?: string[] }) => {
    if (!sessionType) return;

    submitReview({
      sessionId,
      sessionType,
      rating: data.rating,
      comment: data.comment,
      tags: data.tags,
    });
  };

  // Handle skip
  const handleSkip = () => {
    router.push('/');
  };

  // Get session data
  const session = sessionType === 'chat' ? chatSession?.session : callSession?.session;
  const astrologer = sessionType === 'chat' ? chatSession?.astrologer : callSession?.astrologer;

  // Format duration
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return undefined;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Loading state
  const isLoading = isChatLoading || isCallLoading;

  // Auth loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="sm">
          <div className="py-4">
            <Skeleton className="w-48 h-5 mb-6" />
            <Skeleton className="w-40 h-8 mb-6" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </PageContainer>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="sm">
          <div className="py-4">
            <Skeleton className="w-48 h-5 mb-6" />
            <Skeleton className="w-40 h-8 mb-6" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </PageContainer>
      </div>
    );
  }

  // Error state
  if (!session || (chatError && callError)) {
    return (
      <div className="min-h-screen bg-background-offWhite flex items-center justify-center p-4">
        <PageContainer size="sm">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-status-error" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Session Not Found
            </h2>
            <p className="text-text-secondary mb-4">
              Unable to load session details for rating.
            </p>
            <Link href="/">
              <Button variant="primary">Go Home</Button>
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background-offWhite flex items-center justify-center p-4">
        <PageContainer size="sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-status-success" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Thank You!
            </h2>
            <p className="text-text-secondary mb-6">
              Your feedback helps us improve our service.
            </p>
            <Link href="/">
              <Button variant="primary">Back to Home</Button>
            </Link>
          </motion.div>
        </PageContainer>
      </div>
    );
  }

  // Already rated
  if (session.rating) {
    return (
      <div className="min-h-screen bg-background-offWhite flex items-center justify-center p-4">
        <PageContainer size="sm">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Already Reviewed
            </h2>
            <p className="text-text-secondary mb-4">
              You have already submitted a review for this session.
            </p>
            <Link href="/">
              <Button variant="primary">Go Home</Button>
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="sm">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Rate Experience' },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-6">Rate Experience</h1>

        {/* Content - Centered Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-8"
        >
          <ReviewForm
            astrologerName={astrologer?.name || session.astrologerName || 'Astrologer'}
            astrologerImage={astrologer?.image}
            sessionType={sessionType || 'chat'}
            duration={formatDuration(session.duration)}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            isLoading={isSubmitting}
          />
        </motion.div>
      </PageContainer>
    </div>
  );
}
