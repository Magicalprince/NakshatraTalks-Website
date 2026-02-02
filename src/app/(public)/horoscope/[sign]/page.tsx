import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ZODIAC_SIGNS, ELEMENT_COLORS } from '@/lib/services/horoscope.service';
import { ZodiacCard } from '@/components/features/horoscope';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { HoroscopeClient } from './HoroscopeClient';

interface Props {
  params: Promise<{ sign: string }>;
}

// Generate static paths for all zodiac signs
export async function generateStaticParams() {
  return ZODIAC_SIGNS.map((sign) => ({
    sign: sign.id,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const sign = ZODIAC_SIGNS.find((s) => s.id === resolvedParams.sign);

  if (!sign) {
    return {
      title: 'Horoscope Not Found - NakshatraTalks',
    };
  }

  return {
    title: `${sign.name} Daily Horoscope - NakshatraTalks`,
    description: `Read today's ${sign.name} horoscope. Get daily predictions, lucky numbers, and insights for ${sign.name} (${sign.dateRange}).`,
    keywords: [
      `${sign.name} horoscope`,
      `${sign.name} daily horoscope`,
      `${sign.name} predictions`,
      'zodiac',
      'astrology',
    ],
    openGraph: {
      title: `${sign.name} Daily Horoscope - NakshatraTalks`,
      description: `Read today's ${sign.name} horoscope and predictions.`,
      type: 'article',
    },
  };
}

export default async function SignHoroscopePage({ params }: Props) {
  const resolvedParams = await params;
  const signId = resolvedParams.sign;
  const sign = ZODIAC_SIGNS.find((s) => s.id === signId);

  if (!sign) {
    notFound();
  }

  const colors = ELEMENT_COLORS[sign.element];
  const signIndex = ZODIAC_SIGNS.findIndex((s) => s.id === signId);
  const prevSign = ZODIAC_SIGNS[(signIndex - 1 + 12) % 12];
  const nextSign = ZODIAC_SIGNS[(signIndex + 1) % 12];

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className={`${colors.bg} py-8 px-4`}>
        <div className="container mx-auto max-w-2xl">
          <Link href="/horoscope" className="inline-flex items-center text-text-secondary mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            All Signs
          </Link>

          <ZodiacCard signId={signId} size="lg" />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Client-side horoscope fetching */}
        <HoroscopeClient signId={signId} />

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Link href={`/horoscope/${prevSign.id}`}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              {prevSign.name}
            </Button>
          </Link>
          <Link href={`/horoscope/${nextSign.id}`}>
            <Button variant="outline" size="sm">
              {nextSign.name}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* CTA */}
        <Card className="mt-8 p-6 text-center">
          <h3 className="font-semibold text-text-primary mb-2">
            Want a Detailed Reading?
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            Get personalized insights from our expert astrologers
          </p>
          <Link href="/browse-chat">
            <Button variant="primary" size="sm">
              Consult an Astrologer
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
