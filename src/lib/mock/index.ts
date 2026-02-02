/**
 * Mock API Service
 * Provides mock data responses for development testing
 */

export * from './data';

// Re-export all mock data
import {
  MOCK_ASTROLOGERS,
  MOCK_USER,
  MOCK_CHAT_MESSAGES,
  MOCK_CHAT_SESSIONS,
  MOCK_TRANSACTIONS,
  MOCK_WALLET_SUMMARY,
  MOCK_RECHARGE_OPTIONS,
  MOCK_LIVE_SESSIONS,
  MOCK_REVIEWS,
  MOCK_ASTROLOGER_STATS,
  MOCK_INCOMING_REQUESTS,
  MOCK_WAITLIST,
  MOCK_ACTIVE_SESSION,
  MOCK_DAILY_HOROSCOPES,
  shouldUseMockData,
} from './data';

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Response wrapper
const mockResponse = <T>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
});

// ============================================
// MOCK API FUNCTIONS
// ============================================

export const mockApi = {
  // Auth
  auth: {
    sendOtp: async (phone: string) => {
      await delay(800);
      console.log('[Mock] Sending OTP to:', phone);
      return mockResponse({ sent: true, expiresIn: 120 });
    },
    verifyOtp: async (phone: string, otp: string) => {
      await delay(1000);
      console.log('[Mock] Verifying OTP:', phone, otp);
      // Accept any 6-digit OTP for testing
      if (otp.length === 6) {
        return mockResponse({
          user: MOCK_USER,
          accessToken: 'mock-access-token-12345',
          refreshToken: 'mock-refresh-token-67890',
        });
      }
      throw new Error('Invalid OTP');
    },
    getMe: async () => {
      await delay(300);
      return mockResponse({ user: MOCK_USER });
    },
    logout: async () => {
      await delay(200);
      return mockResponse({ success: true });
    },
  },

  // Astrologers
  astrologers: {
    getAll: async (params?: { page?: number; limit?: number; filter?: string }) => {
      await delay(600);
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const data = MOCK_ASTROLOGERS.slice(start, end);

      return mockResponse({
        astrologers: data,
        page,
        totalPages: Math.ceil(MOCK_ASTROLOGERS.length / limit),
        totalItems: MOCK_ASTROLOGERS.length,
      });
    },
    getById: async (id: string) => {
      await delay(400);
      const astrologer = MOCK_ASTROLOGERS.find(a => a.id === id);
      if (!astrologer) throw new Error('Astrologer not found');
      return mockResponse({ astrologer, reviews: MOCK_REVIEWS });
    },
    getLive: async () => {
      await delay(400);
      return mockResponse({
        sessions: MOCK_LIVE_SESSIONS.filter(s => s.status === 'live'),
      });
    },
    getTopRated: async () => {
      await delay(400);
      return mockResponse({
        astrologers: MOCK_ASTROLOGERS.slice(0, 4),
      });
    },
  },

  // Chat
  chat: {
    getSessions: async () => {
      await delay(500);
      return mockResponse({ sessions: MOCK_CHAT_SESSIONS });
    },
    getSession: async (sessionId: string) => {
      await delay(400);
      const session = MOCK_CHAT_SESSIONS.find(s => s.id === sessionId);
      const astrologer = MOCK_ASTROLOGERS.find(a => a.id === session?.astrologerId);
      return mockResponse({
        session: session || MOCK_CHAT_SESSIONS[0],
        astrologer,
        user: MOCK_USER,
      });
    },
    getMessages: async (_sessionId: string) => {
      await delay(400);
      return mockResponse({
        messages: MOCK_CHAT_MESSAGES,
        hasMore: false,
      });
    },
    sendMessage: async (sessionId: string, content: string, type: string) => {
      await delay(300);
      const newMessage = {
        id: `msg-${Date.now()}`,
        sessionId,
        senderId: MOCK_USER.id,
        senderType: 'user' as const,
        message: content,
        content,
        type: type as 'text' | 'image' | 'audio',
        isRead: false,
        status: 'sent' as const,
        createdAt: new Date().toISOString(),
      };
      return mockResponse({ message: newMessage });
    },
    initiateChat: async (_astrologerId: string) => {
      await delay(800);
      return mockResponse({
        requestId: `req-${Date.now()}`,
        status: 'pending',
        expiresAt: new Date(Date.now() + 120000).toISOString(),
      });
    },
    endSession: async (sessionId: string) => {
      await delay(500);
      return mockResponse({
        sessionId,
        duration: 15,
        totalCost: 375,
        remainingBalance: 875,
      });
    },
  },

  // Call
  call: {
    initiateCall: async (_astrologerId: string, _callType: 'audio' | 'video') => {
      await delay(800);
      return mockResponse({
        requestId: `call-req-${Date.now()}`,
        status: 'pending',
        expiresAt: new Date(Date.now() + 120000).toISOString(),
      });
    },
    getSession: async (_sessionId: string) => {
      await delay(400);
      const session = MOCK_CHAT_SESSIONS.find(s => s.sessionType === 'call');
      const astrologer = MOCK_ASTROLOGERS[0];
      return mockResponse({
        session: session || { ...MOCK_CHAT_SESSIONS[0], sessionType: 'call' },
        astrologer,
        user: MOCK_USER,
        twilio: {
          roomName: 'mock-room',
          token: 'mock-twilio-token',
        },
      });
    },
    endCall: async (sessionId: string) => {
      await delay(500);
      return mockResponse({
        sessionId,
        duration: 10,
        durationSeconds: 600,
        billedMinutes: 10,
        pricePerMinute: 30,
        totalCost: 300,
        remainingBalance: 950,
      });
    },
  },

  // Wallet
  wallet: {
    getBalance: async () => {
      await delay(300);
      return mockResponse({
        balance: MOCK_USER.walletBalance,
        currency: 'INR',
      });
    },
    getSummary: async () => {
      await delay(500);
      return mockResponse(MOCK_WALLET_SUMMARY);
    },
    getTransactions: async (params?: { page?: number; type?: string }) => {
      await delay(500);
      let transactions = MOCK_TRANSACTIONS;
      if (params?.type && params.type !== 'all') {
        transactions = transactions.filter(t => t.type === params.type);
      }
      return mockResponse({
        transactions,
        page: params?.page || 1,
        totalPages: 1,
      });
    },
    getRechargeOptions: async () => {
      await delay(300);
      return mockResponse({ options: MOCK_RECHARGE_OPTIONS });
    },
    createOrder: async (amount: number) => {
      await delay(500);
      return mockResponse({
        orderId: `order-${Date.now()}`,
        amount,
        currency: 'INR',
        razorpayOrderId: `rzp_order_${Date.now()}`,
      });
    },
    verifyPayment: async (paymentData: Record<string, unknown>) => {
      await delay(800);
      return mockResponse({
        success: true,
        newBalance: (MOCK_USER.walletBalance || 0) + (paymentData.amount as number || 500),
      });
    },
  },

  // Horoscope
  horoscope: {
    getDaily: async (sign: string) => {
      await delay(400);
      const horoscope = MOCK_DAILY_HOROSCOPES[sign.toLowerCase()];
      if (!horoscope) throw new Error('Invalid zodiac sign');
      return mockResponse(horoscope);
    },
    getAllDaily: async () => {
      await delay(500);
      return mockResponse({ horoscopes: MOCK_DAILY_HOROSCOPES });
    },
  },

  // User Profile
  user: {
    getProfile: async () => {
      await delay(400);
      return mockResponse({ user: MOCK_USER });
    },
    updateProfile: async (data: Partial<typeof MOCK_USER>) => {
      await delay(600);
      return mockResponse({ user: { ...MOCK_USER, ...data } });
    },
  },

  // Astrologer Dashboard
  astrologerDashboard: {
    getStats: async () => {
      await delay(400);
      return mockResponse(MOCK_ASTROLOGER_STATS);
    },
    getAvailability: async () => {
      await delay(300);
      return mockResponse({
        chatAvailable: true,
        callAvailable: true,
        isLive: false,
      });
    },
    updateAvailability: async (data: { chat?: boolean; call?: boolean; video?: boolean }) => {
      await delay(400);
      return mockResponse({
        chatAvailable: data.chat ?? true,
        callAvailable: data.call ?? true,
        isLive: data.video ?? false,
      });
    },
    getIncomingRequests: async () => {
      await delay(400);
      return mockResponse({ requests: MOCK_INCOMING_REQUESTS });
    },
    getWaitlist: async () => {
      await delay(400);
      return mockResponse({
        totalSize: MOCK_WAITLIST.length,
        callQueueSize: MOCK_WAITLIST.filter(w => w.type === 'call').length,
        chatQueueSize: MOCK_WAITLIST.filter(w => w.type === 'chat').length,
        waitlist: MOCK_WAITLIST,
      });
    },
    getActiveChat: async () => {
      await delay(400);
      return mockResponse(MOCK_ACTIVE_SESSION);
    },
    getActiveCall: async () => {
      await delay(400);
      return mockResponse(null);
    },
    acceptRequest: async (_requestId: string) => {
      await delay(500);
      return mockResponse({
        sessionId: `session-${Date.now()}`,
        userId: 'user-5',
      });
    },
    rejectRequest: async (_requestId: string) => {
      await delay(400);
      return mockResponse({ success: true });
    },
  },

  // Live Sessions
  live: {
    getSessions: async () => {
      await delay(400);
      return mockResponse({ sessions: MOCK_LIVE_SESSIONS });
    },
    startSession: async (_title: string, _description?: string) => {
      await delay(600);
      return mockResponse({
        sessionId: `live-${Date.now()}`,
        twilioRoomName: 'mock-live-room',
        twilioToken: 'mock-live-token',
      });
    },
    endSession: async (_sessionId: string) => {
      await delay(500);
      return mockResponse({
        duration: 3600,
        viewerCount: 234,
        earnings: 1500,
      });
    },
  },
};

// Check if mock should be used
export { shouldUseMockData };
