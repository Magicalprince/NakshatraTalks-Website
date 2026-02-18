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
  Moon,
  Globe,
  Shield,
  Trash2,
  ChevronRight,
  Loader2,
  Sliders,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

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

interface SettingSection {
  title: string;
  icon: React.ElementType;
  items: SettingItem[];
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

  const settingSections: SettingSection[] = [
    {
      title: 'Preferences',
      icon: Sliders,
      items: [
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
    },
    {
      title: 'Legal & Privacy',
      icon: FileText,
      items: [
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
    },
    {
      title: 'Danger Zone',
      icon: AlertTriangle,
      items: [
        {
          icon: Trash2,
          label: 'Delete Account',
          description: 'Permanently delete your account and data',
          action: () => setIsDeleteModalOpen(true),
          danger: true,
        },
      ],
    },
  ];

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
          {settingSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <section.icon className={`w-4 h-4 ${section.title === 'Danger Zone' ? 'text-status-error' : 'text-text-muted'}`} />
                <h2 className={`text-sm font-semibold font-lexend uppercase tracking-wider ${
                  section.title === 'Danger Zone' ? 'text-status-error' : 'text-text-muted'
                }`}>
                  {section.title}
                </h2>
              </div>

              <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
                {section.items.map((item, itemIndex) => (
                  <SettingRow
                    key={item.label}
                    item={item}
                    isLast={itemIndex === section.items.length - 1}
                  />
                ))}
              </Card>
            </motion.div>
          ))}
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
      className={`flex items-center justify-between p-4 transition-colors duration-200 ${
        !isLast ? 'border-b border-gray-100' : ''
      } ${item.action || item.href ? 'cursor-pointer hover:bg-background-offWhite' : ''} ${
        item.toggle ? 'hover:bg-background-offWhite' : ''
      }`}
      onClick={item.action}
      role={item.action ? 'button' : undefined}
      tabIndex={item.action ? 0 : undefined}
      aria-label={item.action ? item.label : undefined}
      onKeyDown={item.action ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.action?.();
        }
      } : undefined}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            item.danger ? 'bg-status-error/10' : 'bg-background-offWhite'
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
            className={`font-medium text-sm ${
              item.danger ? 'text-status-error' : 'text-text-primary'
            }`}
          >
            {item.label}
          </p>
          {item.description && (
            <p className="text-xs text-text-muted mt-0.5">{item.description}</p>
          )}
        </div>
      </div>

      {item.toggle ? (
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={item.value}
            onChange={(e) => item.onToggle?.(e.target.checked)}
            className="sr-only peer"
            aria-label={`Toggle ${item.label}`}
          />
          <motion.div
            className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary peer-focus-visible:outline-none peer-focus-visible:ring-4 peer-focus-visible:ring-primary/20 relative"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 shadow-sm"
              animate={{
                x: item.value ? 20 : 0,
                borderColor: item.value ? 'rgba(255,255,255,0.8)' : 'rgba(209,213,219,1)',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.div>
        </label>
      ) : (
        <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
          item.danger ? 'text-status-error/50' : 'text-text-muted'
        }`} />
      )}
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} aria-label={`Navigate to ${item.label}`}>
        {content}
      </Link>
    );
  }

  return content;
}
