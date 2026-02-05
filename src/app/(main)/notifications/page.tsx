'use client';

/**
 * Notifications Page
 * Displays user notifications including session requests, wallet updates, promotions
 * Design matches mobile app with yellow header and grouped notifications
 */

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  Phone,
  MessageCircle,
  Wallet,
  Gift,
  CheckCircle,
  Clock,
  X,
  Trash2,
} from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { cn } from '@/utils/cn';

// Notification types
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

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'chat',
    title: 'Chat Session Ended',
    message: 'Your chat session with Pandit Sharma has ended. Duration: 15 mins. Total: ₹375.',
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
    message: 'Your wallet has been credited with ₹500. Current balance: ₹1,250.',
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
    message: 'Get 20% extra on your next recharge of ₹1,000 or more. Limited time offer!',
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

// Tab options
type TabOption = 'all' | 'sessions' | 'wallet' | 'offers';

const TABS: { value: TabOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'offers', label: 'Offers' },
];

// Get icon for notification type
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

// Get icon color for notification type
const getIconColor = (type: NotificationType) => {
  switch (type) {
    case 'call':
      return 'bg-green-100 text-green-600';
    case 'chat':
      return 'bg-primary/10 text-primary';
    case 'wallet':
      return 'bg-amber-100 text-amber-600';
    case 'promo':
      return 'bg-pink-100 text-pink-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

interface NotificationCardProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationCard({ notification, onMarkRead, onDelete }: NotificationCardProps) {
  const Icon = getNotificationIcon(notification.type);
  const iconColor = getIconColor(notification.type);

  const content = (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'relative p-4 rounded-xl mb-3 transition-all',
        notification.isRead ? 'bg-white' : 'bg-primary/5 border-l-4 border-primary'
      )}
      style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              'text-sm font-lexend line-clamp-1',
              notification.isRead ? 'font-medium text-text-primary' : 'font-semibold text-text-primary'
            )}>
              {notification.title}
            </h3>
            <span className="text-xs text-text-muted whitespace-nowrap font-lexend">
              {notification.timestamp}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2 font-lexend">
            {notification.message}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.isRead && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            title="Mark as read"
          >
            <CheckCircle className="w-4 h-4 text-primary" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-status-error" />
        </button>
      </div>
    </motion.div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="group block">
        {content}
      </Link>
    );
  }

  return <div className="group">{content}</div>;
}

function DateHeader({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-medium text-text-muted font-lexend">{date}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
        <Bell className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary font-lexend">
        No Notifications
      </h3>
      <p className="text-sm text-text-secondary text-center mt-2 max-w-xs font-lexend">
        You&apos;re all caught up! New notifications will appear here.
      </p>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Auth check
  const { isReady } = useRequireAuth();

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'sessions') return notifications.filter(n => n.type === 'call' || n.type === 'chat');
    if (activeTab === 'wallet') return notifications.filter(n => n.type === 'wallet');
    if (activeTab === 'offers') return notifications.filter(n => n.type === 'promo');
    return notifications;
  }, [notifications, activeTab]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { date: string; notifications: Notification[] }[] = [];
    let currentDate = '';

    filteredNotifications.forEach(notification => {
      if (notification.date !== currentDate) {
        currentDate = notification.date;
        groups.push({ date: currentDate, notifications: [] });
      }
      groups[groups.length - 1].notifications.push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  }, []);

  // Loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="bg-secondary rounded-b-[28px] pb-4">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
          <div className="px-4 pb-2">
            <Skeleton className="h-10 rounded-full" />
          </div>
        </div>
        <div className="px-4 mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Yellow Header */}
      <div className="bg-secondary rounded-b-[28px] pb-4">
        {/* Header Row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <Link href="/">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6 text-[#333333]" />
            </motion.button>
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-[#333333] font-lexend">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full font-lexend">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Clear All Button */}
          {notifications.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              className="w-10 h-10 flex items-center justify-center"
            >
              <Trash2 className="w-5 h-5 text-[#666666]" />
            </motion.button>
          )}
          {notifications.length === 0 && <div className="w-10" />}
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex mx-4 bg-white rounded-full p-1"
          style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab.value}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex-1 py-2 text-sm font-medium font-lexend rounded-full transition-colors',
                activeTab === tab.value
                  ? 'bg-primary text-white'
                  : 'text-[#666666]'
              )}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Mark All Read Button */}
      {unreadCount > 0 && (
        <div className="px-4 pt-4">
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-primary font-medium font-lexend hover:underline"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="px-4 mt-2">
        {filteredNotifications.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            {groupedNotifications.map((group) => (
              <div key={group.date}>
                <DateHeader date={group.date} />
                {group.notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
