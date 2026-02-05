'use client';

/**
 * Customer Support Page
 * Displays FAQs about the app and provides a report/contact option via email
 */

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageCircleQuestion,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';

// Support email address
const SUPPORT_EMAIL = 'astrotamil.in@gmail.com';

// FAQ Data
const FAQ_DATA = [
  {
    id: '1',
    question: 'How do I connect with an astrologer?',
    answer:
      'You can connect with an astrologer through chat or call. Browse available astrologers from the home screen, select one based on their expertise and ratings, then choose either "Chat" or "Call" to start your consultation. Make sure you have sufficient wallet balance before starting.',
  },
  {
    id: '2',
    question: 'How do I add money to my wallet?',
    answer:
      'Go to your wallet section from the sidebar or profile. Tap on "Add Money" or "Recharge" button, enter the amount you want to add, and complete the payment using your preferred payment method (UPI, Card, Net Banking, etc.).',
  },
  {
    id: '3',
    question: 'What if my call or chat gets disconnected?',
    answer:
      'If your session gets disconnected due to technical issues, the unused balance for that session will be automatically refunded to your wallet within 24 hours. You can check your transaction history in the wallet section.',
  },
  {
    id: '4',
    question: 'How accurate are the horoscope predictions?',
    answer:
      'Our daily horoscope predictions are prepared by experienced astrologers based on Vedic astrology principles. While astrology provides guidance based on planetary positions, remember that your actions and decisions also shape your destiny.',
  },
  {
    id: '5',
    question: 'Can I get a refund for my consultation?',
    answer:
      'Refunds are processed automatically for technical disconnections. For other concerns about your consultation experience, please use the Report option below to contact our support team with details of your issue.',
  },
  {
    id: '6',
    question: 'How do I check my consultation history?',
    answer:
      'You can view your past consultations by going to "Service History" from the sidebar menu. This shows all your previous chat and call sessions with astrologers along with duration and charges.',
  },
  {
    id: '7',
    question: 'Is my personal information safe?',
    answer:
      'Yes, we take your privacy seriously. All your personal information and consultation details are encrypted and securely stored. We never share your data with third parties. You can read our Privacy Policy for more details.',
  },
  {
    id: '8',
    question: 'How do I update my birth details?',
    answer:
      'Go to your Profile section and tap on "Edit Profile". You can update your birth date, time, and place which helps astrologers provide more accurate readings during your consultations.',
  },
];

interface FAQItemProps {
  item: (typeof FAQ_DATA)[0];
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQItem({ item, isExpanded, onToggle }: FAQItemProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 mr-2">
          <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="text-sm font-medium text-text-primary leading-tight">
            {item.question}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-text-secondary flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              <p className="text-sm text-text-secondary leading-relaxed ml-8">
                {item.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CustomerSupportPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  // Auth check
  const { isReady } = useRequireAuth();

  const handleFAQToggle = useCallback((id: string) => {
    setExpandedFAQ((prev) => (prev === id ? null : id));
  }, []);

  const handleReportViaEmail = useCallback(() => {
    const subject = encodeURIComponent('Support Request - NakshatraTalks');
    const body = encodeURIComponent(
      `Hello NakshatraTalks Support Team,\n\n` +
        `I would like to report an issue / request assistance with:\n\n` +
        `[Please describe your issue or concern here]\n\n` +
        `---\n` +
        `Device Info:\n` +
        `Platform: Web Browser\n` +
        `App Version: 1.0.0\n\n` +
        `Thank you.`
    );

    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  }, []);

  // Auth loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <div className="bg-white sticky top-0 z-10 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-40 h-6" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-text-primary font-lexend">
              Customer Support
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary rounded-2xl p-6 text-center mb-6"
        >
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircleQuestion className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white font-lexend">
            How can we help you?
          </h2>
          <p className="text-sm text-white/85 mt-2 font-lexend">
            Browse through our frequently asked questions below or contact us
            directly for assistance.
          </p>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3 px-1 font-lexend">
            Frequently Asked Questions
          </h3>
          <div>
            {FAQ_DATA.map((faq) => (
              <FAQItem
                key={faq.id}
                item={faq}
                isExpanded={expandedFAQ === faq.id}
                onToggle={() => handleFAQToggle(faq.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Report Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3 px-1 font-lexend">
            Still Need Help?
          </h3>
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <h4 className="text-base font-semibold text-text-primary font-lexend">
              Report an Issue
            </h4>
            <p className="text-sm text-text-secondary mt-2 font-lexend">
              If you&apos;re facing any technical issues, payment problems, or
              have concerns about your consultation experience, you can report
              it to us via email. Our support team will get back to you within
              24-48 hours.
            </p>

            <div className="bg-primary/5 rounded-lg p-3 mt-4 text-left">
              <p className="text-xs font-medium text-primary font-lexend">
                When reporting an issue, please include:
              </p>
              <ul className="text-xs text-text-secondary mt-2 space-y-1 font-lexend">
                <li>• Your registered mobile number</li>
                <li>• Date and time of the issue</li>
                <li>• Screenshots if applicable</li>
                <li>• Detailed description of the problem</li>
              </ul>
            </div>

            <Button
              onClick={handleReportViaEmail}
              className="w-full mt-5"
              size="lg"
            >
              <Mail className="w-5 h-5 mr-2" />
              Report via Email
            </Button>

            <p className="text-xs text-text-muted mt-3 font-lexend">
              {SUPPORT_EMAIL}
            </p>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <p className="text-xs text-text-muted text-center font-lexend">
          Our support team is available Monday to Saturday, 9:00 AM to 6:00 PM
          IST.
        </p>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="h-24" />
    </div>
  );
}
