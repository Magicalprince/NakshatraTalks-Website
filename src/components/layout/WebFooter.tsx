import Link from 'next/link';
import Image from 'next/image';
import { Mail, Star, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const services = [
  { href: '/browse-chat', label: 'Chat with Astrologer' },
  { href: '/browse-call', label: 'Call with Astrologer' },
  { href: '/horoscope', label: 'Daily Horoscope' },
  { href: '/kundli', label: 'Free Kundli' },
  { href: '/kundli-matching', label: 'Kundli Matching' },
];

const resources = [
  { href: '/kundli', label: 'Kundli Generation' },
  { href: '/kundli-matching', label: 'Kundli Matching' },
  { href: '/horoscope', label: 'Horoscope' },
];

const legal = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/refund', label: 'Refund Policy' },
];

const socialLinks = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
];

export function WebFooter() {
  return (
    <footer className="relative bg-gray-900 text-white mt-12">
      {/* Gradient top border */}
      <div
        className="h-1"
        style={{
          background: 'linear-gradient(90deg, #2930A6 0%, #3B42B8 40%, #FFCF0D 100%)',
        }}
      />

      {/* Subtle gradient background overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            'linear-gradient(180deg, rgba(17, 17, 30, 0) 0%, rgba(10, 10, 20, 0.6) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.png"
                alt="NakshatraTalks"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h3 className="text-xl font-bold font-lexend">NakshatraTalks</h3>
            </div>
            <p className="text-gray-400 text-sm font-nunito leading-relaxed max-w-sm mb-6">
              Connect with expert Vedic astrologers for personalized consultations
              and guidance. Get clarity on life, relationships, career, and spiritual growth.
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-6">
              <a
                href="mailto:support@nakshatratalks.com"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group font-nunito"
              >
                <Mail className="h-4 w-4 text-secondary group-hover:text-secondary-light transition-colors" />
                support@nakshatratalks.com
              </a>
            </div>

            {/* Social media icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-primary/30 hover:border-primary/50 transition-all duration-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services column */}
          <div>
            <h4 className="font-semibold font-lexend mb-4 text-sm text-white/90 uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-2.5">
              {services.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-all duration-200 font-nunito inline-flex items-center gap-1 hover:translate-x-1 transform"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources column */}
          <div>
            <h4 className="font-semibold font-lexend mb-4 text-sm text-white/90 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-all duration-200 font-nunito inline-flex items-center gap-1 hover:translate-x-1 transform"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Legal nested under resources on larger screens */}
            <h4 className="font-semibold font-lexend mb-4 mt-8 text-sm text-white/90 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-all duration-200 font-nunito inline-flex items-center gap-1 hover:translate-x-1 transform"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Download App column */}
          <div>
            <h4 className="font-semibold font-lexend mb-4 text-sm text-white/90 uppercase tracking-wider">
              Download App
            </h4>
            <p className="text-sm text-gray-400 font-nunito mb-4 leading-relaxed">
              Get the NakshatraTalks app for a seamless astrology experience on the go.
            </p>

            {/* App store placeholder badges */}
            <div className="flex flex-col gap-3">
              <a
                href="#"
                className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
              >
                <svg
                  className="h-6 w-6 text-gray-300 group-hover:text-white transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none font-nunito">
                    Download on the
                  </div>
                  <div className="text-sm font-semibold text-white font-lexend">
                    App Store
                  </div>
                </div>
              </a>

              <a
                href="#"
                className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
              >
                <svg
                  className="h-6 w-6 text-gray-300 group-hover:text-white transition-colors"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.61-.92zm10.893 9.476l2.302-2.302 -8.982-5.226 6.68 7.528zm2.302 1.42l-2.302-2.302-6.68 7.528 8.982-5.226zm1.063-.61l2.963-1.725c.582-.339.582-1.41 0-1.75l-2.963-1.724-2.6 2.6 2.6 2.6z" />
                </svg>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none font-nunito">
                    Get it on
                  </div>
                  <div className="text-sm font-semibold text-white font-lexend">
                    Google Play
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Divider with sparkle */}
        <div className="flex items-center gap-4 mt-12 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          <Star className="h-4 w-4 text-secondary/60" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
          <p className="text-sm text-gray-500 font-nunito">
            &copy; {new Date().getFullYear()} NakshatraTalks. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 font-nunito">
            Crafted with love for seekers of cosmic wisdom
          </p>
        </div>
      </div>
    </footer>
  );
}
