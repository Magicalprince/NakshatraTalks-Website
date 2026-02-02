/**
 * Queue Store - Zustand store for chat/call queue state
 * Manages user's position in queues and active requests
 */

import { create } from 'zustand';
import { QueueEntry, RequestStatus, SessionType } from '@/types/api.types';

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
}

interface QueueState {
  // Active queues user is in
  queues: QueueEntry[];

  // Active connection request (pending acceptance)
  activeRequest: ActiveRequest | null;

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

  setActiveSession: (sessionId: string, type: SessionType) => void;
  clearActiveSession: () => void;

  clearAll: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  // Initial state
  queues: [],
  activeRequest: null,
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
      activeSessionId: null,
      activeSessionType: null,
    });
  },
}));

// Export selectors
export const selectQueues = (state: QueueState) => state.queues;
export const selectActiveRequest = (state: QueueState) => state.activeRequest;
export const selectActiveSession = (state: QueueState) => ({
  sessionId: state.activeSessionId,
  type: state.activeSessionType,
});
export const selectIsInQueue = (astrologerId: string) => (state: QueueState) =>
  state.queues.some(q => q.astrologerId === astrologerId);
export const selectHasActiveRequest = (state: QueueState) => !!state.activeRequest;
export const selectHasActiveSession = (state: QueueState) => !!state.activeSessionId;
