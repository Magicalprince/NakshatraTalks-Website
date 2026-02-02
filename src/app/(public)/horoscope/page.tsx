import { Metadata } from 'next';
import { ZodiacSelector } from '@/components/features/horoscope';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Sparkles, Star, Moon } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Daily Horoscope - NakshatraTalks',
  description: 'Get your daily horoscope predictions for all zodiac signs. Read accurate daily, weekly, and monthly horoscopes from expert astrologers.',
  keywords: ['horoscope', 'daily horoscope', 'zodiac', 'astrology', 'predictions'],
  openGraph: {
    title: 'Daily Horoscope - NakshatraTalks',
    description: 'Get your daily horoscope predictions for all zodiac signs.',
    type: 'website',
  },
};

export default function HoroscopePage() {
  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Daily Horoscope
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Discover what the stars have in store for you. Select your zodiac sign
            to read your daily horoscope prediction.
          </p>
        </div>
      </div>

      {/* Zodiac Selector */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
          Select Your Zodiac Sign
        </h2>
        <ZodiacSelector linkMode />
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Daily Predictions</h3>
            <p className="text-sm text-text-secondary">
              Get accurate daily horoscope predictions based on planetary movements
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Moon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Lucky Numbers</h3>
            <p className="text-sm text-text-secondary">
              Discover your lucky numbers and colors for the day
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Expert Insights</h3>
            <p className="text-sm text-text-secondary">
              Predictions from experienced Vedic astrologers
            </p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 text-center bg-gradient-to-r from-primary/5 to-secondary/5">
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Want a Personalized Reading?
          </h3>
          <p className="text-text-secondary mb-4">
            Connect with our expert astrologers for detailed horoscope analysis
          </p>
          <Link href="/browse-chat">
            <Button variant="primary">Talk to an Astrologer</Button>
          </Link>
        </Card>
      </div>

      {/* SEO Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-sm max-w-none">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            About Our Daily Horoscopes
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            NakshatraTalks provides daily horoscope predictions for all 12 zodiac signs.
            Our horoscopes are based on Vedic astrology principles and take into account
            the current planetary transits and their effects on each sign.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Whether you&apos;re an Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra,
            Scorpio, Sagittarius, Capricorn, Aquarius, or Pisces, our expert astrologers
            provide insights to help you navigate your day with confidence.
          </p>
        </div>
      </div>
    </div>
  );
}
