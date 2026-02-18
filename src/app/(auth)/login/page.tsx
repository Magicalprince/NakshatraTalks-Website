'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Star } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/auth-store';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  // Get auth state directly
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated (after hydration)
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace(redirect);
    }
  }, [isHydrated, isAuthenticated, router, redirect]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate brief loading
    await new Promise(resolve => setTimeout(resolve, 300));

    // Validate phone number
    const phoneToUse = phone || (process.env.NODE_ENV === 'development' ? '9876543210' : '');
    if (!phoneToUse || phoneToUse.length < 10) {
      setIsLoading(false);
      return;
    }
    router.push(`/verify-otp?phone=${phoneToUse}&redirect=${encodeURIComponent(redirect)}`);
  };

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

      <div className="text-center lg:text-left mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary font-lexend">
          Welcome Back
        </h1>
        <p className="mt-2 text-text-secondary font-lexend">
          Enter your phone number to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2 font-lexend">
            Phone Number
          </label>
          <div className="flex gap-2">
            <div className="flex items-center justify-center w-20 h-12 rounded-md border border-gray-300 bg-background-offWhite text-text-secondary font-lexend">
              +91
            </div>
            <Input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Enter number (optional)"
              leftIcon={<Phone className="h-5 w-5" />}
              disabled={isLoading}
              className="flex-1"
              autoComplete="tel"
              inputMode="numeric"
            />
          </div>
          <p className="text-xs text-text-muted mt-1 font-lexend">
            Leave empty for demo mode
          </p>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-5 w-5" />}
        >
          Continue
        </Button>

        <p className="text-center text-sm text-text-secondary font-lexend">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>

        {/* Astrologer Login */}
        <div className="text-center pt-4 border-t border-gray-100">
          <Link
            href="/verify-otp?phone=9876543210&role=astrologer&redirect=/astrologer/dashboard"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary font-lexend transition-colors"
          >
            <Star className="h-4 w-4" />
            Login as Astrologer (Demo)
          </Link>
        </div>
      </form>

      {/* Additional info for mobile */}
      <div className="lg:hidden mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-text-primary font-lexend mb-4">
          Why NakshatraTalks?
        </h3>
        <div className="space-y-3">
          {[
            'Verified & Experienced Astrologers',
            'Secure Payment & Chat',
            'Free Daily Horoscope',
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg className="h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-text-secondary font-lexend">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
