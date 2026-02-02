'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button, OTPInput } from '@/components/ui';
import { authService } from '@/lib/services/auth.service';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/stores/ui-store';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const redirect = searchParams.get('redirect') || '/';
  const toast = useToast();
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Redirect if no phone number
  useEffect(() => {
    if (!phone) {
      router.replace('/login');
    }
  }, [phone, router]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError('');
  };

  const handleVerify = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp;
    setError('');

    if (!otpToVerify || otpToVerify.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyOtp({
        phone,
        otp: otpToVerify,
      });

      if (response.success && response.data) {
        // Set auth state
        setAuth({
          user: response.data.user,
          astrologer: response.data.astrologer,
          accessToken: response.data.access_token,
          userType: response.data.userType,
        });

        toast.success('Welcome!', 'You have successfully logged in');

        // Redirect based on user type
        if (response.data.userType === 'astrologer') {
          router.replace('/dashboard');
        } else {
          router.replace(redirect);
        }
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Verify OTP error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');

    try {
      const response = await authService.sendOtp({ phone });

      if (response.success) {
        toast.success('OTP Sent', 'A new OTP has been sent to your phone');
        setResendTimer(30);
        setCanResend(false);
        setOtp('');
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (err: unknown) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formattedPhone = phone
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
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
          error={error}
          disabled={isLoading}
        />

        <Button
          onClick={() => handleVerify()}
          fullWidth
          size="lg"
          isLoading={isLoading}
          disabled={otp.length !== 6}
        >
          Verify & Continue
        </Button>

        {/* Resend OTP */}
        <div className="text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium font-lexend disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend OTP
                </>
              )}
            </button>
          ) : (
            <p className="text-text-secondary font-lexend">
              Resend OTP in{' '}
              <span className="text-primary font-medium">{resendTimer}s</span>
            </p>
          )}
        </div>

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
