'use client';

/**
 * AstrologerInactiveScreen
 * Shown when astrologer account has been deactivated
 */

import { useCallback } from 'react';
import Image from 'next/image';
import { AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/lib/services/auth.service';
import { useUIStore } from '@/stores/ui-store';

export default function AstrologerInactivePage() {
  const { astrologer, logout, setAuth } = useAuthStore();
  const { addToast } = useUIStore();

  const handleRefresh = useCallback(async () => {
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        // Check if status has changed
        if (response.data.astrologer?.status === 'approved') {
          setAuth({
            user: response.data.user,
            astrologer: response.data.astrologer,
            accessToken: '', // Will use existing token
            userType: 'astrologer',
          });
          addToast({
            type: 'success',
            title: 'Account Reactivated!',
            message: 'Your account has been reactivated. Welcome back!',
          });
          window.location.href = '/astrologer/dashboard';
        } else {
          addToast({
            type: 'info',
            title: 'Still Inactive',
            message: 'Your account is still inactive. Please contact support.',
          });
        }
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to check status. Please try again.',
      });
    }
  }, [setAuth, addToast]);

  const handleContactEmail = useCallback(() => {
    window.open(
      'mailto:support@nakshatratalks.com?subject=Account Reactivation Request',
      '_blank'
    );
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/login';
  }, [logout]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8">
      {/* Logo */}
      <div className="relative w-48 h-12 mb-12">
        <Image
          src="/images/logo.png"
          alt="NakshatraTalks"
          fill
          className="object-contain"
        />
      </div>

      {/* Icon */}
      <div className="w-30 h-30 rounded-full bg-amber-500/10 flex items-center justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center">
          <AlertCircle className="w-16 h-16 text-amber-500" />
        </div>
      </div>

      {/* Content */}
      <h1 className="text-3xl font-bold text-amber-500 mb-2 text-center font-lexend">
        Account Inactive
      </h1>
      <p className="text-lg text-text-dark mb-4 font-medium font-lexend">
        Hi {astrologer?.name || 'Astrologer'},
      </p>
      <p className="text-base text-text-secondary text-center mb-4 max-w-md leading-relaxed font-lexend">
        Your astrologer account has been temporarily deactivated. This could be
        due to policy violations or your own request.
      </p>
      <p className="text-sm text-text-muted text-center mb-8 font-lexend">
        To reactivate your account, please contact our support team.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <Button onClick={handleContactEmail} className="rounded-full px-8">
          <Mail className="w-5 h-5 mr-2" />
          Contact Support
        </Button>

        <Button
          onClick={handleRefresh}
          variant="outline"
          className="rounded-full px-8"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Check Status
        </Button>
      </div>

      {/* Logout Link */}
      <button
        onClick={handleLogout}
        className="mt-6 text-status-error font-medium hover:underline font-lexend"
      >
        Logout
      </button>
    </div>
  );
}
