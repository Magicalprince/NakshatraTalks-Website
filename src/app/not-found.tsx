'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-offWhite flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-primary font-lexend">404</span>
        </div>
        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-2">
          Page Not Found
        </h1>
        <p className="text-text-secondary mb-6">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-web-sm"
        >
          Go Home
        </Link>
      </motion.div>
    </div>
  );
}
