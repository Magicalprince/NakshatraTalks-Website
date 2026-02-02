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
  ArrowLeft,
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
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

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
      <div className="min-h-screen bg-background-offWhite flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Astrologer Not Found</h2>
          <p className="text-text-secondary mb-4">The astrologer you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/browse-chat">
            <Button variant="primary">Browse Astrologers</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Astrologer Profile</h1>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-primary pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-6"
          >
            <div className="relative">
              <Avatar
                src={profileImage}
                fallback={astrologer.name}
                size="xl"
                className="w-32 h-32 border-4 border-white"
              />
              {astrologer.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1">
                  <CheckCircle className="w-6 h-6 text-status-success" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-1">{astrologer.name}</h2>
              <p className="text-white/80 mb-3">
                {specializations?.slice(0, 3).join(' • ')}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span className="font-semibold">{astrologer.rating?.toFixed(1)}</span>
                  <span className="text-white/60">({reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{astrologer.experience} years</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{totalConsultations}+ consultations</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Card */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Chat */}
                <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Chat</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      <span className="text-lg font-bold">{chatPrice}</span>
                      <span className="text-sm text-text-muted">/min</span>
                    </div>
                  </div>
                  <Button
                    variant={isOnline ? 'primary' : 'outline'}
                    className="w-full"
                    disabled={!isOnline}
                    onClick={() => handleAction('chat')}
                  >
                    {isOnline ? 'Start Chat' : 'Busy'}
                  </Button>
                </div>

                {/* Call */}
                <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Call</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      <span className="text-lg font-bold">{callPrice}</span>
                      <span className="text-sm text-text-muted">/min</span>
                    </div>
                  </div>
                  <Button
                    variant={isOnline ? 'primary' : 'outline'}
                    className="w-full"
                    disabled={!isOnline}
                    onClick={() => handleAction('call')}
                  >
                    {isOnline ? 'Start Call' : 'Busy'}
                  </Button>
                </div>
              </div>

              {/* Availability Status */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-status-success' : 'bg-gray-400'
                  }`}
                />
                <span className={isOnline ? 'text-status-success' : 'text-text-muted'}>
                  {isOnline ? 'Online Now' : 'Currently Offline'}
                </span>
              </div>
            </Card>

            {/* About */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                About
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {astrologer.bio || 'No bio available.'}
              </p>
            </Card>

            {/* Specializations */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
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
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5" />
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
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <ThumbsUp className="w-5 h-5" />
                Reviews ({reviewCount})
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
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Avatar fallback={review.userName} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-text-primary">{review.userName}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= review.rating
                                      ? 'fill-secondary text-secondary'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-text-secondary">{review.comment}</p>
                          <span className="text-xs text-text-muted mt-1 block">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-center py-4">No reviews yet</p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="p-6">
              <h3 className="font-semibold text-text-primary mb-4">Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Experience</span>
                  <span className="font-medium">{astrologer.experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Consultations</span>
                  <span className="font-medium">{totalConsultations}+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Rating</span>
                  <span className="font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    {astrologer.rating?.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Reviews</span>
                  <span className="font-medium">{reviewCount}</span>
                </div>
              </div>
            </Card>

            {/* Availability Card */}
            {availabilityData && (
              <Card className="p-6">
                <h3 className="font-semibold text-text-primary mb-4">Availability</h3>
                <div className="text-center">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      availabilityData.isOnline
                        ? 'bg-status-success/10 text-status-success'
                        : 'bg-gray-100 text-text-muted'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        availabilityData.isOnline ? 'bg-status-success' : 'bg-gray-400'
                      }`}
                    />
                    {availabilityData.isOnline ? 'Available Now' : 'Currently Offline'}
                  </span>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom spacing for mobile */}
      <div className="h-24" />
    </div>
  );
}

function AstrologerDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background-offWhite">
      <div className="bg-primary h-48" />
      <div className="container mx-auto px-4 -mt-12">
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="w-32 h-32 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </Card>
      </div>
    </div>
  );
}
