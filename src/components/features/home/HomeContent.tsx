'use client';

import { motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { CategoryIcons } from './CategoryIcons';
import { CTABanner } from './CTABanner';
import { LiveSessionsCarousel } from './LiveSessionsCarousel';
import { TopRatedAstrologers } from './TopRatedAstrologers';

export function HomeContent() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <section className="bg-gradient-to-b from-secondary/30 to-white pt-4 pb-8 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl lg:text-4xl font-bold text-text-primary font-lexend mb-2">
              Connect with Expert Astrologers
            </h1>
            <p className="text-text-secondary font-lexend">
              Get guidance for life&apos;s important decisions
            </p>
          </motion.div>

          <SearchBar />
        </div>
      </section>

      {/* Category Icons */}
      <section className="py-6 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <CategoryIcons />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-4 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <CTABanner />
        </div>
      </section>

      {/* Live Sessions */}
      <section className="py-6 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <LiveSessionsCarousel />
        </div>
      </section>

      {/* Top Rated Astrologers */}
      <section className="py-6 px-4 lg:px-8 bg-background-offWhite">
        <div className="mx-auto max-w-7xl">
          <TopRatedAstrologers />
        </div>
      </section>

      {/* Additional sections can be added here */}
      <section className="py-12 px-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary font-lexend mb-4">
              Why Choose NakshatraTalks?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[
                {
                  title: 'Verified Astrologers',
                  description: 'All our astrologers are verified with years of experience',
                  icon: '✓',
                },
                {
                  title: 'Secure & Private',
                  description: 'Your conversations are completely confidential',
                  icon: '🔒',
                },
                {
                  title: '24/7 Available',
                  description: 'Connect with astrologers anytime, anywhere',
                  icon: '⏰',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-card"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-text-primary font-lexend mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary font-lexend">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
