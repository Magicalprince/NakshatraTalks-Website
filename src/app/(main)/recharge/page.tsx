'use client';

/**
 * Recharge / Add Money Page
 * Enhanced 2026 design with:
 * - Amount option buttons with shadow + scale selected state
 * - Better custom amount input styling
 * - Order summary card with gradient top border
 * - Lock icon and visual trust indicators in security section
 * - Payment modal with animated success/failure states
 * - skeleton-shimmer loading states
 * - Improved accessibility
 */

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
import { Shield, CheckCircle, XCircle, Loader2, IndianRupee, Lock, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

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
        message: 'Please enter a valid amount (minimum \u20B9100)',
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
        description: `Wallet Recharge - \u20B9${finalAmount}`,
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
              setPaymentMessage(`\u20B9${totalAmount} has been added to your wallet`);
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
        <PageContainer size="md">
          <div className="py-4">
            <Skeleton className="w-48 h-5 mb-6 skeleton-shimmer" />
            <Skeleton className="w-32 h-8 mb-6 skeleton-shimmer" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl skeleton-shimmer" />
              ))}
            </div>
            <Skeleton className="h-14 mt-6 rounded-xl skeleton-shimmer" />
            <Skeleton className="h-36 mt-6 rounded-xl skeleton-shimmer" />
            <Skeleton className="h-14 mt-6 rounded-xl skeleton-shimmer" />
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
            { label: 'Wallet', href: '/wallet' },
            { label: 'Recharge' },
          ]}
        />

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary font-lexend">Add Money</h1>
        </div>

        {/* Recharge Options */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4 font-lexend">
            Select Amount
          </h2>
          <RechargeGrid
            options={options || []}
            selectedOption={selectedOption}
            onSelectOption={handleSelectOption}
            isLoading={isOptionsLoading}
          />
        </motion.div>

        {/* Custom Amount - Enhanced with better styling */}
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

        {/* Order Summary - Enhanced with gradient top border */}
        <AnimatePresence>
          {finalAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="mt-6 relative rounded-xl overflow-hidden">
                {/* Gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
                <Card className="p-5 pt-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-4.5 h-4.5 text-primary" aria-hidden="true" />
                    <h3 className="font-semibold text-text-primary font-lexend">Order Summary</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary font-nunito">Amount</span>
                      <span className="font-medium text-text-primary font-lexend">{'\u20B9'}{finalAmount}</span>
                    </div>
                    {bonusAmount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center"
                      >
                        <span className="text-status-success font-nunito flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                          Bonus
                        </span>
                        <span className="font-medium text-status-success font-lexend">+{'\u20B9'}{bonusAmount}</span>
                      </motion.div>
                    )}
                    <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-text-primary font-lexend">Total Credit</span>
                      <span className="text-lg font-bold text-primary font-lexend">{'\u20B9'}{totalAmount}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Section - Enhanced with lock icon and visual trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-5 p-4 bg-green-50/60 border border-green-100 rounded-xl"
          role="region"
          aria-label="Security information"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-green-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 font-lexend">100% Secure Payment</p>
              <p className="text-xs text-green-600/80 font-nunito mt-0.5">
                Powered by Razorpay with 256-bit SSL encryption
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" />
          </div>
          {/* Trust badges */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-green-100/60">
            <div className="flex items-center gap-1.5 text-xs text-green-700/70">
              <Shield className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-nunito">PCI DSS Compliant</span>
            </div>
            <div className="w-px h-3 bg-green-200" />
            <div className="flex items-center gap-1.5 text-xs text-green-700/70">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-nunito">RBI Authorized</span>
            </div>
          </div>
        </motion.div>

        {/* Pay Button - Enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pb-8"
        >
          <Button
            variant="primary"
            className="w-full h-14 text-lg gap-2 shadow-primary hover:shadow-[0_6px_20px_rgba(41,48,166,0.35)] transition-all duration-250"
            disabled={!finalAmount || finalAmount < 100 || isInitiating || isVerifying}
            onClick={handlePayment}
            aria-label={finalAmount ? `Pay ${finalAmount} rupees` : 'Select an amount to proceed'}
          >
            {isInitiating || isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                Processing...
              </>
            ) : (
              <>
                Pay {'\u20B9'}{finalAmount || 0}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </>
            )}
          </Button>
        </motion.div>
      </PageContainer>

      {/* Payment Status Modal - Enhanced with animations */}
      <Modal
        isOpen={paymentStatus === 'success' || paymentStatus === 'failed'}
        onClose={handleClosePaymentModal}
        className="max-w-sm"
      >
        <div className="text-center py-6 px-2">
          <AnimatePresence mode="wait">
            {paymentStatus === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Animated success circle */}
                <motion.div
                  className="w-20 h-20 bg-status-success/10 rounded-full flex items-center justify-center mx-auto mb-5 relative"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                >
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-status-success/10"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 1, repeat: 2, ease: 'easeOut' }}
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle className="w-10 h-10 text-status-success" />
                  </motion.div>
                </motion.div>

                <motion.h3
                  className="text-xl font-bold text-text-primary mb-2 font-lexend"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  Payment Successful!
                </motion.h3>
                <motion.p
                  className="text-text-secondary mb-6 font-nunito"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {paymentMessage}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Button
                    variant="primary"
                    className="w-full h-12 gap-2"
                    onClick={handleClosePaymentModal}
                  >
                    Go to Wallet
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Animated failure circle */}
                <motion.div
                  className="w-20 h-20 bg-status-error/10 rounded-full flex items-center justify-center mx-auto mb-5"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  >
                    <XCircle className="w-10 h-10 text-status-error" />
                  </motion.div>
                </motion.div>

                <motion.h3
                  className="text-xl font-bold text-text-primary mb-2 font-lexend"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  Payment Failed
                </motion.h3>
                <motion.p
                  className="text-text-secondary mb-6 font-nunito"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  {paymentMessage}
                </motion.p>
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Button variant="outline" className="flex-1 h-12" onClick={handleClosePaymentModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1 h-12 gap-1.5"
                    onClick={handlePayment}
                  >
                    <Loader2 className="w-4 h-4 hidden" aria-hidden="true" />
                    Retry Payment
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </div>
  );
}
