'use client';

/**
 * AstrologerPendingScreen
 * Shown when astrologer account is pending approval
 */

import { useCallback } from 'react';
import Image from 'next/image';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/lib/services/auth.service';
import { useUIStore } from '@/stores/ui-store';

export default function AstrologerPendingPage() {
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
            title: 'Account Approved!',
            message: 'Your account has been approved. Welcome to NakshatraTalks!',
          });
          window.location.href = '/astrologer/dashboard';
        } else {
          addToast({
            type: 'info',
            title: 'Still Pending',
            message: 'Your account is still under review. Please check back later.',
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
      <div className="w-30 h-30 rounded-full bg-secondary/10 flex items-center justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center">
          <Clock className="w-16 h-16 text-secondary" />
        </div>
      </div>

      {/* Content */}
      <h1 className="text-3xl font-bold text-primary mb-2 text-center font-lexend">
        Pending Approval
      </h1>
      <p className="text-lg text-text-dark mb-4 font-medium font-lexend">
        Hi {astrologer?.name || 'Astrologer'},
      </p>
      <p className="text-base text-text-secondary text-center mb-4 max-w-md leading-relaxed font-lexend">
        Your astrologer application is currently under review. Our team will
        verify your details and approve your account within 24-48 hours.
      </p>
      <p className="text-sm text-text-muted text-center mb-8 font-lexend">
        You will receive a notification once your account is approved.
      </p>

      {/* Refresh Button */}
      <Button onClick={handleRefresh} className="rounded-full px-8">
        <RefreshCw className="w-5 h-5 mr-2" />
        Check Status
      </Button>

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
