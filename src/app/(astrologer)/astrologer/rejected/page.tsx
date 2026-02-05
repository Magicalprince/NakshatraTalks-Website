'use client';

/**
 * AstrologerRejectedScreen
 * Shown when astrologer application has been rejected
 */

import { useCallback } from 'react';
import Image from 'next/image';
import { XCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';

export default function AstrologerRejectedPage() {
  const { astrologer, logout } = useAuthStore();

  const handleContactEmail = useCallback(() => {
    window.open(
      'mailto:support@nakshatratalks.com?subject=Astrologer Application Review',
      '_blank'
    );
  }, []);

  const handleContactPhone = useCallback(() => {
    window.open('tel:+911234567890', '_blank');
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
      <div className="w-30 h-30 rounded-full bg-status-error/10 flex items-center justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-status-error/20 flex items-center justify-center">
          <XCircle className="w-16 h-16 text-status-error" />
        </div>
      </div>

      {/* Content */}
      <h1 className="text-3xl font-bold text-status-error mb-2 text-center font-lexend">
        Application Rejected
      </h1>
      <p className="text-lg text-text-dark mb-4 font-medium font-lexend">
        Hi {astrologer?.name || 'Astrologer'},
      </p>
      <p className="text-base text-text-secondary text-center mb-4 max-w-md leading-relaxed font-lexend">
        Unfortunately, your astrologer application has been rejected. This could
        be due to incomplete documentation or verification issues.
      </p>
      <p className="text-sm text-text-muted text-center mb-8 font-lexend">
        Please contact our support team for more information and to reapply.
      </p>

      {/* Contact Options */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={handleContactEmail}
          variant="outline"
          className="rounded-xl"
        >
          <Mail className="w-5 h-5 mr-2 text-primary" />
          Email Support
        </Button>

        <Button
          onClick={handleContactPhone}
          variant="outline"
          className="rounded-xl"
        >
          <Phone className="w-5 h-5 mr-2 text-primary" />
          Call Support
        </Button>
      </div>

      {/* Logout Link */}
      <button
        onClick={handleLogout}
        className="mt-2 text-status-error font-medium hover:underline font-lexend"
      >
        Logout
      </button>
    </div>
  );
}
