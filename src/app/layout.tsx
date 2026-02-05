import type { Metadata, Viewport } from 'next';
import { Lexend, Nunito, Poppins } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

// Configure fonts
const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '700', '800'],
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'NakshatraTalks - Connect with Expert Astrologers',
    template: '%s | NakshatraTalks',
  },
  description: 'Get personalized astrology consultations from expert astrologers. Chat or call with verified astrologers for horoscope readings, kundli matching, and life guidance.',
  keywords: [
    'astrology',
    'astrologer',
    'horoscope',
    'kundli',
    'kundli matching',
    'vedic astrology',
    'online astrology',
    'astrology consultation',
    'birth chart',
    'zodiac',
    'jyotish',
  ],
  authors: [{ name: 'NakshatraTalks' }],
  creator: 'NakshatraTalks',
  publisher: 'NakshatraTalks',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nakshatratalks.com'),
  openGraph: {
    title: 'NakshatraTalks - Connect with Expert Astrologers',
    description: 'Get personalized astrology consultations from expert astrologers.',
    url: 'https://nakshatratalks.com',
    siteName: 'NakshatraTalks',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NakshatraTalks - Connect with Expert Astrologers',
    description: 'Get personalized astrology consultations from expert astrologers.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#2930A6' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${nunito.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="font-lexend antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
