'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button, OTPInput } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/lib/services/auth.service';
import { useUIStore } from '@/stores/ui-store';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const redirect = searchParams.get('redirect') || '/';
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  // Redirect if no phone number
  useEffect(() => {
    if (!phone) {
      router.replace('/login');
    }
  }, [phone, router]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Redirect if already authenticated (after hydration)
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(redirect);
    }
  }, [isHydrated, isAuthenticated, router, redirect]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError('');
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit OTP sent to your phone');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.verifyOtp({ phone, otp });

      if (response.success && response.data) {
        const { user, astrologer, access_token, userType } = response.data;

        setAuth({
          user,
          astrologer: astrologer || undefined,
          accessToken: access_token,
          userType,
        });

        addToast({
          type: 'success',
          title: 'Welcome!',
          message: `Logged in as ${user.name || 'User'}`,
        });

        // Redirect astrologers to their dashboard by default
        const finalRedirect = userType === 'astrologer' && redirect === '/'
          ? '/astrologer/dashboard'
          : redirect;

        router.replace(finalRedirect);
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await authService.sendOtp({ phone });
      if (response.success) {
        setResendTimer(30);
        addToast({ type: 'success', title: 'OTP Sent', message: 'A new OTP has been sent to your phone' });
      } else {
        addToast({ type: 'error', title: 'Error', message: response.message || 'Failed to resend OTP' });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to resend OTP. Please try again.' });
    }
  };

  const formattedPhone = phone
    ? `+91 ${authService.formatPhone(phone)}`
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Mobile logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-12 w-12">
            <Image
              src="/images/logo.png"
              alt="NakshatraTalks"
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-primary font-lexend">
            NakshatraTalks
          </span>
        </Link>
      </div>

      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="font-lexend">Back</span>
      </button>

      <div className="text-center lg:text-left mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-lexend">
          Verify OTP
        </h1>
        <p className="mt-2 text-text-secondary font-lexend">
          We&apos;ve sent a verification code to
        </p>
        <p className="mt-1 text-text-primary font-medium font-lexend">
          {formattedPhone}
        </p>
      </div>

      <div className="space-y-6">
        <OTPInput
          length={6}
          value={otp}
          onChange={handleOtpChange}
          onComplete={handleVerify}
          disabled={isLoading}
        />

        {error && (
          <p className="text-xs text-status-error text-center font-lexend">{error}</p>
        )}

        {/* Resend OTP */}
        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-text-muted font-lexend">
              Resend OTP in <span className="font-semibold text-text-primary">{resendTimer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-sm text-primary font-semibold font-lexend hover:underline transition-colors"
            >
              Resend OTP
            </button>
          )}
        </div>

        <Button
          onClick={handleVerify}
          fullWidth
          size="lg"
          isLoading={isLoading}
          disabled={otp.length < 6}
        >
          Verify & Continue
        </Button>

        {/* Change number */}
        <div className="text-center">
          <Link
            href={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="text-sm text-text-secondary hover:text-text-primary font-lexend"
          >
            Wrong number?{' '}
            <span className="text-primary font-medium">Change</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
