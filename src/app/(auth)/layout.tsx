import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 bg-white rounded-xl p-2">
              <Image
                src="/images/logo.png"
                alt="NakshatraTalks"
                fill
                className="object-contain p-1"
              />
            </div>
            <span className="text-2xl font-bold text-white font-lexend">
              NakshatraTalks
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white font-lexend leading-tight">
            Connect with Expert<br />
            Astrologers Anytime
          </h1>
          <p className="text-lg text-white/80 font-lexend max-w-md">
            Get personalized guidance from verified astrologers through chat or call.
            Explore your horoscope, kundli, and more.
          </p>

          {/* Features list */}
          <div className="space-y-4 pt-4">
            {[
              'Verified & Experienced Astrologers',
              'Secure Payment & Chat',
              'Free Daily Horoscope',
              'Instant Kundli Generation',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white font-lexend">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/60 font-lexend">
          © 2024 NakshatraTalks. All rights reserved.
        </p>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
