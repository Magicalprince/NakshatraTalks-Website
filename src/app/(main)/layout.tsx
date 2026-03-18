'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { WebNavbar } from '@/components/layout/WebNavbar';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { WebFooter } from '@/components/layout/WebFooter';
import { ToastContainer } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { useQueueStore } from '@/stores/queue-store';
import { useUIStore } from '@/stores/ui-store';
import { FloatingQueueDock } from '@/components/features/queue/FloatingQueueDock';
import { useLeaveQueue } from '@/hooks/useQueue';
import { supabaseRealtime, SessionReadyPayload, QueueUpdatePayload } from '@/lib/services/supabase-realtime.service';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userType, isHydrated, user } = useAuthStore();
  const queues = useQueueStore((s) => s.queues);
  const removeFromQueue = useQueueStore((s) => s.removeFromQueue);
  const { addToast } = useUIStore();
  const { leaveQueue } = useLeaveQueue();
  const sessionReadyUnsubRef = useRef<(() => void) | null>(null);
  const queueUpdatesUnsubRef = useRef<(() => void) | null>(null);

  // Redirect astrologers away from user-side pages to their dashboard
  const publicPaths = ['/horoscope', '/kundli', '/privacy', '/terms', '/refund', '/support'];
  const isPublicPage = publicPaths.some((p) => pathname.startsWith(p));
  const isAstrologerOnUserPage = isHydrated && isAuthenticated && userType === 'astrologer' && !isPublicPage;

  useEffect(() => {
    if (isAstrologerOnUserPage) {
      router.replace('/astrologer/dashboard');
    }
  }, [isAstrologerOnUserPage, router]);

  // ── Global session-ready listener ──
  // When the astrologer connects from queue, the backend broadcasts session-ready.
  // This listener catches it even if user navigated away from the browse page.
  useEffect(() => {
    const userId = user?.id;
    if (!userId || !isAuthenticated || userType !== 'user') {
      return;
    }

    // Only subscribe if user has active queue entries
    const hasQueues = useQueueStore.getState().queues.length > 0;
    if (!hasQueues) return;

    // Clean up previous subscription
    if (sessionReadyUnsubRef.current) {
      sessionReadyUnsubRef.current();
    }

    sessionReadyUnsubRef.current = supabaseRealtime.subscribeToSessionReady(
      userId,
      (payload: SessionReadyPayload) => {
        // Remove the queue entry since session is now ready
        const currentQueues = useQueueStore.getState().queues;
        const matchingQueue = currentQueues.find(
          (q) => q.astrologerId === payload.astrologerId
        );
        if (matchingQueue) {
          removeFromQueue(matchingQueue.queueId);
        }

        addToast({
          type: 'success',
          title: 'Session Ready!',
          message: `${payload.astrologerName} is ready. Connecting you now...`,
        });

        // Navigate to the session
        const sessionType = payload.sessionType || 'call';
        router.push(`/${sessionType}/${payload.sessionId}`);
      },
    );

    return () => {
      if (sessionReadyUnsubRef.current) {
        sessionReadyUnsubRef.current();
        sessionReadyUnsubRef.current = null;
      }
    };
  }, [user?.id, isAuthenticated, userType, queues.length, removeFromQueue, addToast, router]);

  // ── Global queue updates listener ──
  // Listens for queue status changes (cancelled, rejected, expired, skipped by astrologer).
  // Without this, the FloatingQueueDock stays visible even after the astrologer cancels.
  useEffect(() => {
    const userId = user?.id;
    if (!userId || !isAuthenticated || userType !== 'user') {
      return;
    }

    const hasQueues = useQueueStore.getState().queues.length > 0;
    if (!hasQueues) return;

    // Clean up previous subscription
    if (queueUpdatesUnsubRef.current) {
      queueUpdatesUnsubRef.current();
    }

    const TERMINAL_STATUSES = ['expired', 'cancelled', 'skipped', 'rejected'];

    queueUpdatesUnsubRef.current = supabaseRealtime.subscribeToQueueUpdates(
      userId,
      (payload: QueueUpdatePayload) => {
        const newStatus = payload.status;

        if (newStatus && TERMINAL_STATUSES.includes(newStatus)) {
          // Find and remove the matching queue entry
          const currentQueues = useQueueStore.getState().queues;
          const matchingQueue = payload.queueId
            ? currentQueues.find((q) => q.queueId === payload.queueId)
            : payload.astrologerId
              ? currentQueues.find((q) => q.astrologerId === payload.astrologerId)
              : null;

          if (matchingQueue) {
            removeFromQueue(matchingQueue.queueId);

            const reason = newStatus === 'cancelled' || newStatus === 'rejected'
              ? 'The astrologer cancelled your queue request.'
              : newStatus === 'expired'
                ? 'Your queue position has expired.'
                : 'You were skipped in the queue.';

            addToast({
              type: 'info',
              title: 'Queue Updated',
              message: reason,
            });
          }
        } else if (payload.queueId && typeof payload.position === 'number') {
          // Position update — update the store
          useQueueStore.getState().updateQueuePosition(payload.queueId, payload.position);
        }
      },
    );

    return () => {
      if (queueUpdatesUnsubRef.current) {
        queueUpdatesUnsubRef.current();
        queueUpdatesUnsubRef.current = null;
      }
    };
  }, [user?.id, isAuthenticated, userType, queues.length, removeFromQueue, addToast]);

  // Block rendering until hydration completes to prevent jitter.
  // If user is an astrologer on a user page, show nothing while redirect happens.
  if (!isHydrated || isAstrologerOnUserPage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-offWhite flex flex-col">
      <WebNavbar />
      <MobileMenu />

      <main className="flex-1">
        {children}
      </main>

      <WebFooter />
      <ToastContainer />
      {queues.length > 0 && queues.map((entry) => {
        const entryType = entry.type || 'call';
        return (
          <FloatingQueueDock
            key={entry.queueId}
            queueEntry={{
              queueId: entry.queueId,
              astrologerName: entry.astrologerName || 'Astrologer',
              astrologerImage: entry.astrologerImage,
              position: entry.position,
              estimatedWaitMinutes: entry.estimatedWaitMinutes,
              expiresAt: entry.expiresAt,
              status: entry.status,
              type: entryType,
            }}
            onLeave={(queueId) => leaveQueue(queueId, entryType)}
          />
        );
      })}
    </div>
  );
}
