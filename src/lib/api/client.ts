/**
 * API Client - Production-Ready Web Client
 *
 * Features:
 * - JWT Bearer token auth with auto-refresh
 * - Request queuing during token refresh
 * - Graceful error handling with typed errors
 * - Request deduplication for GET requests
 * - Auth event system for logout/session management
 */

import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './endpoints';

// ─── Auth Event System ───────────────────────────────────────────────
type AuthEventType = 'logout_required' | 'session_invalid' | 'token_refreshed';
type AuthEventHandler = (reason?: string) => void;

class AuthEventEmitter {
  private handlers: Map<AuthEventType, AuthEventHandler[]> = new Map();

  on(event: AuthEventType, handler: AuthEventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
    return () => this.off(event, handler);
  }

  off(event: AuthEventType, handler: AuthEventHandler) {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index > -1) eventHandlers.splice(index, 1);
    }
  }

  emit(event: AuthEventType, reason?: string) {
    this.handlers.get(event)?.forEach((handler) => handler(reason));
  }

  logoutRequired(reason: string) {
    this.emit('logout_required', reason);
  }

  sessionInvalid(reason: string) {
    this.emit('session_invalid', reason);
  }

  tokenRefreshed() {
    this.emit('token_refreshed');
  }
}

export const authEvents = new AuthEventEmitter();

// ─── Typed API Error ─────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }
  get isForbidden() {
    return this.statusCode === 403;
  }
  get isNotFound() {
    return this.statusCode === 404;
  }
  get isServerError() {
    return this.statusCode >= 500;
  }
  get isNetworkError() {
    return this.statusCode === 0;
  }
}

// ─── API Client ──────────────────────────────────────────────────────
class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private failedRequestsQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
    config: InternalAxiosRequestConfig;
  }> = [];

  // Deduplication: track in-flight GET requests
  private inflightGets: Map<string, Promise<unknown>> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  // ─── Interceptors ──────────────────────────────────────────────────
  private setupInterceptors() {
    // Request: attach Bearer token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response: handle 401 with auto-refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Network error (no response)
        if (!error.response) {
          return Promise.reject(
            new ApiError(
              error.message || 'Network error. Please check your connection.',
              0,
              'NETWORK_ERROR'
            )
          );
        }

        const { status, data } = error.response as {
          status: number;
          data: { message?: string; error?: { code?: string; message?: string } };
        };

        // 401 Unauthorized → token refresh
        if (status === 401 && originalRequest && !originalRequest._retry) {
          const isAuthEndpoint = originalRequest.url?.includes('/auth/');
          if (isAuthEndpoint) {
            this.clearAccessToken();
            authEvents.sessionInvalid('Auth endpoint returned 401');
            return Promise.reject(
              new ApiError('Session expired', 401, 'SESSION_EXPIRED')
            );
          }

          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedRequestsQueue.push({
                resolve,
                reject,
                config: originalRequest,
              });
            });
          }

          try {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.client(originalRequest);
            }
            this.clearAccessToken();
            authEvents.logoutRequired('Token refresh failed');
            return Promise.reject(
              new ApiError('Session expired', 401, 'TOKEN_REFRESH_FAILED')
            );
          } catch {
            this.clearAccessToken();
            authEvents.logoutRequired('Token refresh error');
            return Promise.reject(
              new ApiError('Session expired', 401, 'TOKEN_REFRESH_ERROR')
            );
          }
        }

        // Build typed error from response
        const message =
          data?.error?.message ||
          data?.message ||
          `Request failed with status ${status}`;
        const code = data?.error?.code || `HTTP_${status}`;

        return Promise.reject(new ApiError(message, status, code, data));
      }
    );
  }

  // ─── Token Refresh ─────────────────────────────────────────────────
  private async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._doRefreshToken();

    try {
      const result = await this.refreshPromise;
      this.processQueue(result);
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async _doRefreshToken(): Promise<boolean> {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        {},
        {
          headers: API_CONFIG.HEADERS,
          timeout: 10000,
          withCredentials: true,
        }
      );

      if (response.data?.success && response.data?.access_token) {
        this.accessToken = response.data.access_token;
        authEvents.tokenRefreshed();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private processQueue(success: boolean) {
    this.failedRequestsQueue.forEach(({ resolve, reject, config }) => {
      if (success) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
        resolve(this.client(config));
      } else {
        reject(new ApiError('Token refresh failed', 401, 'TOKEN_REFRESH_FAILED'));
      }
    });
    this.failedRequestsQueue = [];
  }

  // ─── Token Management ──────────────────────────────────────────────
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = null;
    this.failedRequestsQueue = [];
    this.inflightGets.clear();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ─── HTTP Methods ──────────────────────────────────────────────────
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Deduplicate identical in-flight GET requests
    const cacheKey = `${url}|${JSON.stringify(config?.params || {})}`;
    const inflight = this.inflightGets.get(cacheKey);
    if (inflight) return inflight as Promise<T>;

    const promise = this.client
      .get<T>(url, config)
      .then((r) => {
        this.inflightGets.delete(cacheKey);
        return r.data;
      })
      .catch((err) => {
        this.inflightGets.delete(cacheKey);
        throw err;
      });

    this.inflightGets.set(cacheKey, promise);
    return promise;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  async getWithParams<T>(url: string, params: Record<string, unknown>): Promise<T> {
    return this.get<T>(url, { params });
  }
}

// Singleton
export const apiClient = new ApiClient();
