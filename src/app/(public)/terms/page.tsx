import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | NakshatraTalks',
  description: 'NakshatraTalks terms of service — rules and guidelines for using our platform.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background-offWhite">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm font-lexend">
            <li><Link href="/" className="text-text-secondary hover:text-primary transition-colors">Home</Link></li>
            <li className="flex items-center gap-1.5"><ChevronRight className="h-3.5 w-3.5 text-text-muted" /><span className="text-text-primary font-medium">Terms of Service</span></li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-text-primary font-lexend mb-2">Terms of Service</h1>
        <p className="text-sm text-text-muted mb-8">Last updated: February 2026</p>

        <div className="bg-white rounded-xl shadow-web-sm p-6 sm:p-8 space-y-6 text-sm text-text-secondary leading-relaxed font-nunito">
          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using NakshatraTalks, you agree to be bound by these Terms of
              Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">2. Services</h2>
            <p>
              NakshatraTalks provides a platform connecting users with Vedic astrologers for
              consultations via chat and call. Consultations are charged per minute at rates
              displayed on each astrologer&apos;s profile.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">3. User Accounts</h2>
            <p>
              You must provide accurate information when creating an account. You are responsible
              for maintaining the confidentiality of your credentials and for all activities
              under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">4. Payments &amp; Wallet</h2>
            <p>
              Users must maintain a sufficient wallet balance to initiate consultations.
              Payments are processed securely through Razorpay. Consultation charges are
              deducted from your wallet in real time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">5. Disclaimer</h2>
            <p>
              Astrology consultations are for guidance and entertainment purposes only.
              NakshatraTalks does not guarantee the accuracy of any astrological predictions
              and is not liable for decisions made based on consultations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">6. Contact</h2>
            <p>
              For questions regarding these terms, contact us at{' '}
              <a href="mailto:support@nakshatratalks.com" className="text-primary hover:underline">
                support@nakshatratalks.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
