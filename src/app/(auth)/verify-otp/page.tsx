'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button, OTPInput } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';
import { MOCK_USER, MOCK_ASTROLOGER_USER, MOCK_ASTROLOGER_DATA } from '@/lib/mock/data';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '9876543210';
  const role = searchParams.get('role');
  const redirect = searchParams.get('redirect') || (role === 'astrologer' ? '/astrologer/dashboard' : '/');
  const { setAuth } = useAuthStore();

  // Get auth state directly
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated (after hydration)
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(redirect);
    }
  }, [isHydrated, isAuthenticated, router, redirect]);

  const handleOtpChange = (value: string) => {
    setOtp(value);
  };

  const handleVerify = async () => {
    setIsLoading(true);

    // Simulate brief loading
    await new Promise(resolve => setTimeout(resolve, 500));

    if (role === 'astrologer') {
      // Log in as astrologer with mock data
      setAuth({
        user: {
          ...MOCK_ASTROLOGER_USER,
          phone: phone,
        },
        astrologer: MOCK_ASTROLOGER_DATA,
        accessToken: 'mock-astrologer-token-12345',
        userType: 'astrologer',
      });
    } else {
      // Log in as regular user with mock data
      setAuth({
        user: {
          ...MOCK_USER,
          phone: phone,
        },
        accessToken: 'mock-access-token-12345',
        userType: 'user',
      });
    }

    // Navigate to home or redirect
    router.replace(redirect);
  };

  const formattedPhone = phone
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    : '+91 98765 43210';

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
          disabled={isLoading}
        />

        <p className="text-xs text-text-muted text-center font-lexend">
          Leave empty and click button for demo mode
        </p>

        <Button
          onClick={handleVerify}
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          {otp.length === 0 ? 'Skip & Continue (Demo)' : 'Verify & Continue'}
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
