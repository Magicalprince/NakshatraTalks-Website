'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/auth-store';
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

export default function AstrologerSettingsPage() {
  const { logout } = useAuthStore();
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
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveBankDetails = () => {
    // Would call API to save bank details
    setShowBankModal(false);
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

          {/* Payment */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SectionHeader icon={CreditCard} title="Payment" />
            <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
              <SettingRow
                icon={CreditCard}
                label="Bank Account"
                description="Add or update bank details for payouts"
                onClick={() => setShowBankModal(true)}
                isLast={true}
              />
            </Card>
          </motion.div>

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
                onClick={() => {}}
              />
              <SettingRow
                icon={Mail}
                label="Email Verification"
                description="Verify your email address"
                onClick={() => {}}
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
                onClick={() => {}}
              />
              <SettingRow
                icon={FileText}
                label="Terms of Service"
                onClick={() => {}}
              />
              <SettingRow
                icon={Shield}
                label="Privacy Policy"
                onClick={() => {}}
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

        {/* Bank Details Modal */}
        <Modal
          isOpen={showBankModal}
          onClose={() => setShowBankModal(false)}
          title="Bank Account Details"
        >
          <div className="space-y-4">
            <Input
              label="Account Holder Name"
              value={bankDetails.accountName}
              onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
              placeholder="Enter account holder name"
            />
            <Input
              label="Account Number"
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
              placeholder="Enter account number"
            />
            <Input
              label="IFSC Code"
              value={bankDetails.ifscCode}
              onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
              placeholder="Enter IFSC code"
            />
            <Input
              label="Bank Name"
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
              placeholder="Enter bank name"
            />

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowBankModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveBankDetails}>
                Save Details
              </Button>
            </div>
          </div>
        </Modal>
      </PageContainer>
    </div>
  );
}
