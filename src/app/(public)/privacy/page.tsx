import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | NakshatraTalks',
  description: 'NakshatraTalks privacy policy — how we collect, use, and protect your personal data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background-offWhite">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm font-lexend">
            <li><Link href="/" className="text-text-secondary hover:text-primary transition-colors">Home</Link></li>
            <li className="flex items-center gap-1.5"><ChevronRight className="h-3.5 w-3.5 text-text-muted" /><span className="text-text-primary font-medium">Privacy Policy</span></li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-text-primary font-lexend mb-2">Privacy Policy</h1>
        <p className="text-sm text-text-muted mb-8">Last updated: February 2026</p>

        <div className="bg-white rounded-xl shadow-web-sm p-6 sm:p-8 space-y-6 text-sm text-text-secondary leading-relaxed font-nunito">
          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide when creating an account, including your name,
              email address, phone number, and date of birth. We also collect usage data such as
              consultation history and payment information necessary to process transactions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">2. How We Use Your Information</h2>
            <p>
              Your information is used to provide astrology consultation services, process
              payments, improve our platform, and communicate important updates. We do not sell
              your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption, secure
              servers, and regular security audits to protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">4. Cookies &amp; Tracking</h2>
            <p>
              We use essential cookies for authentication and session management. Analytics
              cookies help us understand how you use the platform so we can improve your experience.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">5. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at
              any time by contacting us at{' '}
              <a href="mailto:support@nakshatratalks.com" className="text-primary hover:underline">
                support@nakshatratalks.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">6. Contact Us</h2>
            <p>
              For questions about this policy, contact us at{' '}
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
