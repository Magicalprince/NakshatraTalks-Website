'use client';

/**
 * Kundli Matching Dashboard Page
 * Displays list of saved Kundli Matching reports
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  Plus,
  Heart,
  Trash2,
  MoreVertical,
  X,
} from 'lucide-react';
import { Button, Card, Skeleton, Modal } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useUIStore } from '@/stores/ui-store';
import { kundliService } from '@/lib/services/kundli.service';
import { shouldUseMockData } from '@/lib/mock';
import { MatchingReport } from '@/types/api.types';

// Extended matching type with additional fields
interface SavedMatching extends MatchingReport {
  boy: { name: string; dateOfBirth: string };
  girl: { name: string; dateOfBirth: string };
  score: number;
}

// Mock Matching data for development
const MOCK_MATCHINGS: SavedMatching[] = [
  {
    id: 'matching-1',
    totalPoints: 28,
    maxPoints: 36,
    percentage: 78,
    categories: {},
    recommendation: 'Good match with minor adjustments needed.',
    createdAt: '2024-01-15T10:00:00.000Z',
    boy: { name: 'Rahul Kumar', dateOfBirth: '1990-05-15' },
    girl: { name: 'Priya Sharma', dateOfBirth: '1992-08-22' },
    score: 28,
  },
  {
    id: 'matching-2',
    totalPoints: 32,
    maxPoints: 36,
    percentage: 89,
    categories: {},
    recommendation: 'Excellent match! Highly compatible.',
    createdAt: '2024-01-10T08:30:00.000Z',
    boy: { name: 'Amit Singh', dateOfBirth: '1988-12-03' },
    girl: { name: 'Neha Patel', dateOfBirth: '1991-04-18' },
    score: 32,
  },
  {
    id: 'matching-3',
    totalPoints: 18,
    maxPoints: 36,
    percentage: 50,
    categories: {},
    recommendation: 'Average match. Remedies suggested.',
    createdAt: '2024-01-05T15:20:00.000Z',
    boy: { name: 'Vikram Reddy', dateOfBirth: '1993-07-25' },
    girl: { name: 'Kavya Menon', dateOfBirth: '1995-11-12' },
    score: 18,
  },
];

// Get initials from name
const getInitials = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

// Get score color
const getScoreColor = (score: number): { bg: string; text: string } => {
  if (score >= 25) return { bg: 'bg-green-100', text: 'text-green-600' };
  if (score >= 18) return { bg: 'bg-amber-100', text: 'text-amber-600' };
  return { bg: 'bg-red-100', text: 'text-red-600' };
};

interface MatchingCardProps {
  matching: SavedMatching;
  index: number;
  onPress: () => void;
  onLongPress: () => void;
}

function MatchingCard({ matching, index, onPress, onLongPress }: MatchingCardProps) {
  const scoreColors = getScoreColor(matching.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card
        className="p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onPress}
      >
        <div className="flex items-center">
          {/* Avatars with Heart */}
          <div className="flex items-center -space-x-2">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center z-10">
              <span className="text-white font-semibold text-sm font-lexend">
                {getInitials(matching.boy.name)}
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center z-20">
              <Heart className="w-3 h-3 text-white" fill="white" />
            </div>
            <div className="w-9 h-9 rounded-full bg-pink-400 flex items-center justify-center z-10">
              <span className="text-white font-semibold text-sm font-lexend">
                {getInitials(matching.girl.name)}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 ml-4 min-w-0">
            <p className="font-semibold text-text-primary truncate font-lexend">
              {matching.boy.name} & {matching.girl.name}
            </p>
            <p className="text-xs text-text-secondary font-lexend">
              Created: {new Date(matching.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Score Badge */}
          {matching.score > 0 && (
            <div
              className={`px-2.5 py-1 rounded-full ${scoreColors.bg} mr-2`}
            >
              <span className={`text-xs font-semibold ${scoreColors.text} font-lexend`}>
                {matching.score}/36
              </span>
            </div>
          )}

          {/* Actions */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLongPress();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-text-secondary" />
          </button>

          <ChevronRight className="w-5 h-5 text-text-muted" />
        </div>
      </Card>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <Card className="p-4 mb-3">
      <div className="flex items-center">
        <div className="flex items-center -space-x-2">
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
        <div className="flex-1 ml-4">
          <Skeleton className="w-40 h-5 mb-1" />
          <Skeleton className="w-28 h-4" />
        </div>
        <Skeleton className="w-14 h-6 rounded-full" />
      </div>
    </Card>
  );
}

function EmptyState({ onCreatePress }: { onCreatePress: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <Heart className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary font-lexend">
        No Matching Reports Yet
      </h3>
      <p className="text-sm text-text-secondary text-center mt-2 max-w-xs font-lexend">
        Create your first Kundli matching report to check compatibility
      </p>
      <Button onClick={onCreatePress} className="mt-5">
        Create Report
      </Button>
    </motion.div>
  );
}

export default function KundliMatchingDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatching, setSelectedMatching] = useState<SavedMatching | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Auth check
  const { isReady } = useRequireAuth();

  // Fetch matchings
  const { data: matchingsData, isLoading: isMatchingsLoading } = useQuery({
    queryKey: ['matchings'],
    queryFn: async () => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true, data: MOCK_MATCHINGS };
      }
      const response = await kundliService.getMatchingList();
      return response;
    },
    enabled: isReady,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (matchingId: string) => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true };
      }
      return kundliService.deleteMatching(matchingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matchings'] });
      addToast({
        type: 'success',
        title: 'Deleted',
        message: 'Matching report deleted successfully',
      });
      setIsDeleteModalOpen(false);
      setSelectedMatching(null);
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete matching report',
      });
    },
  });

  const matchings = (matchingsData?.data as SavedMatching[]) || [];

  // Filter matchings based on search
  const filteredMatchings = useMemo(() => {
    if (!searchQuery.trim()) return matchings;
    const query = searchQuery.toLowerCase();
    return matchings.filter(
      (m) =>
        m.boy.name.toLowerCase().includes(query) ||
        m.girl.name.toLowerCase().includes(query)
    );
  }, [matchings, searchQuery]);

  const handleCardPress = useCallback(
    (matching: SavedMatching) => {
      router.push(`/kundli-matching/${matching.id}`);
    },
    [router]
  );

  const handleLongPress = useCallback((matching: SavedMatching) => {
    setSelectedMatching(matching);
    setIsActionSheetOpen(true);
  }, []);

  const handleCreateNew = useCallback(() => {
    router.push('/kundli-matching/create');
  }, [router]);

  const handleDeleteClick = useCallback(() => {
    setIsActionSheetOpen(false);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedMatching) {
      deleteMutation.mutate(selectedMatching.id);
    }
  }, [selectedMatching, deleteMutation]);

  const isLoading = !isReady || isMatchingsLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        {/* Yellow Header Background */}
        <div className="bg-secondary rounded-b-3xl pb-4">
          <div className="pt-4 px-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-40 h-6" />
              <div className="w-10" />
            </div>
            <Skeleton className="w-52 h-4 mx-auto mt-2" />
          </div>
        </div>

        {/* Search and Cards */}
        <div className="bg-white rounded-t-3xl -mt-4 min-h-[calc(100vh-200px)]">
          <div className="p-4">
            <Skeleton className="h-12 rounded-full" />
          </div>
          <div className="px-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Yellow Header Background */}
      <div className="bg-secondary rounded-b-3xl pb-4">
        <div className="pt-4 px-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-6 h-6 text-text-dark" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-text-dark font-lexend">
              Kundli Matching
            </h1>
            <div className="w-10" />
          </div>
          <p className="text-sm text-text-secondary text-center mt-1 font-lexend">
            View and manage your compatibility reports
          </p>
        </div>
      </div>

      {/* White Content Area */}
      <div className="bg-white rounded-t-3xl -mt-4 min-h-[calc(100vh-160px)]">
        {/* Search Bar */}
        <div className="p-4">
          <div className="flex items-center bg-background-offWhite rounded-full px-4 h-12 border border-gray-200">
            <Search className="w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent ml-3 outline-none text-sm font-lexend"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-4 h-4 text-text-muted" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-32">
          {filteredMatchings.length === 0 && !searchQuery ? (
            <EmptyState onCreatePress={handleCreateNew} />
          ) : filteredMatchings.length === 0 ? (
            <p className="text-center text-text-secondary py-8 font-lexend">
              No results found for &quot;{searchQuery}&quot;
            </p>
          ) : (
            filteredMatchings.map((matching, index) => (
              <MatchingCard
                key={matching.id}
                matching={matching}
                index={index}
                onPress={() => handleCardPress(matching)}
                onLongPress={() => handleLongPress(matching)}
              />
            ))
          )}
        </div>

        {/* Create New Button - Fixed at bottom */}
        {(matchings.length > 0 || searchQuery) && (
          <div className="fixed bottom-24 left-0 right-0 px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleCreateNew}
                className="w-full h-14 rounded-full text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Matching
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Action Sheet Modal */}
      <AnimatePresence>
        {isActionSheetOpen && selectedMatching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={() => setIsActionSheetOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-lg rounded-t-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-primary text-center mb-1 font-lexend">
                {selectedMatching.boy.name} & {selectedMatching.girl.name}
              </h3>
              <p className="text-sm text-text-secondary text-center mb-4 font-lexend">
                Choose an action
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleDeleteClick}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-status-error" />
                  <span className="text-status-error font-medium font-lexend">
                    Delete
                  </span>
                </button>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setIsActionSheetOpen(false)}
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="max-w-sm"
      >
        <div className="p-6">
          <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-status-error" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary text-center mb-2 font-lexend">
            Delete Matching Report
          </h3>
          <p className="text-sm text-text-secondary text-center mb-6 font-lexend">
            Are you sure you want to delete this matching report? This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-status-error hover:bg-status-error/90"
              onClick={handleConfirmDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bottom padding for navigation */}
      <div className="h-20" />
    </div>
  );
}
