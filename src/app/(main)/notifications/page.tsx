'use client';

/**
 * Notifications Page
 * Modern 2026 design with grouped notifications, inline actions,
 * shimmer skeletons, staggered animations, and inline clear-all confirmation.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  Bell,
  Phone,
  MessageCircle,
  Wallet,
  Gift,
  CheckCircle,
  Trash2,
  CheckCheck,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { cn } from '@/utils/cn';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

// ─── Types ──────────────────────────────────────────────────────────────────────

type NotificationType = 'call' | 'chat' | 'wallet' | 'promo' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  date: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    astrologerName?: string;
    astrologerImage?: string;
    amount?: number;
    sessionId?: string;
  };
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'chat',
    title: 'Chat Session Ended',
    message: 'Your chat session with Pandit Sharma has ended. Duration: 15 mins. Total: \u20B9375.',
    timestamp: '10:30 AM',
    date: 'Today',
    isRead: false,
    actionUrl: '/history/chat',
    metadata: {
      astrologerName: 'Pandit Sharma',
      sessionId: 'session-1',
    },
  },
  {
    id: 'notif-2',
    type: 'wallet',
    title: 'Wallet Recharged',
    message: 'Your wallet has been credited with \u20B9500. Current balance: \u20B91,250.',
    timestamp: '09:45 AM',
    date: 'Today',
    isRead: false,
    actionUrl: '/wallet',
    metadata: {
      amount: 500,
    },
  },
  {
    id: 'notif-3',
    type: 'promo',
    title: 'Special Offer!',
    message: 'Get 20% extra on your next recharge of \u20B91,000 or more. Limited time offer!',
    timestamp: '08:00 AM',
    date: 'Today',
    isRead: true,
    actionUrl: '/recharge',
  },
  {
    id: 'notif-4',
    type: 'call',
    title: 'Missed Call',
    message: 'You missed a call from Astrologer Priya. Tap to call back.',
    timestamp: '11:30 PM',
    date: 'Yesterday',
    isRead: true,
    metadata: {
      astrologerName: 'Astrologer Priya',
    },
  },
  {
    id: 'notif-5',
    type: 'system',
    title: 'Profile Updated',
    message: 'Your birth details have been updated successfully.',
    timestamp: '03:15 PM',
    date: 'Yesterday',
    isRead: true,
  },
  {
    id: 'notif-6',
    type: 'chat',
    title: 'Rate Your Session',
    message: 'How was your chat with Acharya Ji? Share your feedback.',
    timestamp: '02:00 PM',
    date: 'Yesterday',
    isRead: true,
    actionUrl: '/rating/session-2',
    metadata: {
      astrologerName: 'Acharya Ji',
      sessionId: 'session-2',
    },
  },
  {
    id: 'notif-7',
    type: 'wallet',
    title: 'Low Balance Alert',
    message: 'Your wallet balance is low. Recharge now to continue consultations.',
    timestamp: '10:00 AM',
    date: '2 days ago',
    isRead: true,
    actionUrl: '/recharge',
  },
];

// ─── Tabs ───────────────────────────────────────────────────────────────────────

type TabOption = 'all' | 'sessions' | 'wallet' | 'offers';

const TABS: { value: TabOption; label: string; filterTypes: NotificationType[] }[] = [
  { value: 'all', label: 'All', filterTypes: [] },
  { value: 'sessions', label: 'Sessions', filterTypes: ['call', 'chat'] },
  { value: 'wallet', label: 'Wallet', filterTypes: ['wallet'] },
  { value: 'offers', label: 'Offers', filterTypes: ['promo'] },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'call':
      return Phone;
    case 'chat':
      return MessageCircle;
    case 'wallet':
      return Wallet;
    case 'promo':
      return Gift;
    default:
      return Bell;
  }
};

const getIconColors = (type: NotificationType) => {
  switch (type) {
    case 'call':
      return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-400' };
    case 'chat':
      return { bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary' };
    case 'wallet':
      return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-400' };
    case 'promo':
      return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-400' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-400' };
  }
};

const getUnreadTint = (type: NotificationType) => {
  switch (type) {
    case 'call':
      return 'bg-green-50/40';
    case 'chat':
      return 'bg-primary/[0.03]';
    case 'wallet':
      return 'bg-amber-50/40';
    case 'promo':
      return 'bg-pink-50/40';
    default:
      return 'bg-gray-50/40';
  }
};

// ─── Swipeable Notification Card ────────────────────────────────────────────────

interface NotificationCardProps {
  notification: Notification;
  index: number;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationCard({ notification, index, onMarkRead, onDelete }: NotificationCardProps) {
  const Icon = getNotificationIcon(notification.type);
  const colors = getIconColors(notification.type);
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-120, -60], [1, 0]);
  const deleteScale = useTransform(x, [-120, -60], [1, 0.8]);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(notification.id);
    }
  };

  const cardContent = (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.25 } }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-3 overflow-hidden rounded-xl"
    >
      {/* Swipe-to-delete background */}
      <motion.div
        style={{ opacity: deleteOpacity, scale: deleteScale }}
        className="absolute inset-0 flex items-center justify-end rounded-xl bg-status-error px-6"
      >
        <Trash2 className="h-5 w-5 text-white" />
      </motion.div>

      {/* Main card surface */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className={cn(
          'relative rounded-xl transition-shadow duration-200 hover:shadow-web-sm',
          notification.isRead
            ? 'bg-white'
            : cn('border-l-[3px]', colors.border, getUnreadTint(notification.type)),
        )}
        style={{ x, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        <div className="p-4">
          <div className="flex gap-3">
            {/* Type Icon */}
            <div
              className={cn(
                'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                colors.bg,
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', colors.text)} />
            </div>

            {/* Body */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h3
                    className={cn(
                      'truncate text-sm font-lexend',
                      notification.isRead
                        ? 'font-medium text-text-primary'
                        : 'font-semibold text-text-nearBlack',
                    )}
                  >
                    {notification.title}
                  </h3>
                  {!notification.isRead && (
                    <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="flex-shrink-0 whitespace-nowrap text-xs text-text-muted font-lexend">
                  {notification.timestamp}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary line-clamp-2 font-lexend">
                {notification.message}
              </p>

              {/* Action buttons -- always visible, subtle */}
              <div className="mt-2.5 flex items-center justify-end gap-1">
                {!notification.isRead && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMarkRead(notification.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium font-lexend text-text-muted transition-colors hover:bg-primary/5 hover:text-primary"
                    aria-label="Mark as read"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Read</span>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium font-lexend text-text-muted transition-colors hover:bg-status-error/5 hover:text-status-error"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

// ─── Date Group Header ──────────────────────────────────────────────────────────

function DateHeader({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="h-px flex-1 bg-gray-200/70" />
      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-text-muted font-lexend">
        {date}
      </span>
      <div className="h-px flex-1 bg-gray-200/70" />
    </div>
  );
}

// ─── Inline Clear-All Confirmation Banner ───────────────────────────────────────

interface ClearAllBannerProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function ClearAllBanner({ onConfirm, onCancel }: ClearAllBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-status-error/20 bg-status-error/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-status-error/10">
            <AlertTriangle className="h-4 w-4 text-status-error" />
          </div>
          <p className="text-sm font-medium text-text-primary font-lexend">
            Are you sure? This cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-2 ml-10 sm:ml-0">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-text-secondary font-lexend transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-status-error px-3.5 py-1.5 text-xs font-semibold text-white font-lexend transition-colors hover:bg-red-600"
          >
            Clear All
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center px-6 py-20"
    >
      {/* Floating icon with gradient circle */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-6"
      >
        <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-lg" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5">
          <Bell className="h-9 w-9 text-primary/70" />
        </div>
      </motion.div>

      <h3 className="text-lg font-semibold text-text-primary font-lexend">
        No Notifications
      </h3>
      <p className="mt-2 max-w-xs text-center text-sm text-text-secondary font-lexend">
        You&apos;re all caught up! New notifications will appear here when you have activity.
      </p>

      <Link
        href="/browse-chat"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white font-lexend shadow-button transition-all hover:bg-primary-dark hover:shadow-web-md"
      >
        <Users className="h-4 w-4" />
        Browse Astrologers
      </Link>
    </motion.div>
  );
}

// ─── Shimmer Skeleton Loader ────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full animate-shimmer bg-gray-200" />
          <div className="h-7 w-44 rounded-lg animate-shimmer bg-gray-200" />
        </div>
        <div className="h-5 w-20 rounded-md animate-shimmer bg-gray-200" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-1 border-b border-gray-200 pb-0 mb-4">
        {[80, 72, 64, 60].map((w, i) => (
          <div
            key={i}
            className="animate-shimmer bg-gray-200 rounded-md mb-0"
            style={{ width: w, height: 36 }}
          />
        ))}
      </div>

      {/* Card skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl bg-white p-4"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <div className="flex gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full animate-shimmer bg-gray-200" />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 rounded animate-shimmer bg-gray-200" />
                <div className="h-3 w-16 rounded animate-shimmer bg-gray-200" />
              </div>
              <div className="h-3 w-full rounded animate-shimmer bg-gray-200" />
              <div className="h-3 w-3/4 rounded animate-shimmer bg-gray-200" />
              <div className="flex justify-end gap-2 pt-1">
                <div className="h-6 w-14 rounded-md animate-shimmer bg-gray-200" />
                <div className="h-6 w-16 rounded-md animate-shimmer bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const { isReady } = useRequireAuth();

  // ── Derived state ──────────────────────────────────────────────────────────

  const filteredNotifications = useMemo(() => {
    const tab = TABS.find((t) => t.value === activeTab);
    if (!tab || tab.filterTypes.length === 0) return notifications;
    return notifications.filter((n) => tab.filterTypes.includes(n.type));
  }, [notifications, activeTab]);

  const groupedNotifications = useMemo(() => {
    const groups: { date: string; notifications: Notification[] }[] = [];
    let currentDate = '';

    filteredNotifications.forEach((notification) => {
      if (notification.date !== currentDate) {
        currentDate = notification.date;
        groups.push({ date: currentDate, notifications: [] });
      }
      groups[groups.length - 1].notifications.push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  // Unread counts per tab category for tab badges
  const unreadByTab = useMemo(() => {
    const sessionsUnread = notifications.filter(
      (n) => !n.isRead && (n.type === 'call' || n.type === 'chat'),
    ).length;
    const walletUnread = notifications.filter(
      (n) => !n.isRead && n.type === 'wallet',
    ).length;
    const offersUnread = notifications.filter(
      (n) => !n.isRead && n.type === 'promo',
    ).length;

    return { sessions: sessionsUnread, wallet: walletUnread, offers: offersUnread } as Record<
      string,
      number
    >;
  }, [notifications]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
    setShowClearConfirm(false);
  }, []);

  // ── Loading State ──────────────────────────────────────────────────────────

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <PageContainer size="md">
          <div className="py-4">
            <Skeleton className="mb-4 h-5 w-48" />
            <NotificationSkeleton />
          </div>
        </PageContainer>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  // Running index counter for stagger across groups
  let runningIndex = 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <PageContainer size="md">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Notifications' },
          ]}
        />

        {/* ── Header Section ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            {/* Bell icon with primary circle */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#333333] font-lexend">Notifications</h1>
              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white font-lexend">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary font-lexend transition-colors hover:bg-primary/5"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted font-lexend transition-colors hover:bg-status-error/5 hover:text-status-error"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* ── Inline Clear-All Confirmation ───────────────────────────────── */}
        <AnimatePresence>
          {showClearConfirm && (
            <ClearAllBanner
              onConfirm={handleClearAll}
              onCancel={() => setShowClearConfirm(false)}
            />
          )}
        </AnimatePresence>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 flex border-b border-gray-200"
        >
          {TABS.map((tab) => {
            const badgeCount =
              tab.value === 'all' ? 0 : (unreadByTab[tab.value] ?? 0);
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium font-lexend transition-colors',
                  activeTab === tab.value
                    ? 'text-primary'
                    : 'text-[#666666] hover:text-[#333333]',
                )}
              >
                {tab.label}
                {badgeCount > 0 && (
                  <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-bold text-primary font-lexend">
                    {badgeCount}
                  </span>
                )}
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="notif-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ── Notification List ────────────────────────────────────────────── */}
        <div className="pb-8">
          {filteredNotifications.length === 0 ? (
            <EmptyState />
          ) : (
            <AnimatePresence mode="popLayout">
              {groupedNotifications.map((group) => {
                const groupStartIndex = runningIndex;
                runningIndex += group.notifications.length;

                return (
                  <div key={group.date}>
                    <DateHeader date={group.date} />
                    {group.notifications.map((notification, i) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        index={groupStartIndex + i}
                        onMarkRead={handleMarkRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
