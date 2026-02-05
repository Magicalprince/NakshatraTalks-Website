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
  ArrowLeft,
  Bell,
  Moon,
  Globe,
  Shield,
  Trash2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SettingItem {
  icon: React.ElementType;
  label: string;
  description?: string;
  action?: () => void;
  href?: string;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

export default function SettingsPage() {
  const { addToast } = useUIStore();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
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

  const settings: SettingItem[][] = [
    // Preferences
    [
      {
        icon: Bell,
        label: 'Push Notifications',
        description: 'Receive notifications for messages and updates',
        toggle: true,
        value: notifications,
        onToggle: setNotifications,
      },
      {
        icon: Moon,
        label: 'Dark Mode',
        description: 'Switch to dark theme',
        toggle: true,
        value: darkMode,
        onToggle: setDarkMode,
      },
      {
        icon: Globe,
        label: 'Language',
        description: 'English',
        action: () => {
          addToast({
            type: 'info',
            title: 'Coming Soon',
            message: 'Language selection will be available soon.',
          });
        },
      },
    ],
    // Legal & Privacy
    [
      {
        icon: Shield,
        label: 'Privacy Policy',
        href: '/privacy',
      },
      {
        icon: Shield,
        label: 'Terms of Service',
        href: '/terms',
      },
    ],
    // Danger Zone
    [
      {
        icon: Trash2,
        label: 'Delete Account',
        description: 'Permanently delete your account and data',
        action: () => setIsDeleteModalOpen(true),
        danger: true,
      },
    ],
  ];

  // Auth loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <div className="bg-white sticky top-0 z-10 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-24 h-6" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-text-primary">Settings</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {settings.map((group, groupIndex) => (
          <motion.div
            key={groupIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <Card className="p-0 overflow-hidden">
              {group.map((item, itemIndex) => (
                <SettingRow
                  key={item.label}
                  item={item}
                  isLast={itemIndex === group.length - 1}
                />
              ))}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        className="max-w-sm"
      >
        <div className="p-6">
          <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-status-error" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary text-center mb-2">
            Delete Account?
          </h3>
          <p className="text-sm text-text-secondary text-center mb-6">
            This action cannot be undone. All your data, including consultation
            history and wallet balance, will be permanently deleted.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-status-error hover:bg-status-error/90"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bottom padding */}
      <div className="h-24" />
    </div>
  );
}

// Setting Row Component
function SettingRow({
  item,
  isLast,
}: {
  item: SettingItem;
  isLast: boolean;
}) {
  const content = (
    <div
      className={`flex items-center justify-between p-4 ${
        !isLast ? 'border-b' : ''
      } ${item.action || item.href ? 'cursor-pointer hover:bg-gray-50' : ''}`}
      onClick={item.action}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            item.danger ? 'bg-status-error/10' : 'bg-gray-100'
          }`}
        >
          <item.icon
            className={`w-5 h-5 ${
              item.danger ? 'text-status-error' : 'text-text-secondary'
            }`}
          />
        </div>
        <div>
          <p
            className={`font-medium ${
              item.danger ? 'text-status-error' : 'text-text-primary'
            }`}
          >
            {item.label}
          </p>
          {item.description && (
            <p className="text-xs text-text-muted">{item.description}</p>
          )}
        </div>
      </div>

      {item.toggle ? (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={item.value}
            onChange={(e) => item.onToggle?.(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      ) : (
        <ChevronRight className="w-5 h-5 text-text-muted" />
      )}
    </div>
  );

  if (item.href) {
    return <Link href={item.href}>{content}</Link>;
  }

  return content;
}
