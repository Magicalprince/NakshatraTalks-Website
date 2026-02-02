/**
 * API Endpoints - Ported from NakshatraTalksMobile
 * All API endpoint constants
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.nakshatratalks.com',
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },

  // User
  USER: {
    PROFILE: '/api/v1/users/profile',
    APP_STATE: '/api/v1/users/me/app-state',
  },

  // Astrologers
  ASTROLOGERS: {
    LIVE: '/api/v1/astrologers/live',
    TOP_RATED: '/api/v1/astrologers/top-rated',
    DETAILS: (id: string) => `/api/v1/astrologers/${id}`,
    SEARCH: '/api/v1/astrologers/search',
    AVAILABLE: '/api/v1/astrologers/available',
    REVIEWS: (id: string) => `/api/v1/astrologers/${id}/reviews`,
    FOLLOW: (id: string) => `/api/v1/astrologers/${id}/follow`,
    UNFOLLOW: (id: string) => `/api/v1/astrologers/${id}/unfollow`,
    PHOTOS: (id: string) => `/api/v1/astrologers/${id}/photos`,
    STATS: (id: string) => `/api/v1/astrologers/${id}/stats`,
    WORKING_HOURS: (id: string) => `/api/v1/astrologers/${id}/working-hours`,
    WAITLIST: (id: string) => `/api/v1/astrologers/${id}/waitlist`,

    // Astrologer /me/ endpoints
    ME: {
      TOGGLE_AVAILABILITY: '/api/v1/astrologers/me/toggle-availability',
      AVAILABILITY_STATUS: '/api/v1/astrologers/me/availability-status',
      HEARTBEAT: '/api/v1/astrologers/me/heartbeat',
      APP_STATE: '/api/v1/astrologers/me/app-state',
      INCOMING_ALL: '/api/v1/astrologer/incoming-all',
      CALL_INCOMING: '/api/v1/astrologer/call/incoming',
      CALL_ACTIVE: '/api/v1/astrologer/call/active',
      CALL_QUEUE: '/api/v1/astrologer/call/queue',
      CALL_ACCEPT: (requestId: string) => `/api/v1/astrologer/call/request/${requestId}/accept`,
      CALL_REJECT: (requestId: string) => `/api/v1/astrologer/call/request/${requestId}/reject`,
      CALL_END_SESSION: (sessionId: string) => `/api/v1/astrologer/call/sessions/${sessionId}/end`,
      CALL_QUEUE_CONNECT: (queueId: string) => `/api/v1/astrologer/call/queue/${queueId}/connect`,
      CALL_QUEUE_CANCEL: (queueId: string) => `/api/v1/astrologer/call/queue/${queueId}/cancel`,
      CHAT_INCOMING: '/api/v1/astrologer/chat/incoming',
      CHAT_ACTIVE: '/api/v1/astrologer/chat/active',
      CHAT_QUEUE: '/api/v1/astrologer/chat/queue',
      CHAT_ACCEPT: (requestId: string) => `/api/v1/astrologer/chat/request/${requestId}/accept`,
      CHAT_REJECT: (requestId: string) => `/api/v1/astrologer/chat/request/${requestId}/reject`,
      CHAT_END_SESSION: (sessionId: string) => `/api/v1/astrologer/chat/sessions/${sessionId}/end`,
      CHAT_MESSAGES: (sessionId: string) => `/api/v1/astrologer/chat/sessions/${sessionId}/messages`,
      CHAT_QUEUE_CONNECT: (queueId: string) => `/api/v1/astrologer/chat/queue/${queueId}/connect`,
      CHAT_QUEUE_CANCEL: (queueId: string) => `/api/v1/astrologer/chat/queue/${queueId}/cancel`,
      WAITLIST: '/api/v1/astrologer/waitlist',
    },
  },

  // Wallet
  WALLET: {
    BALANCE: '/api/v1/wallet/balance',
    SUMMARY: '/api/v1/wallet/summary',
    RECHARGE_OPTIONS: '/api/v1/wallet/recharge-options',
    RECHARGE_INITIATE: '/api/v1/wallet/recharge/initiate',
    RECHARGE_VERIFY: '/api/v1/wallet/recharge/verify',
    TRANSACTIONS: '/api/v1/wallet/transactions',
    RECHARGES: '/api/v1/wallet/recharges',
    PENDING_ORDERS: '/api/v1/wallet/orders/pending',
    CANCEL_ORDER: (orderId: string) => `/api/v1/wallet/orders/${orderId}/cancel`,
  },

  // Content
  CONTENT: {
    CATEGORIES: '/api/v1/categories',
    BANNERS: '/api/v1/banners',
    SPECIALIZATIONS: '/api/v1/specializations',
  },

  // Feedback
  FEEDBACK: '/api/v1/feedback',

  // Chat
  CHAT: {
    AVAILABLE_ASTROLOGERS: '/api/v1/chat/astrologers/available',
    VALIDATE_BALANCE: '/api/v1/chat/validate-balance',
    SESSIONS: '/api/v1/chat/sessions',
    ACTIVE_SESSION: '/api/v1/chat/sessions/active',
    END_SESSION: (sessionId: string) => `/api/v1/chat/sessions/${sessionId}/end`,
    DECLINE_SESSION: (sessionId: string) => `/api/v1/chat/sessions/${sessionId}/decline`,
    CONNECT_SESSION: (sessionId: string) => `/api/v1/chat/sessions/${sessionId}/connect`,
    MESSAGES: (sessionId: string) => `/api/v1/chat/sessions/${sessionId}/messages`,
    RATING: (sessionId: string) => `/api/v1/chat/sessions/${sessionId}/rating`,
    REQUEST: '/api/v1/chat/request',
    PENDING_REQUEST: '/api/v1/chat/request/pending',
    REQUEST_STATUS: (requestId: string) => `/api/v1/chat/request/${requestId}/status`,
    CANCEL_REQUEST: (requestId: string) => `/api/v1/chat/request/${requestId}/cancel`,
    QUEUE_JOIN: '/api/v1/chat/queue/join',
    QUEUE_STATUS: '/api/v1/chat/queue/status',
    QUEUE_POSITION: (astrologerId: string) => `/api/v1/chat/queue/${astrologerId}/position`,
    QUEUE_INFO: (astrologerId: string) => `/api/v1/chat/queue/${astrologerId}/info`,
    QUEUE_LEAVE: (queueId: string) => `/api/v1/chat/queue/${queueId}/leave`,
    QUEUE_CHAT_NOW: (queueId: string) => `/api/v1/chat/queue/${queueId}/chat-now`,
  },

  // Call
  CALL: {
    AVAILABLE_ASTROLOGERS: '/api/v1/call/astrologers',
    SPECIALIZATIONS: '/api/v1/call/specializations',
    VALIDATE_BALANCE: '/api/v1/call/validate-balance',
    SESSIONS: '/api/v1/call/sessions',
    ACTIVE_SESSION: '/api/v1/call/sessions/active',
    END_SESSION: (sessionId: string) => `/api/v1/call/sessions/${sessionId}/end`,
    DECLINE_SESSION: (sessionId: string) => `/api/v1/call/sessions/${sessionId}/decline`,
    SESSION_DETAILS: (sessionId: string) => `/api/v1/call/sessions/${sessionId}`,
    RATING: (sessionId: string) => `/api/v1/call/sessions/${sessionId}/rating`,
    REQUEST: '/api/v1/call/request',
    PENDING_REQUEST: '/api/v1/call/request/pending',
    REQUEST_STATUS: (requestId: string) => `/api/v1/call/request/${requestId}/status`,
    CANCEL_REQUEST: (requestId: string) => `/api/v1/call/request/${requestId}/cancel`,
    QUEUE_JOIN: '/api/v1/call/queue/join',
    QUEUE_STATUS: '/api/v1/call/queue/status',
    QUEUE_POSITION: (astrologerId: string) => `/api/v1/call/queue/${astrologerId}/position`,
    QUEUE_INFO: (astrologerId: string) => `/api/v1/call/queue/${astrologerId}/info`,
    QUEUE_LEAVE: (queueId: string) => `/api/v1/call/queue/${queueId}/leave`,
    QUEUE_CALL_NOW: (queueId: string) => `/api/v1/call/queue/${queueId}/call-now`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/api/v1/notifications',
    UNREAD_COUNT: '/api/v1/notifications/unread-count',
    MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
    MARK_ALL_READ: '/api/v1/notifications/read-all',
    DEVICE_TOKEN: '/api/v1/notifications/device-token',
  },

  // Live Sessions
  LIVE_SESSIONS: {
    LIST: '/api/v1/live-sessions',
    DETAILS: (sessionId: string) => `/api/v1/live-sessions/${sessionId}`,
    JOIN: (sessionId: string) => `/api/v1/live-sessions/${sessionId}/join`,
    LEAVE: (sessionId: string) => `/api/v1/live-sessions/${sessionId}/leave`,
    MESSAGES: (sessionId: string) => `/api/v1/live-sessions/${sessionId}/messages`,
    SEND_MESSAGE: (sessionId: string) => `/api/v1/live-sessions/${sessionId}/messages`,
    VIEWERS: (sessionId: string) => `/api/v1/live-sessions/${sessionId}/viewers`,
    CREATE: '/api/v1/live-sessions',
    UPDATE: (sessionId: string) => `/api/v1/live-sessions/${sessionId}`,
    DELETE: (sessionId: string) => `/api/v1/live-sessions/${sessionId}`,
    START: (sessionId: string) => `/api/v1/live-sessions/${sessionId}/start`,
    END: (sessionId: string) => `/api/v1/live-sessions/${sessionId}/end`,
    ASTROLOGER_SCHEDULED: '/api/v1/live-sessions/astrologer/scheduled',
    ASTROLOGER_HISTORY: '/api/v1/live-sessions/astrologer/history',
  },

  // Horoscope
  HOROSCOPE: {
    DAILY: '/api/v1/horoscope/daily',
    SIGNS: '/api/v1/horoscope/signs',
  },

  // Places Search
  PLACES: {
    SEARCH: '/api/v1/places/search',
    POPULAR: '/api/v1/places/popular',
    REVERSE: '/api/v1/places/reverse',
  },

  // Kundli
  KUNDLI: {
    GENERATE: '/api/v1/kundli/generate',
    LIST: '/api/v1/kundli/list',
    GET_BY_ID: (kundliId: string) => `/api/v1/kundli/${kundliId}`,
    GET_REPORT: (kundliId: string) => `/api/v1/kundli/${kundliId}/report`,
    UPDATE: (kundliId: string) => `/api/v1/kundli/${kundliId}`,
    DELETE: (kundliId: string) => `/api/v1/kundli/${kundliId}`,
  },

  // Kundli Matching
  MATCHING: {
    GENERATE: '/api/v1/matching/generate',
    LIST: '/api/v1/matching/list',
    GET_BY_ID: (matchingId: string) => `/api/v1/matching/${matchingId}`,
    GET_REPORT: (matchingId: string) => `/api/v1/matching/${matchingId}/report`,
    DELETE: (matchingId: string) => `/api/v1/matching/${matchingId}`,
  },
};
