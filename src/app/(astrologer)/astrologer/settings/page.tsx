'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/auth-store';
import {
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  FileText,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  Mail,
  LogOut,
} from 'lucide-react';

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

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary text-sm">Manage your account preferences</p>
      </div>

      {/* Notifications */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-text-primary">Notifications</h2>
          </div>
        </div>
        <div className="divide-y">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">New Requests</p>
              <p className="text-xs text-text-muted">Get notified for new consultation requests</p>
            </div>
            <button onClick={() => toggleNotification('newRequests')}>
              {notifications.newRequests ? (
                <ToggleRight className="w-8 h-8 text-status-success" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-text-muted" />
              )}
            </button>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Session Reminders</p>
              <p className="text-xs text-text-muted">Reminders for upcoming sessions</p>
            </div>
            <button onClick={() => toggleNotification('sessionReminders')}>
              {notifications.sessionReminders ? (
                <ToggleRight className="w-8 h-8 text-status-success" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-text-muted" />
              )}
            </button>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Payout Updates</p>
              <p className="text-xs text-text-muted">Notifications about earnings and payouts</p>
            </div>
            <button onClick={() => toggleNotification('payoutUpdates')}>
              {notifications.payoutUpdates ? (
                <ToggleRight className="w-8 h-8 text-status-success" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-text-muted" />
              )}
            </button>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Marketing</p>
              <p className="text-xs text-text-muted">Tips and promotional updates</p>
            </div>
            <button onClick={() => toggleNotification('marketing')}>
              {notifications.marketing ? (
                <ToggleRight className="w-8 h-8 text-status-success" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-text-muted" />
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Payment Settings */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-text-primary">Payment</h2>
          </div>
        </div>
        <div className="divide-y">
          <button
            onClick={() => setShowBankModal(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-text-muted" />
              <div className="text-left">
                <p className="font-medium text-text-primary">Bank Account</p>
                <p className="text-xs text-text-muted">Add or update bank details for payouts</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      </Card>

      {/* Security */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-text-primary">Security</h2>
          </div>
        </div>
        <div className="divide-y">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-text-muted" />
              <div className="text-left">
                <p className="font-medium text-text-primary">Change Phone Number</p>
                <p className="text-xs text-text-muted">Update your login phone number</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-text-muted" />
              <div className="text-left">
                <p className="font-medium text-text-primary">Email Verification</p>
                <p className="text-xs text-text-muted">Verify your email address</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      </Card>

      {/* Support */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-text-primary">Support</h2>
          </div>
        </div>
        <div className="divide-y">
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-text-muted" />
              <p className="font-medium text-text-primary">Help Center</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-text-muted" />
              <p className="font-medium text-text-primary">Terms of Service</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </button>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-text-muted" />
              <p className="font-medium text-text-primary">Privacy Policy</p>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-status-error border-status-error hover:bg-status-error/5"
        onClick={() => logout()}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>

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
    </div>
  );
}
