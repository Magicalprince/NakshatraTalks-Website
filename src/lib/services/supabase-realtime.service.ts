/**
 * Supabase Realtime Service
 *
 * Subscribes to the SAME Supabase Broadcast channels as the mobile app,
 * ensuring cross-platform compatibility when:
 * - Astrologer uses mobile app, user uses website
 * - Astrologer toggles availability on mobile → website browse pages update
 * - Chat messages sent from mobile → delivered in real-time on website
 * - Call/billing events broadcast via Supabase → received on website
 *
 * Channel reference (matches backend's supabase-broadcast.service.ts):
 *   astrologer-availability       → astrologer-status (chat availability)
 *   astrologer-availability-call  → astrologer-status (call availability)
 *   chat-messages-{sessionId}     → new-message
 *   chat-request-{requestId}      → request-update
 *   call-request-{requestId}      → request-update
 *   session-{sessionId}           → session-update
 *   chat-session-{sessionId}      → user-connected (billing start)
 *   call-session-{sessionId}      → session-update
 *   billing-{userId}              → both_connected / low_balance_warning / call_ended_balance / call_ended
 *   wallet-{userId}               → balance-update
 *   user-queue-{userId}           → queue-update
 *   session-ready-{userId}        → session-ready
 *   astrologer-waitlist-{astrologerId} → waitlist-update (astrologer side)
 *   astrologer-incoming-{astrologerId} → new-request / request-expired (astrologer side)
 *   chat-session-{sessionId}      → user-connected (astrologer side, billing start)
 */

import { getSupabaseClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Payload types (matching mobile app & backend) ───────────────────

export interface AstrologerStatusPayload {
  astrologerId: string;
  chatAvailable: boolean;
  callAvailable: boolean;
  name?: string;
  profileImage?: string;
  rating?: number;
  chatPricePerMinute?: number;
  callPricePerMinute?: number;
  pricePerMinute?: number;
}

export interface ChatMessagePayload {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'user' | 'astrologer';
  message: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: string;
}

export interface RequestStatusPayload {
  requestId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'timeout' | 'cancelled';
  sessionId?: string;
  startTime?: string;
  pricePerMinute?: number;
  rejectReason?: string;
  twilioToken?: string;
  twilioRoomName?: string;
}

export interface SessionUpdatePayload {
  sessionId: string;
  status: 'active' | 'completed' | 'cancelled';
  endTime?: string;
  duration?: number;
  totalCost?: number;
  endReason?: string;
}

export interface BillingPayload {
  sessionId: string;
  message?: string;
  remainingMinutes?: number;
  remainingBalance?: number;
  reason?: string;
  duration?: number;
  durationFormatted?: string;
  totalCost?: number;
  endReason?: string;
  endedBy?: 'user' | 'astrologer' | 'system';
}

export interface WalletBalancePayload {
  balance: number;
  previousBalance?: number;
  transactionType?: string;
  amount?: number;
}

export interface QueueUpdatePayload {
  queueId: string;
  astrologerId: string;
  position: number;
  estimatedWaitMinutes?: number;
  status?: string;
}

export interface SessionReadyPayload {
  sessionId: string;
  sessionType: 'chat' | 'call';
  astrologerId: string;
  astrologerName: string;
  astrologerImage?: string;
  pricePerMinute: number;
}

export interface WaitlistUpdatePayload {
  action: 'joined' | 'left' | 'updated' | 'connected';
  queueEntry: {
    id: string;
    userId: string;
    userName?: string;
    userImage?: string;
    type: 'chat' | 'call';
    position: number;
    status: string;
    createdAt?: string;
  };
}

export interface IncomingRequestPayload {
  requestId: string;
  userId: string;
  userName?: string;
  userImage?: string;
  type: 'chat' | 'call';
  status: string;
  pricePerMinute?: number;
  createdAt?: string;
}

// ─── Callback types ──────────────────────────────────────────────────

type Unsubscribe = () => void;
type EventCallback<T> = (payload: T) => void;

/** Retry delay for failed channel subscriptions (matches mobile app) */
const RETRY_DELAY_MS = 2000;
/** Max retry attempts before giving up */
const MAX_RETRIES = 5;

// ─── Service ─────────────────────────────────────────────────────────

class SupabaseRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private retryTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private retryCounts: Map<string, number> = new Map();

  /**
   * Clean up a specific channel subscription
   */
  private removeChannel(name: string) {
    // Clear any pending retry timer
    const timer = this.retryTimers.get(name);
    if (timer) {
      clearTimeout(timer);
      this.retryTimers.delete(name);
    }
    this.retryCounts.delete(name);

    const channel = this.channels.get(name);
    if (!channel) return;

    this.channels.delete(name);

    try {
      const client = getSupabaseClient();
      if (client) {
        client.removeChannel(channel);
      }
    } catch {
      // Supabase client may be unavailable after logout — safe to ignore
    }
  }

  /**
   * Clean up all subscriptions (call on logout / unmount)
   */
  removeAllChannels() {
    // Clear all retry timers
    this.retryTimers.forEach((timer) => clearTimeout(timer));
    this.retryTimers.clear();
    this.retryCounts.clear();

    try {
      const client = getSupabaseClient();
      if (client) {
        this.channels.forEach((channel) => {
          try {
            client.removeChannel(channel);
          } catch {
            // Safe to ignore
          }
        });
      }
    } catch {
      // Supabase client may be unavailable after logout
    }
    this.channels.clear();
  }

  /**
   * Subscribe to a channel with auto-retry on CHANNEL_ERROR / TIMED_OUT.
   * Matches mobile app's retry pattern (2s delay, max 5 retries).
   */
  private subscribeWithRetry(
    channelName: string,
    setup: (client: ReturnType<typeof getSupabaseClient> & object) => RealtimeChannel,
    retryFn: () => Unsubscribe
  ): Unsubscribe {
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = setup(client);

    channel.subscribe((status: string) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        const count = (this.retryCounts.get(channelName) || 0) + 1;
        if (count <= MAX_RETRIES) {
          this.retryCounts.set(channelName, count);
          console.warn(`[Realtime] ${channelName} ${status} — retrying (${count}/${MAX_RETRIES})...`);
          const timer = setTimeout(() => {
            this.retryTimers.delete(channelName);
            // Only retry if the channel is still tracked (hasn't been unsubscribed)
            if (this.channels.has(channelName)) {
              retryFn();
            }
          }, RETRY_DELAY_MS);
          this.retryTimers.set(channelName, timer);
        } else {
          console.error(`[Realtime] ${channelName} failed after ${MAX_RETRIES} retries`);
        }
      } else if (status === 'SUBSCRIBED') {
        // Reset retry count on successful subscription
        this.retryCounts.delete(channelName);
      }
    });

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  // ─── Astrologer Availability ─────────────────────────────────────

  subscribeToChatAvailability(
    callback: EventCallback<AstrologerStatusPayload>
  ): Unsubscribe {
    const channelName = 'astrologer-availability';
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'astrologer-status' }, ({ payload }) => {
          callback(payload as AstrologerStatusPayload);
        }),
      () => this.subscribeToChatAvailability(callback)
    );
  }

  subscribeToCallAvailability(
    callback: EventCallback<AstrologerStatusPayload>
  ): Unsubscribe {
    const channelName = 'astrologer-availability-call';
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'astrologer-status' }, ({ payload }) => {
          callback(payload as AstrologerStatusPayload);
        }),
      () => this.subscribeToCallAvailability(callback)
    );
  }

  // ─── Chat Messages ───────────────────────────────────────────────

  subscribeToChatMessages(
    sessionId: string,
    callback: EventCallback<ChatMessagePayload>
  ): Unsubscribe {
    const channelName = `chat-messages-${sessionId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'new-message' }, ({ payload }) => {
          callback(payload as ChatMessagePayload);
        }),
      () => this.subscribeToChatMessages(sessionId, callback)
    );
  }

  // ─── Chat Request Status ─────────────────────────────────────────

  subscribeToChatRequestUpdate(
    requestId: string,
    callback: EventCallback<RequestStatusPayload>
  ): Unsubscribe {
    const channelName = `chat-request-${requestId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'request-update' }, ({ payload }) => {
          callback(payload as RequestStatusPayload);
        }),
      () => this.subscribeToChatRequestUpdate(requestId, callback)
    );
  }

  // ─── Call Request Status ──────────────────────────────────────────

  subscribeToCallRequestUpdate(
    requestId: string,
    callback: EventCallback<RequestStatusPayload>
  ): Unsubscribe {
    const channelName = `call-request-${requestId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'request-update' }, ({ payload }) => {
          callback(payload as RequestStatusPayload);
        }),
      () => this.subscribeToCallRequestUpdate(requestId, callback)
    );
  }

  // ─── Session Updates ──────────────────────────────────────────────

  subscribeToSessionUpdate(
    sessionId: string,
    callback: EventCallback<SessionUpdatePayload>
  ): Unsubscribe {
    const channelName = `session-${sessionId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'session-update' }, ({ payload }) => {
          callback(payload as SessionUpdatePayload);
        }),
      () => this.subscribeToSessionUpdate(sessionId, callback)
    );
  }

  // ─── Billing Events ───────────────────────────────────────────────

  subscribeToBillingEvents(
    userId: string,
    callbacks: {
      onBothConnected?: EventCallback<BillingPayload>;
      onLowBalance?: EventCallback<BillingPayload>;
      onCallEndedBalance?: EventCallback<BillingPayload>;
      onCallEnded?: EventCallback<BillingPayload>;
    }
  ): Unsubscribe {
    const channelName = `billing-${userId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => {
        let channel = client.channel(channelName);
        if (callbacks.onBothConnected) {
          channel = channel.on('broadcast', { event: 'both_connected' }, ({ payload }) => {
            callbacks.onBothConnected!(payload as BillingPayload);
          });
        }
        if (callbacks.onLowBalance) {
          channel = channel.on('broadcast', { event: 'low_balance_warning' }, ({ payload }) => {
            callbacks.onLowBalance!(payload as BillingPayload);
          });
        }
        if (callbacks.onCallEndedBalance) {
          channel = channel.on('broadcast', { event: 'call_ended_balance' }, ({ payload }) => {
            callbacks.onCallEndedBalance!(payload as BillingPayload);
          });
        }
        if (callbacks.onCallEnded) {
          channel = channel.on('broadcast', { event: 'call_ended' }, ({ payload }) => {
            callbacks.onCallEnded!(payload as BillingPayload);
          });
        }
        return channel;
      },
      () => this.subscribeToBillingEvents(userId, callbacks)
    );
  }

  // ─── Wallet Updates ───────────────────────────────────────────────

  subscribeToWalletUpdates(
    userId: string,
    callback: EventCallback<WalletBalancePayload>
  ): Unsubscribe {
    const channelName = `wallet-${userId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'balance-update' }, ({ payload }) => {
          callback(payload as WalletBalancePayload);
        }),
      () => this.subscribeToWalletUpdates(userId, callback)
    );
  }

  // ─── Queue Updates ────────────────────────────────────────────────

  subscribeToQueueUpdates(
    userId: string,
    callback: EventCallback<QueueUpdatePayload>
  ): Unsubscribe {
    const channelName = `user-queue-${userId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'queue-update' }, ({ payload }) => {
          callback(payload as QueueUpdatePayload);
        }),
      () => this.subscribeToQueueUpdates(userId, callback)
    );
  }

  // ─── Session Ready (from waitlist) ────────────────────────────────

  subscribeToSessionReady(
    userId: string,
    callback: EventCallback<SessionReadyPayload>
  ): Unsubscribe {
    const channelName = `session-ready-${userId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'session-ready' }, ({ payload }) => {
          callback(payload as SessionReadyPayload);
        }),
      () => this.subscribeToSessionReady(userId, callback)
    );
  }

  // ─── Waitlist Updates (Astrologer Side) ─────────────────────────

  subscribeToWaitlistUpdates(
    astrologerId: string,
    callback: EventCallback<WaitlistUpdatePayload>
  ): Unsubscribe {
    const channelName = `astrologer-waitlist-${astrologerId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'waitlist-update' }, ({ payload }) => {
          if (payload) callback(payload as WaitlistUpdatePayload);
        }),
      () => this.subscribeToWaitlistUpdates(astrologerId, callback)
    );
  }

  // ─── Incoming Requests (Astrologer Side) ────────────────────────

  subscribeToIncomingRequests(
    astrologerId: string,
    callback: EventCallback<IncomingRequestPayload>
  ): Unsubscribe {
    const channelName = `astrologer-incoming-${astrologerId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'new-request' }, ({ payload }) => {
          if (payload) callback(payload as IncomingRequestPayload);
        })
        .on('broadcast', { event: 'request-expired' }, ({ payload }) => {
          if (payload) callback({ ...payload, status: 'expired' } as IncomingRequestPayload);
        }),
      () => this.subscribeToIncomingRequests(astrologerId, callback)
    );
  }

  // ─── Chat Session User Connected (Astrologer Side) ──────────────

  subscribeToUserConnected(
    sessionId: string,
    callback: EventCallback<{ sessionId: string; userId: string; connectedAt: string }>
  ): Unsubscribe {
    const channelName = `chat-session-${sessionId}`;
    return this.subscribeWithRetry(
      channelName,
      (client) => client
        .channel(channelName)
        .on('broadcast', { event: 'user-connected' }, ({ payload }) => {
          if (payload) callback(payload as { sessionId: string; userId: string; connectedAt: string });
        }),
      () => this.subscribeToUserConnected(sessionId, callback)
    );
  }
}

// Singleton
export const supabaseRealtime = new SupabaseRealtimeService();
