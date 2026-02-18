'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui';

export function CTABanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-xl bg-gradient-primary py-14 px-6 sm:px-10 lg:px-16 text-center"
    >
      {/* Animated gradient glow border effect */}
      <div
        className="absolute -inset-[1px] rounded-xl opacity-50 blur-sm pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, #FFCF0D 0%, #2930A6 30%, #3B42B8 60%, #FFCF0D 100%)',
          backgroundSize: '300% 300%',
          animation: 'gradientShift 6s ease-in-out infinite',
        }}
      />

      {/* Inner background to sit on top of glow */}
      <div className="absolute inset-[1px] rounded-xl bg-gradient-primary pointer-events-none" />

      {/* Decorative floating abstract shapes */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/5 rounded-full animate-float pointer-events-none" />
      <div
        className="absolute -bottom-10 -left-10 w-44 h-44 bg-white/5 rounded-full animate-float pointer-events-none"
        style={{ animationDelay: '1s', animationDuration: '7s' }}
      />
      <div
        className="absolute top-1/2 -right-6 w-32 h-32 bg-secondary/10 rounded-full animate-float pointer-events-none"
        style={{ animationDelay: '2.5s', animationDuration: '9s' }}
      />
      <div
        className="absolute -top-6 left-[30%] w-24 h-24 bg-white/[0.03] rounded-full animate-float pointer-events-none"
        style={{ animationDelay: '3s', animationDuration: '10s' }}
      />

      {/* Floating sparkle icon */}
      <div className="absolute top-6 right-[15%] pointer-events-none">
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-5 w-5 text-secondary/40" />
        </motion.div>
      </div>
      <div className="absolute bottom-8 left-[12%] pointer-events-none">
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, -15, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <Star className="h-4 w-4 text-secondary/30" />
        </motion.div>
      </div>

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 mb-5"
        >
          <Sparkles className="h-3 w-3 text-secondary" />
          <span className="text-xs font-semibold text-secondary font-lexend tracking-wide">
            Start Today
          </span>
        </motion.div>

        <h2 className="text-2xl lg:text-3xl font-bold text-white font-lexend">
          Start Your Consultation Today
        </h2>
        <p className="mt-3 text-white/80 font-nunito text-md max-w-lg mx-auto">
          Talk to expert astrologers and get clarity on life, relationships, career, and more.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/browse-chat">
            <Button
              variant="secondary"
              size="md"
              className="gap-2 font-lexend transition-shadow duration-200 hover:shadow-lg"
            >
              <MessageCircle className="h-4 w-4" />
              Chat Now
            </Button>
          </Link>
          <Link href="/browse-call">
            <Button
              variant="outline"
              size="md"
              className="gap-2 font-lexend border-white text-white hover:bg-white hover:text-primary transition-shadow duration-200 hover:shadow-lg"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </Button>
          </Link>
        </div>
      </div>

    </motion.div>
  );
}
