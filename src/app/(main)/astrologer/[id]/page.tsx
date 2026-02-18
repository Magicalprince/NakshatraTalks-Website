'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAstrologerDetails, useAstrologerReviews, useAstrologerAvailability } from '@/hooks/useBrowseData';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useQueueStore } from '@/stores/queue-store';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Star,
  MessageCircle,
  Phone,
  Clock,
  Languages,
  IndianRupee,
  Briefcase,
  CheckCircle,
  Award,
  Users,
  ThumbsUp,
  SearchX,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

/** Renders a row of star icons for a given rating (1-5). */
function StarRating({
  rating,
  size = 'sm',
  className = '',
}: {
  rating: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  const sizeClass = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className={`flex items-center gap-0.5 ${className}`} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function AstrologerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const { createRequest, setSelectedAstrologer } = useQueueStore();

  // Fetch astrologer details
  const { data: astrologer, isLoading } = useAstrologerDetails(id);

  // Fetch reviews
  const { data: reviewsData, isLoading: isReviewsLoading } = useAstrologerReviews(id);

  // Fetch availability
  const { data: availabilityData } = useAstrologerAvailability(id);

  // Flatten reviews
  const reviews = useMemo(() => {
    if (!reviewsData?.pages) return [];
    return reviewsData.pages.flatMap((page) => page?.data || []);
  }, [reviewsData]);

  // Computed properties with fallbacks for both naming conventions
  const isOnline = astrologer?.isOnline ?? astrologer?.isAvailable ?? false;
  const profileImage = astrologer?.profileImage ?? astrologer?.image;
  const specializations = astrologer?.specializations ?? astrologer?.specialization ?? [];
  const reviewCount = astrologer?.reviewCount ?? astrologer?.totalReviews ?? 0;
  const totalConsultations = astrologer?.totalConsultations ?? astrologer?.totalCalls ?? 0;
  const chatPrice = astrologer?.chatPrice ?? astrologer?.chatPricePerMinute ?? astrologer?.pricePerMinute ?? 0;
  const callPrice = astrologer?.callPrice ?? astrologer?.callPricePerMinute ?? astrologer?.pricePerMinute ?? 0;

  const handleAction = (type: 'chat' | 'call') => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: 'Login Required',
        message: `Please login to start a ${type} session`,
      });
      router.push(`/login?redirect=/astrologer/${id}`);
      return;
    }

    if (!isOnline) {
      addToast({
        type: 'warning',
        title: 'Astrologer Unavailable',
        message: `${astrologer?.name} is currently busy. Please try again later.`,
      });
      return;
    }

    if (astrologer) {
      setSelectedAstrologer(astrologer);
      createRequest(astrologer, type);
    }
  };

  if (isLoading) {
    return <AstrologerDetailSkeleton />;
  }

  if (!astrologer) {
    return (
      <div className="min-h-screen bg-background-offWhite flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          {/* Illustration-style 404 */}
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-primary/5">
            <SearchX className="h-14 w-14 text-primary/40" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2 font-lexend">
            Astrologer Not Found
          </h2>
          <p className="text-text-secondary mb-6 font-nunito leading-relaxed">
            The astrologer you&apos;re looking for doesn&apos;t exist or may have been removed. Try browsing our available astrologers instead.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              aria-label="Go back to previous page"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Link href="/browse-chat">
              <Button variant="primary" aria-label="Browse all astrologers">
                Browse Astrologers
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Chat with Astrologer', href: '/browse-chat' },
            { label: astrologer.name },
          ]}
        />

        {/* Profile Header Section -- refined card layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 md:p-8 mb-8 border border-border-default/60">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative flex-shrink-0">
                <Avatar
                  src={profileImage}
                  fallback={astrologer.name}
                  size="xl"
                  className="w-32 h-32 border-4 border-primary/10 shadow-web-sm"
                />
                {astrologer.isVerified && (
                  <div
                    className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-web-sm"
                    aria-label="Verified astrologer"
                  >
                    <CheckCircle className="w-6 h-6 text-status-success" />
                  </div>
                )}
              </div>

              <div className="text-center md:text-left flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-text-primary font-lexend mb-1">
                  {astrologer.name}
                </h1>
                <p className="text-text-secondary mb-3 font-lexend">
                  {specializations?.slice(0, 3).join(' | ')}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-text-secondary">
                  <div className="flex items-center gap-1.5" aria-label={`Rating: ${astrologer.rating?.toFixed(1)} out of 5`}>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-text-primary">{astrologer.rating?.toFixed(1)}</span>
                    <span className="text-text-muted">({reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5" aria-label={`${astrologer.experience} years experience`}>
                    <Clock className="w-4 h-4 text-text-muted" />
                    <span>{astrologer.experience} years</span>
                  </div>
                  <div className="flex items-center gap-1.5" aria-label={`${totalConsultations}+ total consultations`}>
                    <Users className="w-4 h-4 text-text-muted" />
                    <span>{totalConsultations}+ consultations</span>
                  </div>
                </div>

                {/* Online Status */}
                <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    {isOnline && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                        isOnline ? 'bg-status-success' : 'bg-text-muted'
                      }`}
                    />
                  </span>
                  <span className={isOnline ? 'text-status-success font-medium' : 'text-text-muted'}>
                    {isOnline ? 'Online Now' : 'Currently Offline'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card className="p-6" aria-labelledby="about-heading">
              <h3 id="about-heading" className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-lexend">
                <Briefcase className="w-5 h-5 text-primary/70" />
                About
              </h3>
              <p className="text-text-secondary leading-relaxed font-nunito">
                {astrologer.bio || 'No bio available.'}
              </p>
            </Card>

            {/* Specializations */}
            <Card className="p-6" aria-labelledby="specializations-heading">
              <h3 id="specializations-heading" className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-lexend">
                <Award className="w-5 h-5 text-primary/70" />
                Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {specializations?.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Languages */}
            <Card className="p-6" aria-labelledby="languages-heading">
              <h3 id="languages-heading" className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-lexend">
                <Languages className="w-5 h-5 text-primary/70" />
                Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {astrologer.languages?.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6" aria-labelledby="reviews-heading">
              <h3 id="reviews-heading" className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2 font-lexend">
                <ThumbsUp className="w-5 h-5 text-primary/70" />
                Reviews
                <span className="ml-1 text-sm font-normal text-text-muted">({reviewCount})</span>
              </h3>

              {isReviewsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-border-default/60 bg-background-offWhite/40 p-4 transition-shadow hover:shadow-web-sm"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar fallback={review.userName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-text-primary font-lexend truncate">
                              {review.userName}
                            </span>
                            <StarRating rating={review.rating} size="xs" />
                          </div>
                          <p className="text-sm text-text-secondary font-nunito leading-relaxed">
                            {review.comment}
                          </p>
                          <time className="text-xs text-text-muted mt-1.5 block font-nunito">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background-offWhite">
                    <ThumbsUp className="w-5 h-5 text-text-muted" />
                  </div>
                  <p className="text-text-muted font-nunito">No reviews yet</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Action Cards (Sticky) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Action Card -- subtle glow border */}
              <div className="relative rounded-xl p-[1px] bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10">
                <Card className="p-6 rounded-[11px]" aria-labelledby="consultation-heading">
                  <h3 id="consultation-heading" className="font-semibold text-text-primary mb-4 font-lexend">
                    Consultation
                  </h3>
                  <div className="space-y-4">
                    {/* Chat */}
                    <div className="p-4 bg-background-offWhite rounded-xl border border-border-default/40">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <MessageCircle className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-semibold font-lexend">Chat</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5 text-status-success" />
                          <span className="text-lg font-bold text-text-primary font-lexend">{chatPrice}</span>
                          <span className="text-sm text-text-muted font-lexend">/min</span>
                        </div>
                      </div>
                      <Button
                        variant={isOnline ? 'primary' : 'outline'}
                        className="w-full"
                        disabled={!isOnline}
                        onClick={() => handleAction('chat')}
                        aria-label={isOnline ? `Start chat with ${astrologer.name}` : `${astrologer.name} is currently busy`}
                      >
                        {isOnline ? 'Start Chat' : 'Busy'}
                      </Button>
                    </div>

                    {/* Call */}
                    <div className="p-4 bg-background-offWhite rounded-xl border border-border-default/40">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-semibold font-lexend">Call</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5 text-status-success" />
                          <span className="text-lg font-bold text-text-primary font-lexend">{callPrice}</span>
                          <span className="text-sm text-text-muted font-lexend">/min</span>
                        </div>
                      </div>
                      <Button
                        variant={isOnline ? 'primary' : 'outline'}
                        className="w-full"
                        disabled={!isOnline}
                        onClick={() => handleAction('call')}
                        aria-label={isOnline ? `Start call with ${astrologer.name}` : `${astrologer.name} is currently busy`}
                      >
                        {isOnline ? 'Start Call' : 'Busy'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Stats Card */}
              <Card className="p-6" aria-labelledby="stats-heading">
                <h3 id="stats-heading" className="font-semibold text-text-primary mb-4 font-lexend">Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary font-nunito">Experience</span>
                    <span className="font-medium font-lexend">{astrologer.experience} years</span>
                  </div>
                  <div className="h-px bg-border-default/60" />
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary font-nunito">Consultations</span>
                    <span className="font-medium font-lexend">{totalConsultations}+</span>
                  </div>
                  <div className="h-px bg-border-default/60" />
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary font-nunito">Rating</span>
                    <span className="font-medium flex items-center gap-1 font-lexend">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {astrologer.rating?.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-px bg-border-default/60" />
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary font-nunito">Reviews</span>
                    <span className="font-medium font-lexend">{reviewCount}</span>
                  </div>
                </div>
              </Card>

              {/* Availability Card */}
              {availabilityData && (
                <Card className="p-6" aria-labelledby="availability-heading">
                  <h3 id="availability-heading" className="font-semibold text-text-primary mb-4 font-lexend">
                    Availability
                  </h3>
                  <div className="text-center">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        availabilityData.isOnline
                          ? 'bg-status-success/10 text-status-success'
                          : 'bg-background-offWhite text-text-muted'
                      }`}
                    >
                      <span className="relative flex h-2 w-2">
                        {availabilityData.isOnline && (
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-75" />
                        )}
                        <span
                          className={`relative inline-flex h-2 w-2 rounded-full ${
                            availabilityData.isOnline ? 'bg-status-success' : 'bg-text-muted'
                          }`}
                        />
                      </span>
                      {availabilityData.isOnline ? 'Available Now' : 'Currently Offline'}
                    </span>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function AstrologerDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        <div className="py-4">
          {/* Breadcrumb skeleton */}
          <Skeleton className="w-64 h-5 mb-6" />

          {/* Profile header card skeleton */}
          <div className="rounded-xl bg-white border border-border-default/60 p-6 md:p-8 mb-8 shadow-card">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 space-y-3 w-full">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-36" />
                <div className="flex gap-4 pt-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About skeleton */}
              <div className="rounded-xl bg-white p-6 shadow-card">
                <Skeleton className="h-5 w-24 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              {/* Specializations skeleton */}
              <div className="rounded-xl bg-white p-6 shadow-card">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-28 rounded-full" />
                </div>
              </div>
              {/* Reviews skeleton */}
              <div className="rounded-xl bg-white p-6 shadow-card">
                <Skeleton className="h-5 w-28 mb-4" />
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {/* Consultation card skeleton */}
              <div className="rounded-xl bg-white p-6 shadow-card">
                <Skeleton className="h-5 w-28 mb-4" />
                <div className="space-y-4">
                  <div className="p-4 bg-background-offWhite rounded-xl">
                    <div className="flex justify-between mb-3">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="p-4 bg-background-offWhite rounded-xl">
                    <div className="flex justify-between mb-3">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
              </div>
              {/* Stats skeleton */}
              <div className="rounded-xl bg-white p-6 shadow-card">
                <Skeleton className="h-5 w-16 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
