/**
 * API Types - Ported from NakshatraTalksMobile
 * All TypeScript interfaces for the API
 */

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: Pagination;
  error?: ApiError;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// Pagination
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// User Model
export interface User {
  id: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  profileImage?: string | null;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  timeOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | null;
  walletBalance?: number;
  role: 'user' | 'astrologer' | 'admin';
  isActive?: boolean;
  app_metadata?: unknown;
  user_metadata?: unknown;
  aud?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

// User Profile (from /api/v1/users/profile)
export interface UserProfile {
  userId: string;
  name?: string | null;
  phone: string;
  email?: string | null;
  profileImage?: string | null;
  walletBalance: number;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  timeOfBirth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | null;
  createdAt: string;
}

// Update Profile Data
export interface UpdateProfileData {
  name?: string;
  email?: string;
  profileImage?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  timeOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
}

// Astrologer Model
export interface Astrologer {
  id: string;
  phone: string;
  name: string;
  email?: string | null;
  image: string;
  description?: string | null;
  bio?: string | null;
  specialization: string[];
  languages: string[];
  experience: number;
  education?: string[];
  pricePerMinute: number;
  rating: number;
  totalCalls: number;
  totalReviews?: number;
  isAvailable: boolean;
  isLive: boolean;
  chatAvailable?: boolean;
  callAvailable?: boolean;
  chatPricePerMinute?: number;
  callPricePerMinute?: number;
  lastActivityAt?: string | null;
  workingHours?: Record<string, string>;
  nextAvailableAt?: string | null;
  status?: 'pending' | 'approved' | 'rejected' | 'inactive';
  role?: string;
  photos?: string[];
  reviews?: Review[];
  createdAt?: string;
  updatedAt?: string;
  // Computed aliases for compatibility
  profileImage?: string;  // Alias for image
  specializations?: string[];  // Alias for specialization
  isOnline?: boolean;  // Alias for isAvailable
  chatPrice?: number;  // Alias for chatPricePerMinute
  callPrice?: number;  // Alias for callPricePerMinute
  reviewCount?: number;  // Alias for totalReviews
  totalConsultations?: number;  // Alias for totalCalls
  isVerified?: boolean;  // Verification status
}

// Astrologer Filters for search/browse
export interface AstrologerFilters {
  specializations?: string[];
  languages?: string[];
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  isOnline?: boolean;
  minExperience?: number;
}

// Review Model
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  astrologerId?: string;
  sessionId?: string;
  rating: number;
  comment?: string | null;
  tags?: string[];
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

// Category Model
export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Specialization Model
export interface Specialization {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Banner Model
export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  buttonText?: string | null;
  buttonAction?: string | null;
  image?: string | null;
  backgroundColor?: string | null;
  order: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Wallet Balance
export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

// Transaction Model
export interface Transaction {
  id: string;
  userId?: string;
  type: 'recharge' | 'debit' | 'refund' | 'credit' | 'bonus' | 'session_debit';
  category?: 'chat' | 'call' | 'chat_session' | 'call_session' | 'recharge' | 'refund' | 'bonus';
  amount: number;
  balance?: number;
  description: string;
  astrologerId?: string | null;
  astrologerName?: string | null;
  sessionId?: string | null;
  duration?: number | null;
  paymentId?: string | null;
  paymentMethod?: string | null;
  status: 'pending' | 'success' | 'failed' | 'completed';
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: string;
}

// Recharge Data
export interface RechargeData {
  amount: number;
  paymentMethod: string;
  paymentId: string;
}

// Wallet Summary Response
export interface WalletSummary {
  balance: number;
  currency: string;
  pendingOrders: number;
  stats: {
    last30Days: {
      totalSpent: number;
      totalRecharged: number;
      transactionCount: number;
    };
  };
  recentTransactions: Transaction[];
}

// Recharge Option
export interface RechargeOption {
  id: string;
  amount: number;
  label?: string;
  bonus?: number;
  isPopular?: boolean;
  tag?: string;
  description?: string;
}

// Initiate Recharge Response
export interface InitiateRechargeResponse {
  orderId: string;
  keyId: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

// Verify Payment Data
export interface VerifyPaymentData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// Verify Payment Response
export interface VerifyPaymentResponse {
  success: boolean;
  transactionId: string;
  newBalance: number;
  message?: string;
}

// Pending Order
export interface PendingOrder {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'processing';
  createdAt: string;
  expiresAt?: string;
}

// Chat Session Model
export interface ChatSession {
  id: string;
  userId?: string;
  astrologerId: string;
  astrologerName?: string;
  sessionType: 'chat' | 'call' | 'video';
  startTime: string;
  endTime?: string | null;
  duration?: number | null;
  pricePerMinute: number;
  totalCost?: number | null;
  status: 'active' | 'completed' | 'cancelled';
  rating?: number | null;
  review?: string | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Chat Message Model
export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'user' | 'astrologer';
  message: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: string;
}

// Notification Model
export interface Notification {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'wallet' | 'chat' | 'promotion' | 'system';
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Feedback Data
export interface FeedbackData {
  name: string;
  email?: string;
  comments: string;
  rating?: number;
  category?: string;
}

// Search Filters
export interface SearchFilters {
  q?: string;
  language?: string;
  languages?: string;
  specialization?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  onlyLive?: boolean;
  sortBy?: 'rating' | 'price_per_minute' | 'experience' | 'total_calls' | 'chat_price_per_minute' | 'call_price_per_minute';
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Balance Validation Response
export interface BalanceValidationResponse {
  canStartChat?: boolean;
  canStartCall?: boolean;
  currentBalance: number;
  pricePerMinute: number;
  minimumRequired: number;
  estimatedMinutes?: number;
  shortfall?: number;
}

// Session Creation Data
export interface CreateSessionData {
  astrologerId: string;
  sessionType: 'chat' | 'call' | 'video';
}

// End Session Data
export interface EndSessionData {
  endReason?: 'user_ended' | 'astrologer_ended' | 'timeout' | 'insufficient_balance';
}

// End Chat Session Response
export interface EndChatSessionResponse {
  sessionId: string;
  duration: number;
  durationFormatted: string;
  durationSeconds?: number;
  totalCost: number;
  totalEarnings?: number;
  remainingBalance?: number;
  newBalance?: number;
  alreadyProcessed: boolean;
  endTime?: string;
  startTime?: string;
}

// End Call Session Response
export interface EndCallSessionResponse {
  sessionId: string;
  duration: number;
  durationSeconds: number;
  billedMinutes: number;
  pricePerMinute: number;
  totalCost: number;
  remainingBalance: number;
}

// Search Results
export interface SearchResults {
  results: Astrologer[];
  total: number;
  filters: {
    languages: string[];
    specializations: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

// Astrologer Data (for astrologer login response)
export interface AstrologerData {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  image: string;
  bio?: string | null;
  specialization: string[];
  languages: string[];
  experience: number;
  education?: string[];
  chatPricePerMinute: number;
  callPricePerMinute: number;
  rating: number;
  totalCalls: number;
  totalReviews: number;
  isAvailable: boolean;
  chatAvailable: boolean;
  callAvailable: boolean;
  isLive: boolean;
  workingHours: Record<string, { start: string; end: string } | null>;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Astrologer Statistics
export interface AstrologerStats {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalConsultations: number;
  todayConsultations: number;
  weeklyConsultations: number;
  monthlyConsultations: number;
  totalChatSessions: number;
  totalCallSessions: number;
  averageRating: number;
  totalReviews: number;
  averageSessionDuration: number;
}

// Waitlist Item
export interface WaitlistItem {
  id: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  requestType: 'call' | 'chat';
  requestedAt: string;
  pricePerMinute: number;
  userBalance?: number;
  estimatedMinutes?: number;
  position: number;
}

// Active Session for Astrologer
export interface AstrologerActiveSession {
  id: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  sessionType: 'call' | 'chat';
  startTime: string;
  duration: number;
  pricePerMinute: number;
  currentEarnings: number;
  userBalance: number;
}

// Availability Status Response
export interface AvailabilityStatusResponse {
  isAvailable: boolean;
  chatAvailable: boolean;
  callAvailable: boolean;
  isLive: boolean;
  lastHeartbeat?: string;
}

// Toggle Availability Response
export interface ToggleAvailabilityResponse {
  success: boolean;
  isAvailable: boolean;
  message?: string;
}

// Queue System Types
export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'timeout' | 'cancelled' | 'missed' | 'session_ended';
export type QueueStatus = 'waiting' | 'notified' | 'connected' | 'cancelled' | 'expired' | 'skipped';
export type SessionType = 'call' | 'chat';

// User Info (for requests)
export interface UserInfo {
  id: string;
  name: string;
  image: string | null;
  rating?: number;
}

// Astrologer Info (for requests)
export interface AstrologerInfo {
  id: string;
  name: string;
  image: string;
}

// Incoming Request (for astrologer)
export interface IncomingRequest {
  requestId: string;
  type: SessionType;
  user: UserInfo;
  createdAt: string;
  expiresAt: string;
  remainingSeconds: number;
  pricePerMinute: number;
}

// Incoming Requests Response
export interface IncomingRequestsResponse {
  hasIncomingRequests: boolean;
  requests: IncomingRequest[];
}

// Waitlist Entry
export interface WaitlistEntry {
  queueId?: string;
  id?: string;
  userId?: string;
  type: SessionType;
  position: number;
  user: UserInfo;
  waitingMinutes?: number;
  createdAt?: string;
  joinedAt?: string;
  expiresAt?: string;
}

// Unified Waitlist Response
export interface UnifiedWaitlistResponse {
  totalSize: number;
  callQueueSize: number;
  chatQueueSize: number;
  waitlist: WaitlistEntry[];
}

// Active Session (for astrologer)
export interface ActiveSession {
  sessionId: string;
  user: UserInfo;
  startTime: string;
  duration: number;
  pricePerMinute: number;
  currentCost: number;
  twilioRoomName?: string;
  twilioToken?: string;
}

// End Session Response (Astrologer side)
export interface EndSessionResponse {
  sessionId: string;
  duration: number;
  durationFormatted: string;
  durationSeconds?: number;
  totalCost: number;
  totalEarnings: number;
  newBalance?: number;
  alreadyProcessed?: boolean;
}

// Chat Request Response
export interface CreateChatRequestResponse {
  requestId: string;
  status: RequestStatus;
  expiresAt: string;
  remainingSeconds: number;
  astrologer: AstrologerInfo;
  pricePerMinute: number;
}

// Chat Request Status Response
export interface ChatRequestStatusResponse {
  requestId: string;
  status: RequestStatus;
  expiresAt: string;
  remainingSeconds: number;
  session?: {
    sessionId: string;
    startTime: string;
    pricePerMinute: number;
  };
  rejectReason?: string;
}

// Queue Entry (for user)
export interface QueueEntry {
  queueId: string;
  astrologerId: string;
  astrologerName: string;
  astrologerImage: string;
  position: number;
  status: QueueStatus;
  estimatedWaitMinutes: number;
  expiresAt: string;
  remainingSeconds: number;
}

// Queue Info Response
export interface QueueInfoResponse {
  queueSize: number;
  estimatedWaitMinutes: number;
  isInCall?: boolean;
  isInChat?: boolean;
  canJoinQueue: boolean;
  maxQueueSize: number;
}

// Join Queue Response
export interface JoinQueueResponse {
  queueId: string;
  position: number;
  estimatedWaitMinutes: number;
  expiresAt: string;
  remainingSeconds: number;
  astrologer: AstrologerInfo;
}

// Queue Status Response
export interface QueueStatusResponse {
  queues: QueueEntry[];
}

// Auth Responses
export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  userType: 'user' | 'astrologer';
  access_token: string;
  refresh_token: string;
  user: User;
  astrologer?: AstrologerData;
}

export interface GetMeResponse {
  success: boolean;
  user: User;
}

// Error Codes
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_PHONE = 'INVALID_PHONE',
  INVALID_OTP = 'INVALID_OTP',
  INVALID_RATING = 'INVALID_RATING',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ASTROLOGER_NOT_FOUND = 'ASTROLOGER_NOT_FOUND',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  CONFLICT = 'CONFLICT',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  ALREADY_REVIEWED = 'ALREADY_REVIEWED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  ASTROLOGER_NOT_AVAILABLE = 'ASTROLOGER_NOT_AVAILABLE',
  SESSION_NOT_ACTIVE = 'SESSION_NOT_ACTIVE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_OTP_REQUESTS = 'TOO_MANY_OTP_REQUESTS',
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

// Horoscope Types
export interface HoroscopeSign {
  id: string;
  name: string;
  symbol: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  dateRange: string;
}

export interface DailyHoroscope {
  sign: string;
  date: string;
  prediction: string;
  luckyNumber?: number;
  luckyColor?: string;
  mood?: string;
}

// Kundli Types
export interface KundliInput {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Kundli {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: string;
  createdAt: string;
}

export interface KundliReport {
  kundliId: string;
  basicInfo: Record<string, unknown>;
  charts: Record<string, unknown>;
  planets: Record<string, unknown>;
  doshas: Record<string, unknown>;
}

// Matching Types
export interface MatchingInput {
  boyKundliId?: string;
  girlKundliId?: string;
  boyDetails?: KundliInput;
  girlDetails?: KundliInput;
}

export interface MatchingReport {
  id: string;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  categories: Record<string, unknown>;
  recommendation: string;
  createdAt: string;
}

// Live Session Types
export interface LiveSession {
  id: string;
  astrologerId: string;
  astrologerName: string;
  astrologerImage: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  viewerCount: number;
  maxViewers?: number;
  twilioRoomName?: string;
  createdAt: string;
}

export interface LiveSessionMessage {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  userImage?: string;
  message: string;
  createdAt: string;
}
