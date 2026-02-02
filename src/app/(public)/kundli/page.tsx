import { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileText, Heart, Users, Star } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free Kundli - Generate Birth Chart Online | NakshatraTalks',
  description: 'Generate your free Kundli (birth chart) online. Get detailed Vedic astrology analysis, planetary positions, doshas, and predictions based on your birth details.',
  keywords: ['kundli', 'birth chart', 'janampatri', 'vedic astrology', 'horoscope', 'free kundli'],
  openGraph: {
    title: 'Free Kundli - Generate Birth Chart Online | NakshatraTalks',
    description: 'Generate your free Kundli online with detailed Vedic astrology analysis.',
    type: 'website',
  },
};

export default function KundliPage() {
  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Free Kundli Generation
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-6">
            Generate your Kundli (Janampatri) instantly with detailed Vedic astrology
            analysis. Get insights into your life path, career, and relationships.
          </p>
          <Link href="/kundli/generate">
            <Button variant="secondary" size="lg">
              Generate Your Kundli
            </Button>
          </Link>
        </div>
      </div>

      {/* Services */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
          Our Kundli Services
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Kundli Generation */}
          <Link href="/kundli/generate">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Kundli Generation
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Generate your complete Kundli with planetary positions, houses,
                and detailed analysis.
              </p>
              <span className="text-primary font-medium text-sm">
                Generate Now →
              </span>
            </Card>
          </Link>

          {/* Kundli Matching */}
          <Link href="/kundli-matching">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Kundli Matching
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Check compatibility between two people for marriage with Gun Milan
                and detailed analysis.
              </p>
              <span className="text-primary font-medium text-sm">
                Match Now →
              </span>
            </Card>
          </Link>
        </div>
      </div>

      {/* What's Included */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
            What&apos;s Included in Your Kundli
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-5 text-center">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">
                Birth Chart (Lagna)
              </h4>
              <p className="text-sm text-text-secondary">
                Complete planetary positions at the time of your birth
              </p>
            </Card>

            <Card className="p-5 text-center">
              <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">
                Dasha Predictions
              </h4>
              <p className="text-sm text-text-secondary">
                Planetary periods and their effects on your life
              </p>
            </Card>

            <Card className="p-5 text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-text-primary mb-2">
                Dosha Analysis
              </h4>
              <p className="text-sm text-text-secondary">
                Mangal Dosha, Kaal Sarp Dosha and remedies
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="p-8 text-center bg-gradient-to-r from-primary/5 to-secondary/5">
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Need Expert Analysis?
          </h3>
          <p className="text-text-secondary mb-4">
            Get your Kundli analyzed by our expert Vedic astrologers for detailed insights
          </p>
          <Link href="/browse-chat">
            <Button variant="primary">Consult an Astrologer</Button>
          </Link>
        </Card>
      </div>

      {/* SEO Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-sm max-w-none">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            About Kundli (Janampatri)
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            A Kundli, also known as Janampatri or Birth Chart, is an astrological chart
            created based on the exact date, time, and place of birth. It shows the positions
            of celestial bodies at the moment of your birth and is the foundation of
            Vedic astrology predictions.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Our free Kundli generation service provides you with a detailed birth chart
            including Lagna chart, Moon chart, Navamsa chart, and comprehensive analysis
            of planetary positions and their effects on various aspects of your life.
          </p>
        </div>
      </div>
    </div>
  );
}
