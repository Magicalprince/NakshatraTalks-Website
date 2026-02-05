'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RechargeGrid, CustomAmountInput } from '@/components/features/wallet';
import { useRechargeOptions, useInitiateRecharge, useVerifyRecharge, useWalletBalance } from '@/hooks/useWalletData';
import { useUIStore } from '@/stores/ui-store';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { RechargeOption } from '@/types/api.types';
import { ArrowLeft, Shield, CheckCircle, XCircle, Loader2, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    contact?: string;
    email?: string;
  };
  theme: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export default function RechargePage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { refetch: refetchBalance } = useWalletBalance();

  // Auth check
  const { isReady } = useRequireAuth();

  // State
  const [selectedOption, setSelectedOption] = useState<RechargeOption | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');

  // Hooks
  const { data: options, isLoading: isOptionsLoading } = useRechargeOptions();
  const { mutateAsync: initiateRecharge, isPending: isInitiating } = useInitiateRecharge();
  const { mutateAsync: verifyRecharge, isPending: isVerifying } = useVerifyRecharge();

  // Calculate final amount
  const finalAmount = selectedOption?.amount || (customAmount ? Number(customAmount) : 0);
  const bonusAmount = selectedOption?.bonus || 0;
  const totalAmount = finalAmount + bonusAmount;

  // Handle option selection
  const handleSelectOption = (option: RechargeOption) => {
    setSelectedOption(option);
    setCustomAmount('');
  };

  // Handle custom amount change
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedOption(null);
  };

  // Load Razorpay script
  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle payment
  const handlePayment = async () => {
    if (!finalAmount || finalAmount < 100) {
      addToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount (minimum ₹100)',
      });
      return;
    }

    try {
      setPaymentStatus('processing');

      // Load Razorpay
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Initiate recharge
      const response = await initiateRecharge({
        amount: finalAmount,
        optionId: selectedOption?.id,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to initiate payment');
      }

      const { razorpayOrderId, amount, currency } = response.data;

      // Open Razorpay checkout
      const razorpayOptions: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: amount * 100, // Razorpay expects amount in paise
        currency: currency || 'INR',
        name: 'NakshatraTalks',
        description: `Wallet Recharge - ₹${finalAmount}`,
        order_id: razorpayOrderId,
        handler: async (paymentResponse: RazorpayResponse) => {
          // Verify payment
          try {
            const verifyResponse = await verifyRecharge({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            });

            if (verifyResponse.success) {
              setPaymentStatus('success');
              setPaymentMessage(`₹${totalAmount} has been added to your wallet`);
              refetchBalance();
            } else {
              setPaymentStatus('failed');
              setPaymentMessage(verifyResponse.message || 'Payment verification failed');
            }
          } catch {
            setPaymentStatus('failed');
            setPaymentMessage('Payment verification failed. Please contact support.');
          }
        },
        prefill: {},
        theme: {
          color: '#2930A6',
        },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error) {
      setPaymentStatus('failed');
      setPaymentMessage(error instanceof Error ? error.message : 'Payment failed');
    }
  };

  // Close payment status modal
  const handleClosePaymentModal = () => {
    setPaymentStatus('idle');
    if (paymentStatus === 'success') {
      router.push('/wallet');
    }
  };

  // Auth loading state
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <div className="bg-white sticky top-0 z-10 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-24 h-6" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <Skeleton className="w-32 h-6 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 mt-6 rounded-xl" />
          <Skeleton className="h-32 mt-6 rounded-xl" />
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
            <Link href="/wallet">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-text-primary">Add Money</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Recharge Options */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Select Amount
          </h2>
          <RechargeGrid
            options={options || []}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            isLoading={isOptionsLoading}
          />
        </motion.div>

        {/* Custom Amount */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <CustomAmountInput
            value={customAmount}
            onChange={handleCustomAmountChange}
          />
        </motion.div>

        {/* Summary */}
        {finalAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mt-6 p-4">
              <h3 className="font-semibold text-text-primary mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Amount</span>
                  <span className="font-medium">₹{finalAmount}</span>
                </div>
                {bonusAmount > 0 && (
                  <div className="flex justify-between text-status-success">
                    <span>Bonus</span>
                    <span className="font-medium">+₹{bonusAmount}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-text-primary">Total Credit</span>
                  <span className="font-bold text-primary">₹{totalAmount}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Security Note */}
        <div className="flex items-center gap-2 mt-4 text-xs text-text-muted">
          <Shield className="w-4 h-4" />
          <span>100% Secure Payment powered by Razorpay</span>
        </div>

        {/* Pay Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button
            variant="primary"
            className="w-full h-14 text-lg gap-2"
            disabled={!finalAmount || finalAmount < 100 || isInitiating || isVerifying}
            onClick={handlePayment}
          >
            {isInitiating || isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <IndianRupee className="w-5 h-5" />
                Pay ₹{finalAmount || 0}
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Payment Status Modal */}
      <Modal
        isOpen={paymentStatus === 'success' || paymentStatus === 'failed'}
        onClose={handleClosePaymentModal}
        className="max-w-sm"
      >
        <div className="text-center py-4">
          {paymentStatus === 'success' ? (
            <>
              <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-status-success" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Payment Successful!
              </h3>
              <p className="text-text-secondary mb-4">{paymentMessage}</p>
              <Button variant="primary" className="w-full" onClick={handleClosePaymentModal}>
                Go to Wallet
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-status-error" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Payment Failed
              </h3>
              <p className="text-text-secondary mb-4">{paymentMessage}</p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleClosePaymentModal}>
                  Cancel
                </Button>
                <Button variant="primary" className="flex-1" onClick={handlePayment}>
                  Retry
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Bottom padding for mobile nav */}
      <div className="h-24" />
    </div>
  );
}
