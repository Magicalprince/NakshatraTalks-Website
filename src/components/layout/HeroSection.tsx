'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'gradient' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  primary: 'bg-primary text-white',
  gradient: 'bg-gradient-primary text-white',
  light: 'bg-background-light text-text-primary',
};

const sizeClasses = {
  sm: 'py-10 lg:py-14',
  md: 'py-14 lg:py-20',
  lg: 'py-20 lg:py-28',
};

export function HeroSection({
  title,
  subtitle,
  children,
  variant = 'gradient',
  size = 'md',
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        variantClasses[variant],
        sizeClasses[size]
      )}
    >
      {/* Decorative floating elements for gradient/primary variants */}
      {variant !== 'light' && (
        <>
          {/* Abstract floating circles */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div
              className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-white/20 blur-3xl animate-float"
            />
            <div
              className="absolute bottom-10 right-[15%] w-48 h-48 rounded-full bg-secondary/30 blur-2xl animate-float"
              style={{ animationDelay: '2s', animationDuration: '8s' }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/5 blur-3xl"
            />
            <div
              className="absolute top-[20%] right-[30%] w-32 h-32 rounded-full bg-secondary/20 blur-2xl animate-float"
              style={{ animationDelay: '4s', animationDuration: '10s' }}
            />
          </div>

          {/* Mesh gradient overlay via pseudo-style inline */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 20% 50%, rgba(255, 207, 13, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59, 66, 184, 0.2) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 40%)',
            }}
          />

          {/* Subtle dot grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Particle-like floating dots */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { top: '15%', left: '8%', size: 4, delay: '0s', duration: '7s' },
              { top: '70%', left: '20%', size: 3, delay: '1s', duration: '9s' },
              { top: '25%', left: '75%', size: 5, delay: '3s', duration: '8s' },
              { top: '60%', left: '85%', size: 3, delay: '2s', duration: '11s' },
              { top: '40%', left: '50%', size: 4, delay: '4s', duration: '10s' },
              { top: '80%', left: '40%', size: 3, delay: '1.5s', duration: '9s' },
              { top: '10%', left: '60%', size: 2, delay: '0.5s', duration: '12s' },
              { top: '50%', left: '15%', size: 3, delay: '3.5s', duration: '8s' },
            ].map((dot, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/20 animate-float"
                style={{
                  top: dot.top,
                  left: dot.left,
                  width: dot.size,
                  height: dot.size,
                  animationDelay: dot.delay,
                  animationDuration: dot.duration,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          className={cn(
            'text-3xl sm:text-4xl lg:text-5xl font-bold font-lexend tracking-tight',
            variant === 'light' ? 'text-text-primary' : 'text-white'
          )}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn(
              'mt-4 text-md sm:text-lg lg:text-xl font-nunito max-w-2xl mx-auto',
              variant === 'light' ? 'text-text-secondary' : 'text-white/80'
            )}
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
