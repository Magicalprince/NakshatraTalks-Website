import { Metadata } from 'next';
import { HomeContent } from '@/components/features/home/HomeContent';

export const metadata: Metadata = {
  title: 'NakshatraTalks - Connect with Expert Astrologers',
  description: 'Get personalized astrology consultations from expert astrologers. Chat or call with verified astrologers for horoscope readings, kundli matching, and life guidance.',
};

export default function HomePage() {
  return <HomeContent />;
}
