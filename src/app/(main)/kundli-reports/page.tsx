'use client';

/**
 * Kundli Dashboard Page
 * Displays list of saved Kundli reports with search and create new option
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
  Trash2,
  Share2,
  MoreVertical,
  X,
} from 'lucide-react';
import { Button, Card, Skeleton, Modal } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useUIStore } from '@/stores/ui-store';
import { kundliService } from '@/lib/services/kundli.service';
import { shouldUseMockData } from '@/lib/mock';
import { Kundli } from '@/types/api.types';

// Mock Kundli data for development
const MOCK_KUNDLIS: Kundli[] = [
  {
    id: 'kundli-1',
    userId: 'user-1',
    name: 'Rahul Kumar',
    dateOfBirth: '1990-05-15',
    timeOfBirth: '10:30',
    placeOfBirth: 'Mumbai, Maharashtra',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'kundli-2',
    userId: 'user-1',
    name: 'Priya Sharma',
    dateOfBirth: '1992-08-22',
    timeOfBirth: '14:45',
    placeOfBirth: 'Delhi, India',
    createdAt: '2024-01-10T08:30:00.000Z',
  },
  {
    id: 'kundli-3',
    userId: 'user-1',
    name: 'Amit Singh',
    dateOfBirth: '1988-12-03',
    timeOfBirth: '06:15',
    placeOfBirth: 'Bangalore, Karnataka',
    createdAt: '2024-01-05T15:20:00.000Z',
  },
];

// Format date for display
const formatDate = (dateString: string, timeString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}, ${timeString}`;
};

// Get initials from name
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

interface KundliCardProps {
  kundli: Kundli;
  index: number;
  onPress: () => void;
  onLongPress: () => void;
}

function KundliCard({ kundli, index, onPress, onLongPress }: KundliCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card
        className="p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow relative"
        onClick={onPress}
      >
        <div className="flex items-center">
          {/* Avatar Circle */}
          <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-base font-lexend">
              {getInitials(kundli.name)}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 ml-3 min-w-0">
            <p className="font-semibold text-text-primary truncate font-lexend">
              {kundli.name}
            </p>
            <p className="text-xs text-text-secondary truncate font-lexend">
              {formatDate(kundli.dateOfBirth, kundli.timeOfBirth)}
            </p>
            <p className="text-xs text-text-muted truncate font-lexend">
              {kundli.placeOfBirth}
            </p>
          </div>

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

          <ChevronRight className="w-5 h-5 text-text-muted ml-1" />
        </div>
      </Card>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <Card className="p-4 mb-3">
      <div className="flex items-center">
        <Skeleton className="w-11 h-11 rounded-full" />
        <div className="flex-1 ml-3">
          <Skeleton className="w-32 h-5 mb-1" />
          <Skeleton className="w-48 h-4 mb-1" />
          <Skeleton className="w-36 h-4" />
        </div>
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
      <h3 className="text-lg font-semibold text-text-primary font-lexend">
        No Kundli Reports Yet
      </h3>
      <p className="text-sm text-text-secondary text-center mt-2 max-w-xs font-lexend">
        Create your first Kundli report to see your birth chart and predictions
      </p>
      <Button onClick={onCreatePress} className="mt-5">
        Create Kundli
      </Button>
    </motion.div>
  );
}

export default function KundliDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKundli, setSelectedKundli] = useState<Kundli | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Auth check
  const { isReady } = useRequireAuth();

  // Fetch kundlis
  const { data: kundlisData, isLoading: isKundlisLoading } = useQuery({
    queryKey: ['kundlis'],
    queryFn: async () => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true, data: MOCK_KUNDLIS };
      }
      return kundliService.getKundliList();
    },
    enabled: isReady,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (kundliId: string) => {
      if (shouldUseMockData()) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return { success: true };
      }
      return kundliService.deleteKundli(kundliId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kundlis'] });
      addToast({
        type: 'success',
        title: 'Deleted',
        message: 'Kundli deleted successfully',
      });
      setIsDeleteModalOpen(false);
      setSelectedKundli(null);
    },
    onError: () => {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete Kundli',
      });
    },
  });

  const kundlis = kundlisData?.data || [];

  // Filter kundlis based on search
  const filteredKundlis = useMemo(() => {
    if (!searchQuery.trim()) return kundlis;
    const query = searchQuery.toLowerCase();
    return kundlis.filter(
      (k) =>
        k.name.toLowerCase().includes(query) ||
        k.placeOfBirth.toLowerCase().includes(query)
    );
  }, [kundlis, searchQuery]);

  const handleCardPress = useCallback(
    (kundli: Kundli) => {
      router.push(`/kundli-reports/${kundli.id}`);
    },
    [router]
  );

  const handleLongPress = useCallback((kundli: Kundli) => {
    setSelectedKundli(kundli);
    setIsActionSheetOpen(true);
  }, []);

  const handleCreateNew = useCallback(() => {
    router.push('/kundli/generate');
  }, [router]);

  const handleShare = useCallback(() => {
    if (selectedKundli) {
      // For web, we can use the Web Share API or copy link
      const shareUrl = `${window.location.origin}/kundli-reports/${selectedKundli.id}`;
      if (navigator.share) {
        navigator.share({
          title: `${selectedKundli.name}'s Kundli`,
          text: 'Check out this Kundli report from NakshatraTalks',
          url: shareUrl,
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        addToast({
          type: 'success',
          title: 'Link Copied',
          message: 'Kundli link copied to clipboard',
        });
      }
    }
    setIsActionSheetOpen(false);
  }, [selectedKundli, addToast]);

  const handleDeleteClick = useCallback(() => {
    setIsActionSheetOpen(false);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (selectedKundli) {
      deleteMutation.mutate(selectedKundli.id);
    }
  }, [selectedKundli, deleteMutation]);

  const isLoading = !isReady || isKundlisLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        {/* Yellow Header Background */}
        <div className="bg-secondary rounded-b-3xl pb-4">
          <div className="pt-4 px-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-32 h-6" />
              <div className="w-10" />
            </div>
            <Skeleton className="w-48 h-4 mx-auto mt-2" />
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
              Kundli Reports
            </h1>
            <div className="w-10" />
          </div>
          <p className="text-sm text-text-secondary text-center mt-1 font-lexend">
            View and manage your saved reports
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
              placeholder="Search"
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
          {filteredKundlis.length === 0 && !searchQuery ? (
            <EmptyState onCreatePress={handleCreateNew} />
          ) : filteredKundlis.length === 0 ? (
            <p className="text-center text-text-secondary py-8 font-lexend">
              No results found for &quot;{searchQuery}&quot;
            </p>
          ) : (
            filteredKundlis.map((kundli, index) => (
              <KundliCard
                key={kundli.id}
                kundli={kundli}
                index={index}
                onPress={() => handleCardPress(kundli)}
                onLongPress={() => handleLongPress(kundli)}
              />
            ))
          )}
        </div>

        {/* Create New Button - Fixed at bottom */}
        {(kundlis.length > 0 || searchQuery) && (
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
                Create New Kundli
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Action Sheet Modal */}
      <AnimatePresence>
        {isActionSheetOpen && selectedKundli && (
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
                {selectedKundli.name}
              </h3>
              <p className="text-sm text-text-secondary text-center mb-4 font-lexend">
                Choose an action
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-primary" />
                  <span className="text-text-primary font-medium font-lexend">
                    Share
                  </span>
                </button>
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
            Delete Kundli
          </h3>
          <p className="text-sm text-text-secondary text-center mb-6 font-lexend">
            Are you sure you want to delete &quot;{selectedKundli?.name}&apos;s&quot;
            Kundli? This action cannot be undone.
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
