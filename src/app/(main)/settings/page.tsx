'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUIStore } from '@/stores/ui-store';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useDeleteAccount } from '@/hooks/useUserProfile';
import {
  Bell,
  Shield,
  Trash2,
  Loader2,
  Sliders,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { SectionHeader, SettingRow } from '@/components/shared';

export default function SettingsPage() {
  const { addToast } = useUIStore();
  const [notifications, setNotifications] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Auth protection
  const { isReady } = useRequireAuth();

  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

  // Handle delete account
  const handleDeleteAccount = () => {
    deleteAccount(undefined, {
      onSuccess: () => {
        addToast({
          type: 'success',
          title: 'Account Deleted',
          message: 'Your account has been permanently deleted.',
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Deletion Failed',
          message: error instanceof Error ? error.message : 'Failed to delete account',
        });
      },
    });
  };

  // Auth loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="md">
          <div className="py-4">
            <Skeleton className="w-48 h-5 mb-6 rounded-lg skeleton-shimmer" />
            <Skeleton className="w-32 h-8 mb-8 rounded-lg skeleton-shimmer" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-web-sm">
                  <div className="px-5 py-3 border-b border-gray-100">
                    <Skeleton className="h-4 w-28 rounded skeleton-shimmer" />
                  </div>
                  {Array.from({ length: i === 1 ? 3 : i === 2 ? 2 : 1 }).map((_, j) => (
                    <div key={j} className="p-4 flex items-center gap-3 border-b border-gray-50 last:border-0">
                      <Skeleton className="w-10 h-10 rounded-full skeleton-shimmer" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32 rounded skeleton-shimmer" />
                        <Skeleton className="h-3 w-48 rounded skeleton-shimmer" />
                      </div>
                      <Skeleton className="h-6 w-11 rounded-full skeleton-shimmer" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="md">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Settings' },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-6">Settings</h1>

        {/* Content */}
        <div className="space-y-6">
          {/* Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <SectionHeader icon={Sliders} title="Preferences" />
            <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
              <SettingRow
                icon={Bell}
                label="Push Notifications"
                description="Receive notifications for messages and updates"
                toggle
                checked={notifications}
                onToggle={setNotifications}
                isLast
              />
            </Card>
          </motion.div>

          {/* Legal & Privacy Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SectionHeader icon={FileText} title="Legal & Privacy" />
            <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
              <SettingRow
                icon={Shield}
                label="Privacy Policy"
                href="/privacy"
              />
              <SettingRow
                icon={Shield}
                label="Terms of Service"
                href="/terms"
                isLast
              />
            </Card>
          </motion.div>

          {/* Danger Zone Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SectionHeader icon={AlertTriangle} title="Danger Zone" variant="danger" />
            <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
              <SettingRow
                icon={Trash2}
                label="Delete Account"
                description="Permanently delete your account and data"
                onClick={() => setIsDeleteModalOpen(true)}
                danger
                isLast
              />
            </Card>
          </motion.div>
        </div>
      </PageContainer>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="max-w-sm"
      >
        <div className="overflow-hidden rounded-lg">
          {/* Warning gradient header */}
          <div className="bg-gradient-to-br from-status-error via-status-error/90 to-status-error/80 px-6 py-5 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute top-2 left-8 w-12 h-12 rounded-full bg-white/10" />
              <div className="absolute bottom-1 right-6 w-8 h-8 rounded-full bg-white/[0.07]" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white font-lexend">
                Delete Account?
              </h3>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 bg-white">
            <p className="text-sm text-text-secondary text-center mb-6 leading-relaxed">
              This action <span className="font-semibold text-status-error">cannot be undone</span>. All your data, including consultation
              history and wallet balance, will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                aria-label="Cancel account deletion"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-status-error hover:bg-status-error/90 shadow-web-sm"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                aria-label="Confirm account deletion"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
