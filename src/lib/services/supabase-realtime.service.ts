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

// ─── Callback types ──────────────────────────────────────────────────

type Unsubscribe = () => void;
type EventCallback<T> = (payload: T) => void;

// ─── Service ─────────────────────────────────────────────────────────

class SupabaseRealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Clean up a specific channel subscription
   */
  private removeChannel(name: string) {
    const client = getSupabaseClient();
    const channel = this.channels.get(name);
    if (channel && client) {
      client.removeChannel(channel);
      this.channels.delete(name);
    }
  }

  /**
   * Clean up all subscriptions (call on logout / unmount)
   */
  removeAllChannels() {
    const client = getSupabaseClient();
    if (!client) return;
    this.channels.forEach((channel) => {
      client.removeChannel(channel);
    });
    this.channels.clear();
  }

  // ─── Astrologer Availability ─────────────────────────────────────

  /**
   * Subscribe to chat astrologer availability changes.
   * Mobile astrologer toggles on/off → browse-chat page updates instantly.
   */
  subscribeToChatAvailability(
    callback: EventCallback<AstrologerStatusPayload>
  ): Unsubscribe {
    const channelName = 'astrologer-availability';
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: 'astrologer-status' }, ({ payload }) => {
        callback(payload as AstrologerStatusPayload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  /**
   * Subscribe to call astrologer availability changes.
   */
  subscribeToCallAvailability(
    callback: EventCallback<AstrologerStatusPayload>
  ): Unsubscribe {
    const channelName = 'astrologer-availability-call';
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: 'astrologer-status' }, ({ payload }) => {
        callback(payload as AstrologerStatusPayload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  // ─── Chat Messages ───────────────────────────────────────────────

  /**
   * Subscribe to real-time chat messages for a session.
   * Astrologer sends message on mobile → user sees it instantly on website.
   */
  subscribeToChatMessages(
    sessionId: string,
    callback: EventCallback<ChatMessagePayload>
  ): Unsubscribe {
    const channelName = `chat-messages-${sessionId}`;
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: 'new-message' }, ({ payload }) => {
        callback(payload as ChatMessagePayload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  // ─── Chat Request Status ─────────────────────────────────────────

  /**
   * Subscribe to chat request acceptance/rejection.
   * Astrologer accepts on mobile → user on website navigates to session instantly.
   */
  subscribeToChatRequestUpdate(
    requestId: string,
    callback: EventCallback<RequestStatusPayload>
  ): Unsubscribe {
    const channelName = `chat-request-${requestId}`;
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: 'request-update' }, ({ payload }) => {
        callback(payload as RequestStatusPayload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  // ─── Call Request Status ──────────────────────────────────────────

  /**
   * Subscribe to call request acceptance with Twilio tokens.
   * Astrologer accepts call on mobile → user gets tokens + session instantly.
   */
  subscribeToCallRequestUpdate(
    requestId: string,
    callback: EventCallback<RequestStatusPayload>
  ): Unsubscribe {
    const channelName = `call-request-${requestId}`;
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: 'request-update' }, ({ payload }) => {
        callback(payload as RequestStatusPayload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  // ─── Session Updates ──────────────────────────────────────────────

  /**
   * Subscribe to session status changes (end, cancel, etc).
   * Astrologer ends chat on mobile → user on website sees it instantly.
   */
  subscribeToSessionUpdate(
    sessionId: string,
    callback: EventCallback<SessionUpdatePayload>
  ): Unsubscribe {
    const channelName = `session-${sessionId}`;
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: 'session-update' }, ({ payload }) => {
        callback(payload as SessionUpdatePayload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  // ─── Billing Events ───────────────────────────────────────────────

  /**
   * Subscribe to billing events for the current user.
   * Handles: both_connected, low_balance_warning, call_ended_balance, call_ended
   */
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
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

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

    channel.subscribe();
    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  // ─── Wallet Updates ───────────────────────────────────────────────

  /**
   * Subscribe to wallet balance changes.
   */
  subscribeToWalletUpdates(
    userId: string,
    callback: EventCallback<WalletBalancePayload>
  ): Unsubscribe {
    const channelName = `wallet-${userId}`;
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: 'balance-update' }, ({ payload }) => {
        callback(payload as WalletBalancePayload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  // ─── Queue Updates ────────────────────────────────────────────────

  /**
   * Subscribe to queue position updates.
   */
  subscribeToQueueUpdates(
    userId: string,
    callback: EventCallback<QueueUpdatePayload>
  ): Unsubscribe {
    const channelName = `user-queue-${userId}`;
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: 'queue-update' }, ({ payload }) => {
        callback(payload as QueueUpdatePayload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }

  // ─── Session Ready (from waitlist) ────────────────────────────────

  /**
   * Subscribe to session-ready events (astrologer connects from waitlist).
   */
  subscribeToSessionReady(
    userId: string,
    callback: EventCallback<SessionReadyPayload>
  ): Unsubscribe {
    const channelName = `session-ready-${userId}`;
    this.removeChannel(channelName);

    const client = getSupabaseClient();
    if (!client) return () => {};

    const channel = client
      .channel(channelName)
      .on('broadcast', { event: 'session-ready' }, ({ payload }) => {
        callback(payload as SessionReadyPayload);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.removeChannel(channelName);
  }
}

// Singleton
export const supabaseRealtime = new SupabaseRealtimeService();
