/**
 * API Client - Web version
 * Axios client with request/response interceptors
 * Uses httpOnly cookies for refresh token (secure)
 * Uses memory for access token (not localStorage)
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './endpoints';

// Auth event types
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
      if (index > -1) {
        eventHandlers.splice(index, 1);
      }
    }
  }

  emit(event: AuthEventType, reason?: string) {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.forEach(handler => handler(reason));
    }
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

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  private failedRequestsQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
    config: InternalAxiosRequestConfig;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
      withCredentials: true, // Important: Send cookies with requests
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        // Add Authorization header if token exists
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors with token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          // Don't retry auth endpoints to avoid infinite loops
          const isAuthEndpoint = originalRequest.url?.includes('/auth/');
          if (isAuthEndpoint) {
            if (process.env.NODE_ENV === 'development') console.log('[ApiClient] 401 on auth endpoint, clearing tokens');
            this.clearAccessToken();
            authEvents.sessionInvalid('Auth endpoint returned 401');
            return Promise.reject(error);
          }

          // Mark this request as retried
          originalRequest._retry = true;

          // If already refreshing, queue this request
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedRequestsQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          // Start token refresh
          try {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.client(originalRequest);
            } else {
              // Refresh failed, logout required
              this.clearAccessToken();
              authEvents.logoutRequired('Token refresh failed');
              return Promise.reject(error);
            }
          } catch (refreshError) {
            if (process.env.NODE_ENV === 'development') console.error('[ApiClient] Token refresh error:', refreshError);
            this.clearAccessToken();
            authEvents.logoutRequired('Token refresh error');
            return Promise.reject(refreshError);
          }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          if (process.env.NODE_ENV === 'development') console.log('[ApiClient] 403 Forbidden - Session may be invalid');
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Refresh the access token using the refresh token (stored in httpOnly cookie)
   */
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

  /**
   * Internal token refresh implementation
   */
  private async _doRefreshToken(): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development') console.log('[ApiClient] Attempting token refresh...');

      // Make direct axios call to refresh endpoint
      // The refresh token is automatically sent via httpOnly cookie
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
        if (process.env.NODE_ENV === 'development') console.log('[ApiClient] Token refresh successful');
        this.accessToken = response.data.access_token;
        authEvents.tokenRefreshed();
        return true;
      }

      if (process.env.NODE_ENV === 'development') console.warn('[ApiClient] Token refresh response invalid:', response.data);
      return false;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (process.env.NODE_ENV === 'development') console.error('[ApiClient] Token refresh failed:', axiosError?.response?.status, axiosError?.message);
      return false;
    }
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(success: boolean): void {
    this.failedRequestsQueue.forEach(({ resolve, reject, config }) => {
      if (success) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
        resolve(this.client(config));
      } else {
        reject(new Error('Token refresh failed'));
      }
    });
    this.failedRequestsQueue = [];
  }

  /**
   * Set access token (in memory only - secure)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    this.accessToken = null;
    this.failedRequestsQueue = [];
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * GET request with query parameters
   */
  async getWithParams<T>(url: string, params: Record<string, unknown>): Promise<T> {
    return this.get<T>(url, { params });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
