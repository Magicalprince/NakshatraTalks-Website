/**
 * Device Identity Utility (Multi-Device Foundation)
 *
 * Mirrors the mobile-side device-id utility for the website. Provides:
 *   - getOrCreateDeviceId(): a stable UUID per browser, generated once and
 *     stored in localStorage forever. Survives logout/login. Cleared
 *     localStorage = new device id (treated as a new install).
 *   - getDeviceToken() / setDeviceToken() / clearDeviceToken(): manages the
 *     HMAC device_token issued by the backend at register-time. Stored in
 *     localStorage (not sessionStorage) so it survives reloads.
 *   - getDeviceType(): always 'web'.
 *
 * SSR-safe: every reader checks `typeof window` and returns null/empty for
 * server-rendered code paths.
 */

const DEVICE_ID_KEY = 'nakshatratalks.device_id';
const DEVICE_TOKEN_KEY = 'nakshatratalks.device_token';

export type DeviceType = 'web';

export function getDeviceType(): DeviceType {
  return 'web';
}

/**
 * Returns the persistent device id, generating one on first call. The UUID
 * is stored under DEVICE_ID_KEY in localStorage and never rotated within a
 * browser's localStorage lifetime.
 *
 * Returns empty string in SSR contexts.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/**
 * Returns the HMAC device token issued by the backend at /devices/register
 * time, or null if not yet registered.
 */
export function getDeviceToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEVICE_TOKEN_KEY);
}

export function setDeviceToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEVICE_TOKEN_KEY, token);
}

export function clearDeviceToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEVICE_TOKEN_KEY);
}
