import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy | NakshatraTalks',
  description: 'NakshatraTalks refund policy — guidelines for requesting refunds on consultations.',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background-offWhite">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm font-lexend">
            <li><Link href="/" className="text-text-secondary hover:text-primary transition-colors">Home</Link></li>
            <li className="flex items-center gap-1.5"><ChevronRight className="h-3.5 w-3.5 text-text-muted" /><span className="text-text-primary font-medium">Refund Policy</span></li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-text-primary font-lexend mb-2">Refund Policy</h1>
        <p className="text-sm text-text-muted mb-8">Last updated: February 2026</p>

        <div className="bg-white rounded-xl shadow-web-sm p-6 sm:p-8 space-y-6 text-sm text-text-secondary leading-relaxed font-nunito">
          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">1. Wallet Recharges</h2>
            <p>
              Wallet recharges are non-refundable once credited to your account. Please ensure
              you intend to use the platform before adding funds.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">2. Consultation Refunds</h2>
            <p>
              If a consultation is disrupted due to a technical issue on our end (e.g.,
              connection failure, platform downtime), you may request a full refund for that
              session. Refund requests must be submitted within 24 hours of the affected session.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">3. How to Request a Refund</h2>
            <p>
              To request a refund, email us at{' '}
              <a href="mailto:support@nakshatratalks.com" className="text-primary hover:underline">
                support@nakshatratalks.com
              </a>{' '}
              with your session ID, the date of the consultation, and a brief description of the
              issue. Our team will review and respond within 3–5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">4. Refund Processing</h2>
            <p>
              Approved refunds will be credited back to your NakshatraTalks wallet. In cases
              of account closure, refunds may be processed to your original payment method,
              subject to payment gateway policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">5. Non-Refundable Scenarios</h2>
            <p>
              Refunds will not be issued for dissatisfaction with astrological advice, user-initiated
              disconnections, or sessions that completed successfully without technical issues.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary font-lexend mb-3">6. Contact</h2>
            <p>
              For refund-related inquiries, contact us at{' '}
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
