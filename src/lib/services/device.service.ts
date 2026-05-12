/**
 * Device Service (Multi-Device Foundation)
 *
 * Wraps the backend's /devices/register and /devices/unregister endpoints
 * for both astrologer and user account types. Hides the userType branching
 * from call sites so AuthProvider can register/unregister with one call.
 *
 * The HMAC device_token returned by register is persisted to localStorage
 * via the device-id helper — callers do NOT need to handle the token directly.
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  getOrCreateDeviceId,
  getDeviceType,
  setDeviceToken,
  clearDeviceToken,
} from '@/lib/device-id';

type AccountType = 'user' | 'astrologer';

interface RegisterDeviceResponse {
  success: boolean;
  data?: { device_id: string; device_token: string };
}

/**
 * Register the current browser as a device with the backend. Persists the
 * issued HMAC device_token to localStorage. Idempotent — calling twice
 * with the same device_id upserts the row.
 *
 * Non-throwing: errors are logged and swallowed so login flow isn't blocked.
 */
export async function registerDevice(accountType: AccountType): Promise<void> {
  try {
    const device_id = getOrCreateDeviceId();
    if (!device_id) return; // SSR / pre-hydration

    const device_type = getDeviceType();
    const user_agent = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

    const endpoint =
      accountType === 'astrologer'
        ? API_ENDPOINTS.ASTROLOGERS.ME.DEVICE_REGISTER
        : API_ENDPOINTS.USER.DEVICE_REGISTER;

    const response = await apiClient.post<RegisterDeviceResponse>(endpoint, {
      device_id,
      device_type,
      user_agent,
    });

    const token = response?.data?.device_token;
    if (!token) {
      console.warn('[device.service] register: response missing device_token', response);
      return;
    }

    setDeviceToken(token);
  } catch (err) {
    console.warn('[device.service] register failed (non-blocking):', err);
  }
}

/**
 * Unregister the current device — typically called from logout. Removes the
 * device row server-side and clears the local token. Non-throwing.
 */
export async function unregisterDevice(accountType: AccountType): Promise<void> {
  try {
    const device_id = getOrCreateDeviceId();
    if (!device_id) return;

    const endpoint =
      accountType === 'astrologer'
        ? API_ENDPOINTS.ASTROLOGERS.ME.DEVICE_UNREGISTER
        : API_ENDPOINTS.USER.DEVICE_UNREGISTER;

    await apiClient.post(endpoint, { device_id });
  } catch (err) {
    console.warn('[device.service] unregister failed (non-blocking):', err);
  } finally {
    // Always clear the local token even if the backend call failed.
    clearDeviceToken();
  }
}
