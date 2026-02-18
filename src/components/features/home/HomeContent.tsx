'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Search, UserCheck, Headphones } from 'lucide-react';
import { HeroSection } from '@/components/layout/HeroSection';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui';
import { CategoryIcons } from './CategoryIcons';
import { LiveSessionsCarousel } from './LiveSessionsCarousel';
import { TopRatedAstrologers } from './TopRatedAstrologers';
import { CTABanner } from './CTABanner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const steps = [
  {
    icon: Search,
    title: 'Choose Your Astrologer',
    description: 'Browse expert astrologers by specialization, rating, and language.',
  },
  {
    icon: UserCheck,
    title: 'Connect Instantly',
    description: 'Start a chat or call session with your chosen astrologer.',
  },
  {
    icon: Headphones,
    title: 'Get Guidance',
    description: 'Receive personalized Vedic astrology insights and remedies.',
  },
];

export function HomeContent() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <HeroSection
        title="Connect with Expert Vedic Astrologers"
        subtitle="Get personalized guidance through chat or call. Explore your horoscope, kundli, and more."
        variant="gradient"
        size="lg"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/browse-chat">
            <Button variant="secondary" size="lg" className="gap-2 font-lexend">
              <MessageCircle className="h-4 w-4" />
              Chat with Astrologer
            </Button>
          </Link>
          <Link href="/browse-call">
            <Button variant="outline" size="lg" className="gap-2 font-lexend border-white text-white hover:bg-white hover:text-primary">
              <Phone className="h-4 w-4" />
              Call an Astrologer
            </Button>
          </Link>
        </div>
      </HeroSection>

      {/* Services Section */}
      <section className="py-12 lg:py-16 bg-white">
        <PageContainer>
          <motion.div variants={itemVariants}>
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary font-lexend">
                Our Services
              </h2>
              <p className="mt-2 text-text-secondary font-nunito text-md">
                Explore astrology services tailored for you
              </p>
            </div>
            <CategoryIcons />
          </motion.div>
        </PageContainer>
      </section>

      {/* How It Works Section */}
      <section className="py-12 lg:py-16 bg-background-offWhite">
        <PageContainer>
          <motion.div variants={itemVariants}>
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-text-primary font-lexend">
                How It Works
              </h2>
              <p className="mt-2 text-text-secondary font-nunito text-md">
                Get started in three simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-sm font-semibold text-primary font-lexend mb-1">
                    Step {index + 1}
                  </div>
                  <h3 className="text-md font-semibold text-text-primary font-lexend mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-secondary font-nunito">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </PageContainer>
      </section>

      {/* Top Rated Astrologers Section */}
      <section className="py-12 lg:py-16 bg-white">
        <PageContainer>
          <motion.div variants={itemVariants}>
            <TopRatedAstrologers />
          </motion.div>
        </PageContainer>
      </section>

      {/* Live Sessions Section */}
      <section className="py-12 lg:py-16 bg-background-offWhite">
        <PageContainer>
          <motion.div variants={itemVariants}>
            <LiveSessionsCarousel />
          </motion.div>
        </PageContainer>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16">
        <PageContainer>
          <motion.div variants={itemVariants}>
            <CTABanner />
          </motion.div>
        </PageContainer>
      </section>
    </motion.div>
  );
}
