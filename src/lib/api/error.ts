/**
 * Error-extraction helpers for catch blocks.
 *
 * The axios interceptor in client.ts already converts backend responses into
 * ApiError, which carries the server's `error.message` from the standard
 * envelope { success, error: { code, message, details } }. This helper covers
 * the consumer side: turn whatever lands in a catch block into a string that's
 * safe to render in a toast or set into local error state.
 *
 * Without this, code like `setError(err.message)` renders `[object Object]`
 * when the throw site is a plain `throw { message: '...' }` or a non-Error
 * value, and `setError(err instanceof Error ? err.message : 'fallback')`
 * boilerplate ends up duplicated across every hook.
 */

import { ApiError } from './client';

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}

export function getErrorCode(error: unknown): string | null {
  if (error instanceof ApiError) return error.code ?? null;
  return null;
}
