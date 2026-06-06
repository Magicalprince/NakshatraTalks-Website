'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { SectionHeader, SettingRow } from '@/components/shared';
import {
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  FileText,
  Smartphone,
  Mail,
  LogOut,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useEarningsSummary, useUpdatePayoutDetails } from '@/hooks/useAstrologerDashboard';
import { useSalaryMode } from '@/contexts/SalaryModeContext';

const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z][a-zA-Z0-9]+$/;

export default function AstrologerSettingsPage() {
  const { logout } = useAuthStore();
  const { addToast } = useUIStore();
  const salaryMode = useSalaryMode();
  const { data: summary } = useEarningsSummary();
  const updatePayoutDetails = useUpdatePayoutDetails();
  const [notifications, setNotifications] = useState({
    newRequests: true,
    sessionReminders: true,
    payoutUpdates: true,
    marketing: false,
  });
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  });

  // Prefill from the earnings summary whenever the modal opens. The summary
  // is also the source of truth the WithdrawModal reads from, so the two
  // surfaces never disagree on what's saved.
  useEffect(() => {
    if (showBankModal && summary) {
      setBankDetails({
        accountName: summary.accountHolderName ?? '',
        accountNumber: summary.accountNumber ?? '',
        ifscCode: summary.ifscCode ?? '',
        bankName: summary.bankName ?? '',
        upiId: summary.upiId ?? '',
      });
      setBankErrors({});
    }
  }, [showBankModal, summary]);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [bankErrors, setBankErrors] = useState<Record<string, string>>({});

  /**
   * Either bank OR UPI is sufficient — the WithdrawModal lets the astrologer
   * pick at withdraw time. We only validate fields the astrologer actually
   * filled in, matching the mobile BankDetails screen's "save anything,
   * require at least one method" behaviour.
   */
  const validateBankDetails = () => {
    const errors: Record<string, string> = {};
    const hasAnyBankField =
      bankDetails.accountName.trim() ||
      bankDetails.accountNumber.trim() ||
      bankDetails.ifscCode.trim() ||
      bankDetails.bankName.trim();
    const hasUpi = bankDetails.upiId.trim();

    if (!hasAnyBankField && !hasUpi) {
      errors.upiId = 'Add a UPI ID or fill in bank details';
      return errors;
    }

    if (hasAnyBankField) {
      if (!bankDetails.accountName.trim()) errors.accountName = 'Account holder name is required';
      if (!bankDetails.accountNumber.trim() || !/^\d{9,18}$/.test(bankDetails.accountNumber.trim()))
        errors.accountNumber = 'Enter a valid account number (9-18 digits)';
      if (!bankDetails.ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(bankDetails.ifscCode.trim()))
        errors.ifscCode = 'Enter a valid IFSC code (e.g. SBIN0001234)';
      if (!bankDetails.bankName.trim()) errors.bankName = 'Bank name is required';
    }
    if (hasUpi && !UPI_REGEX.test(bankDetails.upiId.trim())) {
      errors.upiId = 'Enter a valid UPI ID (e.g. name@bank)';
    }
    return errors;
  };

  const handleSaveBankDetails = async () => {
    const errors = validateBankDetails();
    setBankErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await updatePayoutDetails.mutateAsync({
        bankName: bankDetails.bankName.trim() || undefined,
        accountHolderName: bankDetails.accountName.trim() || undefined,
        accountNumber: bankDetails.accountNumber.trim() || undefined,
        ifscCode: bankDetails.ifscCode.trim().toUpperCase() || undefined,
        upiId: bankDetails.upiId.trim() || undefined,
      });
      addToast({
        type: 'success',
        title: 'Payout details saved',
        message: 'You can now request a withdrawal from the Earnings page.',
      });
      setShowBankModal(false);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save failed',
        message: err instanceof Error ? err.message : 'Could not save payout details.',
      });
    }
  };

  const notificationItems = [
    { key: 'newRequests' as const, label: 'New Requests', desc: 'Get notified for new consultation requests' },
    { key: 'sessionReminders' as const, label: 'Session Reminders', desc: 'Reminders for upcoming sessions' },
    { key: 'payoutUpdates' as const, label: 'Payout Updates', desc: 'Notifications about earnings and payouts' },
    { key: 'marketing' as const, label: 'Marketing', desc: 'Tips and promotional updates' },
  ];

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="md">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/astrologer/dashboard' },
          { label: 'Settings' },
        ]} />

        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <SectionHeader icon={Bell} title="Notifications" />
            <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
              {notificationItems.map((item, index) => (
                <SettingRow
                  key={item.key}
                  icon={Bell}
                  label={item.label}
                  description={item.desc}
                  toggle={true}
                  checked={notifications[item.key]}
                  onToggle={() => toggleNotification(item.key)}
                  isLast={index === notificationItems.length - 1}
                />
              ))}
            </Card>
          </motion.div>

          {/* Payment (hidden for salary-mode astrologers — they're paid a
              fixed salary by the platform, not by per-session payouts) */}
          {!salaryMode.enabled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <SectionHeader icon={CreditCard} title="Payment" />
              <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
                <SettingRow
                  icon={CreditCard}
                  label="Payout details"
                  description="Bank account, UPI ID, and how you get paid"
                  onClick={() => setShowBankModal(true)}
                  isLast={true}
                />
              </Card>
            </motion.div>
          )}

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SectionHeader icon={Shield} title="Security" />
            <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
              <SettingRow
                icon={Smartphone}
                label="Change Phone Number"
                description="Update your login phone number"
                onClick={() => {
                  addToast({
                    type: 'info',
                    title: 'Contact Support',
                    message: 'To change your phone number, please contact support@nakshatratalks.com',
                  });
                }}
              />
              <SettingRow
                icon={Mail}
                label="Email Verification"
                description="Verify your email address"
                onClick={() => {
                  addToast({
                    type: 'info',
                    title: 'Contact Support',
                    message: 'To update your email, please contact support@nakshatratalks.com',
                  });
                }}
                isLast={true}
              />
            </Card>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SectionHeader icon={Sliders} title="Legal & Support" />
            <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
              <SettingRow
                icon={HelpCircle}
                label="Help Center"
                href="/support"
              />
              <SettingRow
                icon={FileText}
                label="Terms of Service"
                href="/terms"
              />
              <SettingRow
                icon={Shield}
                label="Privacy Policy"
                href="/privacy"
                isLast={true}
              />
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SectionHeader icon={AlertTriangle} title="Account" variant="danger" />
            <Button
              variant="outline"
              className="w-full text-status-error border-status-error/30 hover:bg-status-error/5 hover:border-status-error/50 transition-all duration-200"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </motion.div>
        </div>

        {/* Bank / UPI Details Modal */}
        <Modal
          isOpen={showBankModal}
          onClose={() => {
            if (!updatePayoutDetails.isPending) setShowBankModal(false);
          }}
          title="Payout Details"
          description="Add a bank account, a UPI ID, or both. You'll pick which to use at withdraw time."
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Account Holder Name"
              value={bankDetails.accountName}
              onChange={(e) => {
                setBankDetails({ ...bankDetails, accountName: e.target.value });
                setBankErrors((prev) => ({ ...prev, accountName: '' }));
              }}
              placeholder="Enter account holder name"
              error={bankErrors.accountName}
            />
            <Input
              label="Account Number"
              type="password"
              value={bankDetails.accountNumber}
              onChange={(e) => {
                setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, '') });
                setBankErrors((prev) => ({ ...prev, accountNumber: '' }));
              }}
              placeholder="Enter account number"
              error={bankErrors.accountNumber}
            />
            <Input
              label="IFSC Code"
              value={bankDetails.ifscCode}
              onChange={(e) => {
                setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() });
                setBankErrors((prev) => ({ ...prev, ifscCode: '' }));
              }}
              placeholder="e.g. SBIN0001234"
              error={bankErrors.ifscCode}
            />
            <Input
              label="Bank Name"
              value={bankDetails.bankName}
              onChange={(e) => {
                setBankDetails({ ...bankDetails, bankName: e.target.value });
                setBankErrors((prev) => ({ ...prev, bankName: '' }));
              }}
              placeholder="Enter bank name"
              error={bankErrors.bankName}
            />

            <div className="my-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-text-muted">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <Input
              label="UPI ID"
              value={bankDetails.upiId}
              onChange={(e) => {
                setBankDetails({ ...bankDetails, upiId: e.target.value });
                setBankErrors((prev) => ({ ...prev, upiId: '' }));
              }}
              placeholder="name@bank"
              error={bankErrors.upiId}
            />

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowBankModal(false);
                  setBankErrors({});
                }}
                disabled={updatePayoutDetails.isPending}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveBankDetails}
                isLoading={updatePayoutDetails.isPending}
                disabled={updatePayoutDetails.isPending}
              >
                Save Details
              </Button>
            </div>
          </div>
        </Modal>
      </PageContainer>
    </div>
  );
}
