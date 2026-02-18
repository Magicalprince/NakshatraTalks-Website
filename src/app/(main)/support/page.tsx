'use client';

/**
 * Customer Support Page
 * Enhanced 2026 design with FAQ search, category filtering, smooth spring
 * animations, gradient welcome banner, proper report form, and accessibility.
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Mail,
  MessageCircleQuestion,
  AlertTriangle,
  HelpCircle,
  Search,
  X,
  Send,
  Wallet,
  Shield,
  Phone,
  User,
  Star,
  Sparkles,
} from 'lucide-react';
import { Button, Card, Skeleton } from '@/components/ui';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

// ─── Support email address ──────────────────────────────────────────────────

const SUPPORT_EMAIL = 'astrotamil.in@gmail.com';

// ─── FAQ Categories ─────────────────────────────────────────────────────────

const FAQ_CATEGORIES = [
  { key: 'all', label: 'All', icon: HelpCircle },
  { key: 'getting-started', label: 'Getting Started', icon: Star },
  { key: 'payments', label: 'Payments', icon: Wallet },
  { key: 'consultations', label: 'Consultations', icon: Phone },
  { key: 'account', label: 'Account', icon: User },
  { key: 'privacy', label: 'Privacy', icon: Shield },
] as const;

type FAQCategory = (typeof FAQ_CATEGORIES)[number]['key'];

// ─── FAQ Data ───────────────────────────────────────────────────────────────

const FAQ_DATA = [
  {
    id: '1',
    category: 'getting-started' as FAQCategory,
    question: 'How do I connect with an astrologer?',
    answer:
      'You can connect with an astrologer through chat or call. Browse available astrologers from the home screen, select one based on their expertise and ratings, then choose either "Chat" or "Call" to start your consultation. Make sure you have sufficient wallet balance before starting.',
  },
  {
    id: '2',
    category: 'payments' as FAQCategory,
    question: 'How do I add money to my wallet?',
    answer:
      'Go to your wallet section from the sidebar or profile. Tap on "Add Money" or "Recharge" button, enter the amount you want to add, and complete the payment using your preferred payment method (UPI, Card, Net Banking, etc.).',
  },
  {
    id: '3',
    category: 'consultations' as FAQCategory,
    question: 'What if my call or chat gets disconnected?',
    answer:
      'If your session gets disconnected due to technical issues, the unused balance for that session will be automatically refunded to your wallet within 24 hours. You can check your transaction history in the wallet section.',
  },
  {
    id: '4',
    category: 'consultations' as FAQCategory,
    question: 'How accurate are the horoscope predictions?',
    answer:
      'Our daily horoscope predictions are prepared by experienced astrologers based on Vedic astrology principles. While astrology provides guidance based on planetary positions, remember that your actions and decisions also shape your destiny.',
  },
  {
    id: '5',
    category: 'payments' as FAQCategory,
    question: 'Can I get a refund for my consultation?',
    answer:
      'Refunds are processed automatically for technical disconnections. For other concerns about your consultation experience, please use the Report option below to contact our support team with details of your issue.',
  },
  {
    id: '6',
    category: 'getting-started' as FAQCategory,
    question: 'How do I check my consultation history?',
    answer:
      'You can view your past consultations by going to "Service History" from the sidebar menu. This shows all your previous chat and call sessions with astrologers along with duration and charges.',
  },
  {
    id: '7',
    category: 'privacy' as FAQCategory,
    question: 'Is my personal information safe?',
    answer:
      'Yes, we take your privacy seriously. All your personal information and consultation details are encrypted and securely stored. We never share your data with third parties. You can read our Privacy Policy for more details.',
  },
  {
    id: '8',
    category: 'account' as FAQCategory,
    question: 'How do I update my birth details?',
    answer:
      'Go to your Profile section and tap on "Edit Profile". You can update your birth date, time, and place which helps astrologers provide more accurate readings during your consultations.',
  },
];

// ─── FAQ Item Component ─────────────────────────────────────────────────────

interface FAQItemProps {
  item: (typeof FAQ_DATA)[0];
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

function FAQItem({ item, isExpanded, onToggle, index }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white rounded-xl border border-gray-100 shadow-web-sm hover:shadow-web-md transition-shadow duration-200 mb-3 overflow-hidden"
    >
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50/50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={`faq-answer-${item.id}`}
        id={`faq-question-${item.id}`}
      >
        <div className="flex items-center gap-3 flex-1 mr-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
            isExpanded ? 'bg-primary/10' : 'bg-gray-50'
          }`}>
            <HelpCircle className={`w-4 h-4 transition-colors duration-200 ${
              isExpanded ? 'text-primary' : 'text-text-muted'
            }`} aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-text-primary leading-snug font-lexend">
            {item.question}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="flex-shrink-0"
        >
          <ChevronDown className={`w-5 h-5 transition-colors duration-200 ${
            isExpanded ? 'text-primary' : 'text-text-muted'
          }`} aria-hidden="true" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`faq-answer-${item.id}`}
            role="region"
            aria-labelledby={`faq-question-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, opacity: { duration: 0.2 } }}
          >
            <div className="px-4 pb-4">
              <div className="ml-11 pl-0 border-l-2 border-primary/15 pl-4">
                <p className="text-sm text-text-secondary leading-relaxed font-nunito">
                  {item.answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Report Form Component ──────────────────────────────────────────────────

function ReportForm() {
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const issueTypes = [
    'Technical Issue',
    'Payment Problem',
    'Consultation Concern',
    'Refund Request',
    'Account Issue',
    'Other',
  ];

  const handleSubmit = useCallback(() => {
    if (!issueType || !description.trim()) return;

    // Fallback to email if no API
    const subject = encodeURIComponent(`Support: ${issueType} - NakshatraTalks`);
    const body = encodeURIComponent(
      `Issue Type: ${issueType}\n\n` +
        `Description:\n${description}\n\n` +
        `---\n` +
        `Platform: Web Browser\n` +
        `App Version: 1.0.0\n`
    );
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIssueType('');
      setDescription('');
    }, 3000);
  }, [issueType, description]);

  return (
    <Card className="p-6 border border-gray-100">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-text-primary font-lexend">
            Report an Issue
          </h4>
          <p className="text-sm text-text-secondary mt-1 font-nunito">
            Describe your issue and our support team will get back to you within 24-48 hours.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-emerald-700 font-lexend">Email client opened!</p>
            <p className="text-xs text-emerald-600 mt-1 font-nunito">Please send the email to complete your report.</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Issue Type Selector */}
            <div>
              <label htmlFor="issue-type" className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 font-lexend">
                Issue Type
              </label>
              <select
                id="issue-type"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm font-nunito text-text-primary focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                aria-label="Select issue type"
              >
                <option value="">Select an issue type...</option>
                {issueTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="issue-description" className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 font-lexend">
                Describe Your Issue
              </label>
              <textarea
                id="issue-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue you're facing in detail..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-nunito text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                aria-label="Issue description"
              />
            </div>

            {/* Helpful tips */}
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="text-xs font-medium text-primary font-lexend mb-2">
                For a faster resolution, please include:
              </p>
              <ul className="text-xs text-text-secondary space-y-1.5 font-nunito">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                  Your registered mobile number
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                  Date and time of the issue
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                  Screenshots if applicable
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                  Transaction ID (for payment issues)
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              disabled={!issueType || !description.trim()}
            >
              <Mail className="w-5 h-5 mr-2" aria-hidden="true" />
              Submit via Email
            </Button>

            <p className="text-xs text-text-muted text-center font-nunito">
              This will open your email client to send to{' '}
              <span className="font-medium text-text-secondary">{SUPPORT_EMAIL}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CustomerSupportPage() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('all');

  const { isReady } = useRequireAuth();

  const handleFAQToggle = useCallback((id: string) => {
    setExpandedFAQ((prev) => (prev === id ? null : id));
  }, []);

  // Filtered FAQs based on search and category
  const filteredFAQs = useMemo(() => {
    let result = FAQ_DATA;

    if (activeCategory !== 'all') {
      result = result.filter((faq) => faq.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, activeCategory]);

  // Auth loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="md">
          <div className="py-4">
            <Skeleton className="w-48 h-5 mb-6 skeleton-shimmer" />
            <Skeleton className="w-40 h-8 mb-6 skeleton-shimmer" />
            <Skeleton className="h-44 rounded-xl mb-6 skeleton-shimmer" />
            <Skeleton className="w-full h-11 rounded-xl mb-4 skeleton-shimmer" />
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full skeleton-shimmer" />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl mb-3 skeleton-shimmer" />
            ))}
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="md">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Help & Support' },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-6">
          Help & Support
        </h1>

        {/* Welcome Banner with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark rounded-2xl p-7 text-center mb-8 overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" aria-hidden="true" />
          <div className="absolute top-4 left-8 w-2 h-2 bg-secondary/60 rounded-full animate-float" aria-hidden="true" />
          <div className="absolute bottom-6 right-12 w-1.5 h-1.5 bg-secondary/40 rounded-full animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <MessageCircleQuestion className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-white font-lexend">
              How can we help you?
            </h2>
            <p className="text-sm text-white/80 mt-2 font-nunito max-w-md mx-auto leading-relaxed">
              Browse through our frequently asked questions below or submit a report for direct assistance from our team.
            </p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-1 font-lexend">
            Frequently Asked Questions
          </h3>

          {/* FAQ Search Bar */}
          <div className="relative flex items-center bg-white rounded-xl border border-gray-200 shadow-web-sm focus-within:border-primary/40 focus-within:shadow-[0_0_0_3px_rgba(41,48,166,0.08)] transition-all duration-200 mb-4">
            <Search className="w-4 h-4 text-text-muted ml-4 flex-shrink-0" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-3 outline-none text-sm font-nunito text-text-primary placeholder:text-text-muted"
              aria-label="Search frequently asked questions"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide" role="tablist" aria-label="FAQ categories">
            {FAQ_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setExpandedFAQ(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium font-lexend whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-text-secondary border border-gray-200 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* FAQ List */}
          <div>
            <AnimatePresence mode="wait">
              {filteredFAQs.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-10"
                >
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10" />
                    <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                      <Search className="w-6 h-6 text-text-muted" />
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary font-nunito">
                    No FAQs found for your search. Try a different keyword or category.
                  </p>
                </motion.div>
              ) : (
                <motion.div key="list">
                  {filteredFAQs.map((faq, index) => (
                    <FAQItem
                      key={faq.id}
                      item={faq}
                      isExpanded={expandedFAQ === faq.id}
                      onToggle={() => handleFAQToggle(faq.id)}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Report Section - Proper Form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-1 font-lexend">
            Still Need Help?
          </h3>
          <ReportForm />
        </motion.div>

        {/* Contact Info */}
        <div className="text-center pb-8">
          <p className="text-xs text-text-muted font-nunito">
            Our support team is available Monday to Saturday, 9:00 AM to 6:00 PM IST.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
