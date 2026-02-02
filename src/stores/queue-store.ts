/**
 * Queue Store - Zustand store for chat/call queue state
 * Manages user's position in queues and active requests
 */

import { create } from 'zustand';
import { Astrologer, QueueEntry, RequestStatus, SessionType } from '@/types/api.types';

export type ConnectionRequestStatus = 'idle' | 'connecting' | 'waiting' | 'connected' | 'rejected' | 'timeout';

interface ActiveRequest {
  requestId: string;
  type: SessionType;
  astrologerId: string;
  astrologerName: string;
  astrologerImage: string;
  status: RequestStatus;
  expiresAt: string;
  remainingSeconds: number;
  pricePerMinute: number;
  sessionId?: string;
}

interface QueueState {
  // Active queues user is in
  queues: QueueEntry[];

  // Active connection request (pending acceptance)
  activeRequest: ActiveRequest | null;

  // Selected astrologer for connection
  selectedAstrologer: Astrologer | null;

  // Connection request status
  requestStatus: ConnectionRequestStatus;
  queuePosition: number | null;
  estimatedWaitTime: number | null;

  // Active session (after request is accepted)
  activeSessionId: string | null;
  activeSessionType: SessionType | null;

  // Actions
  setQueues: (queues: QueueEntry[]) => void;
  addToQueue: (queue: QueueEntry) => void;
  removeFromQueue: (queueId: string) => void;
  updateQueuePosition: (queueId: string, position: number) => void;

  setActiveRequest: (request: ActiveRequest | null) => void;
  updateRequestStatus: (status: RequestStatus) => void;
  updateRequestTimer: (remainingSeconds: number) => void;

  // Connection request actions
  setSelectedAstrologer: (astrologer: Astrologer | null) => void;
  createRequest: (astrologer: Astrologer, type: SessionType) => void;
  setRequestStatus: (status: ConnectionRequestStatus) => void;
  setQueuePosition: (position: number | null, waitTime: number | null) => void;
  cancelRequest: () => void;
  clearRequest: () => void;

  setActiveSession: (sessionId: string, type: SessionType) => void;
  clearActiveSession: () => void;

  clearAll: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  // Initial state
  queues: [],
  activeRequest: null,
  selectedAstrologer: null,
  requestStatus: 'idle',
  queuePosition: null,
  estimatedWaitTime: null,
  activeSessionId: null,
  activeSessionType: null,

  // Queue actions
  setQueues: (queues) => set({ queues }),

  addToQueue: (queue) => {
    const currentQueues = get().queues;
    const exists = currentQueues.some(q => q.queueId === queue.queueId);
    if (!exists) {
      set({ queues: [...currentQueues, queue] });
    }
  },

  removeFromQueue: (queueId) => {
    set({ queues: get().queues.filter(q => q.queueId !== queueId) });
  },

  updateQueuePosition: (queueId, position) => {
    set({
      queues: get().queues.map(q =>
        q.queueId === queueId ? { ...q, position } : q
      ),
    });
  },

  // Request actions
  setActiveRequest: (request) => set({ activeRequest: request }),

  updateRequestStatus: (status) => {
    const currentRequest = get().activeRequest;
    if (currentRequest) {
      set({ activeRequest: { ...currentRequest, status } });
    }
  },

  updateRequestTimer: (remainingSeconds) => {
    const currentRequest = get().activeRequest;
    if (currentRequest) {
      set({ activeRequest: { ...currentRequest, remainingSeconds } });
    }
  },

  // Connection request actions
  setSelectedAstrologer: (astrologer) => set({ selectedAstrologer: astrologer }),

  createRequest: (astrologer, type) => {
    // Create a new connection request
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Handle multiple property name conventions
    const pricePerMinute = type === 'chat'
      ? (astrologer.chatPrice ?? astrologer.chatPricePerMinute ?? astrologer.pricePerMinute ?? 0)
      : (astrologer.callPrice ?? astrologer.callPricePerMinute ?? astrologer.pricePerMinute ?? 0);
    const profileImage = astrologer.profileImage ?? astrologer.image ?? '';

    set({
      selectedAstrologer: astrologer,
      requestStatus: 'connecting',
      activeRequest: {
        requestId,
        type,
        astrologerId: astrologer.id,
        astrologerName: astrologer.name,
        astrologerImage: profileImage,
        status: 'pending',
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        remainingSeconds: 60,
        pricePerMinute,
      },
    });

    // Simulate connection flow (in real app, this would be API calls)
    // For now, just change status after a delay
    setTimeout(() => {
      const state = get();
      if (state.requestStatus === 'connecting') {
        set({ requestStatus: 'waiting' });
      }
    }, 2000);
  },

  setRequestStatus: (status) => set({ requestStatus: status }),

  setQueuePosition: (position, waitTime) => set({
    queuePosition: position,
    estimatedWaitTime: waitTime,
  }),

  cancelRequest: () => {
    set({
      requestStatus: 'idle',
      activeRequest: null,
      queuePosition: null,
      estimatedWaitTime: null,
    });
  },

  clearRequest: () => {
    set({
      selectedAstrologer: null,
      requestStatus: 'idle',
      activeRequest: null,
      queuePosition: null,
      estimatedWaitTime: null,
    });
  },

  // Session actions
  setActiveSession: (sessionId, type) => {
    set({
      activeSessionId: sessionId,
      activeSessionType: type,
      activeRequest: null, // Clear request when session starts
    });
  },

  clearActiveSession: () => {
    set({
      activeSessionId: null,
      activeSessionType: null,
    });
  },

  // Clear all
  clearAll: () => {
    set({
      queues: [],
      activeRequest: null,
      selectedAstrologer: null,
      requestStatus: 'idle',
      queuePosition: null,
      estimatedWaitTime: null,
      activeSessionId: null,
      activeSessionType: null,
    });
  },
}));

// Export selectors
export const selectQueues = (state: QueueState) => state.queues;
export const selectActiveRequest = (state: QueueState) => state.activeRequest;
export const selectSelectedAstrologer = (state: QueueState) => state.selectedAstrologer;
export const selectRequestStatus = (state: QueueState) => state.requestStatus;
export const selectQueuePosition = (state: QueueState) => state.queuePosition;
export const selectEstimatedWaitTime = (state: QueueState) => state.estimatedWaitTime;
export const selectActiveSession = (state: QueueState) => ({
  sessionId: state.activeSessionId,
  type: state.activeSessionType,
});
export const selectIsInQueue = (astrologerId: string) => (state: QueueState) =>
  state.queues.some(q => q.astrologerId === astrologerId);
export const selectHasActiveRequest = (state: QueueState) => !!state.activeRequest;
export const selectHasActiveSession = (state: QueueState) => !!state.activeSessionId;
