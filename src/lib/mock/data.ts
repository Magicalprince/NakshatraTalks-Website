/**
 * Mock Data for Development
 * This file contains all static mock data for testing the UI without backend
 */

import {
  Astrologer,
  User,
  ChatMessage,
  ChatSession,
  Transaction,
  WalletSummary,
  LiveSession,
  Review,
  AstrologerStats,
  WaitlistEntry,
  IncomingRequest,
  ActiveSession,
  DailyHoroscope,
} from '@/types/api.types';

// ============================================
// ASTROLOGERS
// ============================================

export const MOCK_ASTROLOGERS: Astrologer[] = [
  {
    id: '1',
    phone: '+919876543210',
    name: 'Chandradev',
    email: 'chandradev@example.com',
    image: '/images/astrologer/chandradev.png',
    description: 'Expert in Vedic Astrology and Kundli reading with 15+ years of experience.',
    bio: 'I am a renowned Vedic astrologer with expertise in Kundli analysis, marriage compatibility, and career guidance. I have helped thousands of clients find clarity in their lives through the ancient wisdom of astrology.',
    specialization: ['Vedic', 'Kundli', 'Marriage'],
    languages: ['Hindi', 'English'],
    experience: 15,
    education: ['PhD in Astrology', 'Jyotish Acharya'],
    pricePerMinute: 27,
    chatPricePerMinute: 25,
    callPricePerMinute: 30,
    rating: 5.0,
    totalCalls: 2000,
    totalReviews: 1845,
    isAvailable: true,
    isLive: false,
    chatAvailable: true,
    callAvailable: true,
    status: 'approved',
    createdAt: '2020-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    phone: '+919876543211',
    name: 'Sanjeevi',
    email: 'sanjeevi@example.com',
    image: '/images/astrologer/sanjeevi.png',
    description: 'Numerology and Tarot expert helping you unlock your potential.',
    bio: 'With a doctorate in Metaphysical Sciences and over 12 years of practice, I specialize in Numerology and Tarot reading. My unique approach combines traditional wisdom with modern psychology.',
    specialization: ['Numerology', 'Tarot', 'Career'],
    languages: ['English', 'Hindi', 'Tamil'],
    experience: 12,
    education: ['PhD in Metaphysical Sciences', 'Certified Tarot Master'],
    pricePerMinute: 27,
    chatPricePerMinute: 27,
    callPricePerMinute: 32,
    rating: 4.8,
    totalCalls: 1000,
    totalReviews: 890,
    isAvailable: true,
    isLive: true,
    chatAvailable: true,
    callAvailable: false,
    status: 'approved',
    createdAt: '2019-06-20T00:00:00.000Z',
    updatedAt: '2024-01-14T00:00:00.000Z',
  },
  {
    id: '3',
    phone: '+919876543212',
    name: 'Adhitiya',
    image: '/images/astrologer/astrologer1.png',
    description: 'Vastu and Palmistry specialist with ancient knowledge.',
    bio: 'As a 5th generation astrologer, I bring the ancient wisdom of Vastu Shastra and Palmistry to help you create harmony in your life and home. My family has served royal families for generations.',
    specialization: ['Vastu', 'Palmistry', 'Gemology'],
    languages: ['Hindi', 'Gujarati', 'Sanskrit'],
    experience: 20,
    education: ['Jyotish Acharya', 'Vastu Ratan'],
    pricePerMinute: 27,
    chatPricePerMinute: 27,
    callPricePerMinute: 32,
    rating: 4.6,
    totalCalls: 2000,
    totalReviews: 1210,
    isAvailable: false,
    isLive: false,
    chatAvailable: false,
    callAvailable: false,
    status: 'approved',
    createdAt: '2018-03-10T00:00:00.000Z',
    updatedAt: '2024-01-13T00:00:00.000Z',
  },
  {
    id: '4',
    phone: '+919876543213',
    name: 'Lakshmi Devi',
    image: '/images/astrologer/astrologer2.png',
    description: 'Marriage and Career specialist with intuitive insights.',
    bio: 'Blessed with intuitive abilities since childhood, I specialize in marriage compatibility and career guidance. My readings have helped countless couples find their perfect match.',
    specialization: ['Marriage', 'Career', 'Love'],
    languages: ['Tamil', 'English', 'Telugu'],
    experience: 10,
    education: ['MA in Astrology', 'Certified Marriage Counselor'],
    pricePerMinute: 20,
    chatPricePerMinute: 20,
    callPricePerMinute: 25,
    rating: 4.7,
    totalCalls: 2567,
    totalReviews: 1567,
    isAvailable: true,
    isLive: false,
    chatAvailable: true,
    callAvailable: true,
    status: 'approved',
    createdAt: '2021-08-05T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '5',
    phone: '+919876543214',
    name: 'Pandit Suresh',
    image: '/images/astrologer/astrologer4.png',
    description: 'KP Astrology and Horary expert for precise predictions.',
    bio: 'Specializing in KP Astrology and Horary predictions, I provide precise timing of events. My scientific approach to astrology has earned me recognition in astrological circles.',
    specialization: ['KP Astrology', 'Horary', 'Muhurta'],
    languages: ['Hindi', 'Bengali', 'English'],
    experience: 18,
    education: ['MSc in Mathematics', 'KP Jyotish Expert'],
    pricePerMinute: 28,
    chatPricePerMinute: 28,
    callPricePerMinute: 33,
    rating: 4.8,
    totalCalls: 4567,
    totalReviews: 2100,
    isAvailable: true,
    isLive: false,
    chatAvailable: true,
    callAvailable: true,
    status: 'approved',
    createdAt: '2019-11-20T00:00:00.000Z',
    updatedAt: '2024-01-14T00:00:00.000Z',
  },
  {
    id: '6',
    phone: '+919876543215',
    name: 'Swami Anand',
    image: '/images/astrologer/astrologer5.png',
    description: 'Spiritual healer and meditation guide with Vedic expertise.',
    bio: 'After 30 years of spiritual practice in the Himalayas, I now guide seekers through Vedic astrology combined with meditation and healing practices.',
    specialization: ['Spiritual', 'Meditation', 'Vedic'],
    languages: ['Hindi', 'Sanskrit', 'English'],
    experience: 25,
    education: ['Vedacharya', 'Yoga Shiromani'],
    pricePerMinute: 40,
    chatPricePerMinute: 40,
    callPricePerMinute: 50,
    rating: 4.95,
    totalCalls: 8900,
    totalReviews: 4500,
    isAvailable: true,
    isLive: true,
    chatAvailable: true,
    callAvailable: true,
    status: 'approved',
    createdAt: '2017-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
];

// ============================================
// USERS
// ============================================

export const MOCK_USER: User = {
  id: 'user-1',
  phone: '+919876543200',
  name: 'Rahul Kumar',
  email: 'rahul.kumar@example.com',
  profileImage: 'https://randomuser.me/api/portraits/men/75.jpg',
  dateOfBirth: '1990-05-15',
  placeOfBirth: 'Mumbai, Maharashtra',
  timeOfBirth: '10:30',
  gender: 'male',
  maritalStatus: 'single',
  walletBalance: 1250,
  role: 'user',
  isActive: true,
  createdAt: '2023-06-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

export const MOCK_ASTROLOGER_USER: User = {
  id: 'astrologer-1',
  phone: '+919876543210',
  name: 'Pt. Rajesh Sharma',
  email: 'rajesh.sharma@example.com',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  role: 'astrologer',
  isActive: true,
  createdAt: '2020-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
};

// ============================================
// CHAT MESSAGES
// ============================================

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sessionId: 'session-1',
    senderId: 'user-1',
    senderType: 'user',
    message: 'Namaste Guruji, I wanted to ask about my career prospects this year.',
    content: 'Namaste Guruji, I wanted to ask about my career prospects this year.',
    type: 'text',
    isRead: true,
    status: 'read',
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'msg-2',
    sessionId: 'session-1',
    senderId: '1',
    senderType: 'astrologer',
    message: 'Namaste! I can see from your birth chart that Jupiter is in a favorable position. This indicates good career growth ahead.',
    content: 'Namaste! I can see from your birth chart that Jupiter is in a favorable position. This indicates good career growth ahead.',
    type: 'text',
    isRead: true,
    status: 'read',
    createdAt: new Date(Date.now() - 540000).toISOString(),
  },
  {
    id: 'msg-3',
    sessionId: 'session-1',
    senderId: 'user-1',
    senderType: 'user',
    message: 'That sounds positive! When would be the best time to look for a job change?',
    content: 'That sounds positive! When would be the best time to look for a job change?',
    type: 'text',
    isRead: true,
    status: 'read',
    createdAt: new Date(Date.now() - 480000).toISOString(),
  },
  {
    id: 'msg-4',
    sessionId: 'session-1',
    senderId: '1',
    senderType: 'astrologer',
    message: 'The period between March and May looks very auspicious for career changes. Saturn will be in a supportive aspect during this time.',
    content: 'The period between March and May looks very auspicious for career changes. Saturn will be in a supportive aspect during this time.',
    type: 'text',
    isRead: true,
    status: 'read',
    createdAt: new Date(Date.now() - 420000).toISOString(),
  },
  {
    id: 'msg-5',
    sessionId: 'session-1',
    senderId: 'user-1',
    senderType: 'user',
    message: 'Should I wear any specific gemstone for career success?',
    content: 'Should I wear any specific gemstone for career success?',
    type: 'text',
    isRead: true,
    status: 'read',
    createdAt: new Date(Date.now() - 360000).toISOString(),
  },
  {
    id: 'msg-6',
    sessionId: 'session-1',
    senderId: '1',
    senderType: 'astrologer',
    message: 'Based on your chart, wearing a Yellow Sapphire (Pukhraj) in gold on your index finger would be beneficial. Make sure to get it energized on a Thursday morning.',
    content: 'Based on your chart, wearing a Yellow Sapphire (Pukhraj) in gold on your index finger would be beneficial. Make sure to get it energized on a Thursday morning.',
    type: 'text',
    isRead: false,
    status: 'delivered',
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
];

// ============================================
// CHAT SESSIONS
// ============================================

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    astrologerId: '1',
    astrologerName: 'Pt. Rajesh Sharma',
    sessionType: 'chat',
    startTime: new Date(Date.now() - 900000).toISOString(),
    pricePerMinute: 25,
    status: 'active',
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'session-2',
    astrologerId: '2',
    astrologerName: 'Dr. Priya Mehta',
    sessionType: 'chat',
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 84600000).toISOString(),
    duration: 30,
    pricePerMinute: 30,
    totalCost: 900,
    status: 'completed',
    rating: 5,
    review: 'Excellent guidance on career matters!',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'session-3',
    astrologerId: '4',
    astrologerName: 'Jyotishi Lakshmi Devi',
    sessionType: 'call',
    startTime: new Date(Date.now() - 172800000).toISOString(),
    endTime: new Date(Date.now() - 171000000).toISOString(),
    duration: 25,
    pricePerMinute: 25,
    totalCost: 625,
    status: 'completed',
    rating: 4,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

// ============================================
// WALLET & TRANSACTIONS
// ============================================

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-1',
    userId: 'user-1',
    type: 'recharge',
    category: 'recharge',
    amount: 500,
    balance: 1250,
    description: 'Wallet Recharge',
    status: 'success',
    balanceBefore: 750,
    balanceAfter: 1250,
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'txn-2',
    userId: 'user-1',
    type: 'debit',
    category: 'chat_session',
    amount: -350,
    balance: 750,
    description: 'Chat with Pt. Rajesh Sharma',
    astrologerId: '1',
    astrologerName: 'Pt. Rajesh Sharma',
    sessionId: 'session-2',
    duration: 14,
    status: 'completed',
    balanceBefore: 1100,
    balanceAfter: 750,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'txn-3',
    userId: 'user-1',
    type: 'bonus',
    category: 'bonus',
    amount: 100,
    balance: 1100,
    description: 'Welcome Bonus',
    status: 'success',
    balanceBefore: 1000,
    balanceAfter: 1100,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'txn-4',
    userId: 'user-1',
    type: 'recharge',
    category: 'recharge',
    amount: 1000,
    balance: 1000,
    description: 'Wallet Recharge',
    status: 'success',
    balanceBefore: 0,
    balanceAfter: 1000,
    paymentMethod: 'Card',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'txn-5',
    userId: 'user-1',
    type: 'debit',
    category: 'call_session',
    amount: -625,
    balance: 625,
    description: 'Call with Jyotishi Lakshmi Devi',
    astrologerId: '4',
    astrologerName: 'Jyotishi Lakshmi Devi',
    sessionId: 'session-3',
    duration: 25,
    status: 'completed',
    balanceBefore: 1250,
    balanceAfter: 625,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const MOCK_WALLET_SUMMARY: WalletSummary = {
  balance: 1250,
  currency: 'INR',
  pendingOrders: 0,
  stats: {
    last30Days: {
      totalSpent: 975,
      totalRecharged: 1500,
      transactionCount: 5,
    },
  },
  recentTransactions: MOCK_TRANSACTIONS.slice(0, 5),
};

export const MOCK_RECHARGE_OPTIONS = [
  { id: '1', amount: 100, label: '₹100', isPopular: false },
  { id: '2', amount: 250, label: '₹250', isPopular: false },
  { id: '3', amount: 500, label: '₹500', bonus: 25, isPopular: true, tag: 'Popular' },
  { id: '4', amount: 1000, label: '₹1000', bonus: 75, isPopular: false, tag: 'Best Value' },
  { id: '5', amount: 2000, label: '₹2000', bonus: 200, isPopular: false },
  { id: '6', amount: 5000, label: '₹5000', bonus: 750, isPopular: false, tag: 'Max Savings' },
];

// ============================================
// LIVE SESSIONS
// ============================================

export const MOCK_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live-1',
    astrologerId: '2',
    astrologerName: 'Sanjeevi',
    astrologerImage: '/images/astrologer/sanjeevi.png',
    title: 'Love & Relationship Guidance',
    description: 'Join me for insights on finding and maintaining love in your life.',
    status: 'live',
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    viewerCount: 234,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'live-2',
    astrologerId: '6',
    astrologerName: 'Swami Anand',
    astrologerImage: '/images/astrologer/astrologer5.png',
    title: 'Meditation & Spiritual Growth',
    description: 'Evening meditation session with astrological insights.',
    status: 'live',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    viewerCount: 456,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'live-3',
    astrologerId: '1',
    astrologerName: 'Chandradev',
    astrologerImage: '/images/astrologer/chandradev.png',
    title: 'Career Guidance Q&A',
    description: 'Ask your career-related questions live!',
    status: 'live',
    scheduledAt: new Date(Date.now() + 7200000).toISOString(),
    viewerCount: 189,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'live-4',
    astrologerId: '3',
    astrologerName: 'Adhitiya',
    astrologerImage: '/images/astrologer/astrologer1.png',
    title: 'Vastu Tips for Home',
    description: 'Learn how to bring positive energy to your home.',
    status: 'live',
    startedAt: new Date(Date.now() - 900000).toISOString(),
    viewerCount: 156,
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

// ============================================
// REVIEWS
// ============================================

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'review-1',
    userId: 'user-2',
    userName: 'Amit Sharma',
    userImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    astrologerId: '1',
    sessionId: 'session-old-1',
    rating: 5,
    comment: 'Excellent predictions! Everything Guruji said about my career came true within 3 months.',
    tags: ['Accurate', 'Helpful', 'Professional'],
    status: 'approved',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 'review-2',
    userId: 'user-3',
    userName: 'Sneha Patel',
    userImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    astrologerId: '1',
    sessionId: 'session-old-2',
    rating: 5,
    comment: 'Very insightful session about my marriage compatibility. Highly recommended!',
    tags: ['Insightful', 'Caring'],
    status: 'approved',
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
  },
  {
    id: 'review-3',
    userId: 'user-4',
    userName: 'Vikram Singh',
    userImage: 'https://randomuser.me/api/portraits/men/44.jpg',
    astrologerId: '1',
    sessionId: 'session-old-3',
    rating: 4,
    comment: 'Good guidance on gemstones. The recommended Pukhraj has been beneficial.',
    tags: ['Knowledgeable'],
    status: 'approved',
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
  },
];

// ============================================
// ASTROLOGER DASHBOARD
// ============================================

export const MOCK_ASTROLOGER_STATS: AstrologerStats = {
  totalEarnings: 125000,
  todayEarnings: 3500,
  weeklyEarnings: 18500,
  monthlyEarnings: 65000,
  totalConsultations: 450,
  todayConsultations: 12,
  weeklyConsultations: 65,
  monthlyConsultations: 210,
  totalChatSessions: 280,
  totalCallSessions: 170,
  averageRating: 4.9,
  totalReviews: 2345,
  averageSessionDuration: 18,
};

export const MOCK_INCOMING_REQUESTS: IncomingRequest[] = [
  {
    requestId: 'req-1',
    type: 'chat',
    user: {
      id: 'user-5',
      name: 'Ravi Kumar',
      image: 'https://randomuser.me/api/portraits/men/55.jpg',
    },
    createdAt: new Date(Date.now() - 30000).toISOString(),
    expiresAt: new Date(Date.now() + 90000).toISOString(),
    remainingSeconds: 90,
    pricePerMinute: 25,
  },
  {
    requestId: 'req-2',
    type: 'call',
    user: {
      id: 'user-6',
      name: 'Meera Joshi',
      image: 'https://randomuser.me/api/portraits/women/56.jpg',
    },
    createdAt: new Date(Date.now() - 60000).toISOString(),
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    remainingSeconds: 60,
    pricePerMinute: 30,
  },
];

export const MOCK_WAITLIST: WaitlistEntry[] = [
  {
    queueId: 'queue-1',
    id: 'queue-1',
    userId: 'user-7',
    type: 'chat',
    position: 1,
    user: {
      id: 'user-7',
      name: 'Arjun Reddy',
      image: 'https://randomuser.me/api/portraits/men/66.jpg',
    },
    waitingMinutes: 5,
    createdAt: new Date(Date.now() - 300000).toISOString(),
  },
  {
    queueId: 'queue-2',
    id: 'queue-2',
    userId: 'user-8',
    type: 'call',
    position: 2,
    user: {
      id: 'user-8',
      name: 'Priya Nair',
      image: 'https://randomuser.me/api/portraits/women/67.jpg',
    },
    waitingMinutes: 3,
    createdAt: new Date(Date.now() - 180000).toISOString(),
  },
  {
    queueId: 'queue-3',
    id: 'queue-3',
    userId: 'user-9',
    type: 'chat',
    position: 3,
    user: {
      id: 'user-9',
      name: 'Kiran Desai',
      image: 'https://randomuser.me/api/portraits/men/77.jpg',
    },
    waitingMinutes: 1,
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
];

export const MOCK_ACTIVE_SESSION: ActiveSession = {
  sessionId: 'active-session-1',
  user: {
    id: 'user-1',
    name: 'Rahul Kumar',
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
  },
  startTime: new Date(Date.now() - 600000).toISOString(),
  duration: 10,
  pricePerMinute: 25,
  currentCost: 250,
};

// ============================================
// HOROSCOPES
// ============================================

export const MOCK_DAILY_HOROSCOPES: Record<string, DailyHoroscope> = {
  aries: {
    sign: 'aries',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Today brings exciting opportunities for career advancement. Your natural leadership qualities will shine, attracting positive attention from superiors. Financial matters look favorable, with potential for unexpected gains. In matters of the heart, open communication will strengthen bonds.',
    luckyNumber: 9,
    luckyColor: 'Red',
    mood: 'Energetic',
  },
  taurus: {
    sign: 'taurus',
    date: new Date().toISOString().split('T')[0],
    prediction: 'A peaceful day awaits you. Focus on completing pending tasks and organizing your space. Financial stability continues, making it a good time for small investments. Romantic relationships benefit from quiet moments together.',
    luckyNumber: 6,
    luckyColor: 'Green',
    mood: 'Calm',
  },
  gemini: {
    sign: 'gemini',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Your communication skills are at their peak today. Networking opportunities may lead to exciting collaborations. Be mindful of expenses and avoid impulsive purchases. Social activities bring joy and new connections.',
    luckyNumber: 5,
    luckyColor: 'Yellow',
    mood: 'Social',
  },
  cancer: {
    sign: 'cancer',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Family matters take center stage today. Your nurturing nature will be appreciated by loved ones. Property-related matters may require attention. Trust your intuition in making important decisions.',
    luckyNumber: 2,
    luckyColor: 'Silver',
    mood: 'Intuitive',
  },
  leo: {
    sign: 'leo',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Your creative energy is high today. Express yourself through art, music, or any creative pursuit. Recognition at work is likely. Romance flourishes under your warm and generous approach.',
    luckyNumber: 1,
    luckyColor: 'Gold',
    mood: 'Creative',
  },
  virgo: {
    sign: 'virgo',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Attention to detail serves you well today. Health matters improve with proper care. Work projects benefit from your analytical approach. Avoid overthinking in relationships; trust the process.',
    luckyNumber: 3,
    luckyColor: 'Navy Blue',
    mood: 'Analytical',
  },
  libra: {
    sign: 'libra',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Harmony in relationships is highlighted today. Partnership opportunities arise in business. Artistic pursuits bring satisfaction. Balance your giving nature with self-care.',
    luckyNumber: 7,
    luckyColor: 'Pink',
    mood: 'Harmonious',
  },
  scorpio: {
    sign: 'scorpio',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Transformation and renewal are themes today. Financial insights lead to better planning. Deep conversations strengthen bonds. Trust your instincts in navigating complex situations.',
    luckyNumber: 8,
    luckyColor: 'Maroon',
    mood: 'Intense',
  },
  sagittarius: {
    sign: 'sagittarius',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Adventure calls today. Travel plans may materialize. Learning new skills brings joy. Optimism attracts positive opportunities. Share your wisdom with those who seek guidance.',
    luckyNumber: 4,
    luckyColor: 'Purple',
    mood: 'Adventurous',
  },
  capricorn: {
    sign: 'capricorn',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Career ambitions get a boost today. Your disciplined approach pays off. Long-term investments look favorable. Take time to acknowledge your achievements.',
    luckyNumber: 10,
    luckyColor: 'Brown',
    mood: 'Ambitious',
  },
  aquarius: {
    sign: 'aquarius',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Innovation and originality mark your day. Group activities bring fulfillment. Technology-related ventures succeed. Embrace your unique perspective; it inspires others.',
    luckyNumber: 11,
    luckyColor: 'Electric Blue',
    mood: 'Innovative',
  },
  pisces: {
    sign: 'pisces',
    date: new Date().toISOString().split('T')[0],
    prediction: 'Spiritual insights guide your path today. Creative and artistic pursuits flourish. Compassion strengthens relationships. Dreams may hold meaningful messages; keep a journal.',
    luckyNumber: 12,
    luckyColor: 'Sea Green',
    mood: 'Spiritual',
  },
};

// ============================================
// HOME PAGE DATA
// ============================================

export const MOCK_HOME_CATEGORIES = [
  { id: '1', name: 'Love', icon: 'heart', color: '#FF6B6B' },
  { id: '2', name: 'Career', icon: 'briefcase', color: '#4ECDC4' },
  { id: '3', name: 'Marriage', icon: 'rings', color: '#FFE66D' },
  { id: '4', name: 'Health', icon: 'heart-pulse', color: '#95E1D3' },
  { id: '5', name: 'Finance', icon: 'wallet', color: '#DDA0DD' },
  { id: '6', name: 'Education', icon: 'graduation-cap', color: '#87CEEB' },
];

export const MOCK_BANNERS = [
  {
    id: '1',
    title: 'First Consultation Free!',
    subtitle: 'Get your first 5 minutes free with any astrologer',
    image: '/images/banner-1.jpg',
    link: '/browse-chat',
  },
  {
    id: '2',
    title: 'Live Sessions Now',
    subtitle: 'Join our astrologers live and get instant answers',
    image: '/images/banner-2.jpg',
    link: '/live-sessions',
  },
];

// Helper function to check if mock data should be used
export const shouldUseMockData = (): boolean => {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ||
         process.env.NODE_ENV === 'development';
};
