'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/stores/ui-store';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Camera, Briefcase, IndianRupee, Building2 } from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────

const STEPS = ['Bio & Photo', 'Professional Details', 'Pricing', 'Bank Details'];
const TOTAL_STEPS = STEPS.length;

const STEP_ICONS = [Camera, Briefcase, IndianRupee, Building2];

const SPECIALIZATIONS = [
  'Vedic',
  'Numerology',
  'Tarot',
  'Palmistry',
  'Vastu',
  'KP',
  'Nadi',
  'Prashna',
] as const;

const LANGUAGES = [
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Bengali',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Gujarati',
] as const;

// ─── Types ──────────────────────────────────────────────────────────────

interface FormData {
  bio: string;
  profileImage: string;
  specializations: string[];
  languages: string[];
  experienceYears: string;
  chatPricePerMin: string;
  callPricePerMin: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
  bio: '',
  profileImage: '',
  specializations: [],
  languages: [],
  experienceYears: '',
  chatPricePerMin: '',
  callPricePerMin: '',
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
};

// ─── Animation Variants ─────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ─── Page Component ─────────────────────────────────────────────────────

export default function AstrologerProfileSetupPage() {
  const { isReady, isLoading } = useRequireAuth();
  const toast = useToast();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const toggleArrayItem = useCallback((key: 'specializations' | 'languages', item: string) => {
    setFormData((prev) => {
      const arr = prev[key];
      const next = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
      return { ...prev, [key]: next };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: FormErrors = {};

      switch (step) {
        case 0:
          if (!formData.bio.trim() || formData.bio.trim().length < 20) {
            newErrors.bio = 'Bio must be at least 20 characters';
          }
          break;
        case 1:
          if (formData.specializations.length === 0) {
            newErrors.specializations = 'Select at least one specialization';
          }
          if (formData.languages.length === 0) {
            newErrors.languages = 'Select at least one language';
          }
          if (!formData.experienceYears) {
            newErrors.experienceYears = 'Experience is required';
          } else {
            const years = Number(formData.experienceYears);
            if (isNaN(years) || years < 0 || years > 99) {
              newErrors.experienceYears = 'Enter a valid number (0-99)';
            }
          }
          break;
        case 2:
          if (!formData.chatPricePerMin) {
            newErrors.chatPricePerMin = 'Chat price is required';
          } else if (Number(formData.chatPricePerMin) <= 0) {
            newErrors.chatPricePerMin = 'Price must be greater than 0';
          }
          if (!formData.callPricePerMin) {
            newErrors.callPricePerMin = 'Call price is required';
          } else if (Number(formData.callPricePerMin) <= 0) {
            newErrors.callPricePerMin = 'Price must be greater than 0';
          }
          break;
        case 3:
          if (!formData.bankName.trim()) {
            newErrors.bankName = 'Bank name is required';
          }
          if (!formData.accountHolderName.trim()) {
            newErrors.accountHolderName = 'Account holder name is required';
          }
          if (!formData.accountNumber.trim()) {
            newErrors.accountNumber = 'Account number is required';
          } else if (!/^\d+$/.test(formData.accountNumber.trim())) {
            newErrors.accountNumber = 'Account number must be numeric';
          }
          if (!formData.ifscCode.trim()) {
            newErrors.ifscCode = 'IFSC code is required';
          } else if (!/^[A-Z0-9]{1,11}$/.test(formData.ifscCode.trim().toUpperCase())) {
            newErrors.ifscCode = 'Enter a valid IFSC code (max 11 characters)';
          }
          // UPI is optional - only validate format if provided
          if (formData.upiId.trim() && !formData.upiId.includes('@')) {
            newErrors.upiId = 'Enter a valid UPI ID (e.g., name@upi)';
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData]
  );

  const handleNext = useCallback(() => {
    if (!validateStep(currentStep)) return;

    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        bio: formData.bio.trim(),
        profileImage: formData.profileImage || undefined,
        specializations: formData.specializations,
        languages: formData.languages,
        experienceYears: Number(formData.experienceYears),
        chatPricePerMin: Number(formData.chatPricePerMin),
        callPricePerMin: Number(formData.callPricePerMin),
        bankDetails: {
          bankName: formData.bankName.trim(),
          accountHolderName: formData.accountHolderName.trim(),
          accountNumber: formData.accountNumber.trim(),
          ifscCode: formData.ifscCode.trim().toUpperCase(),
          upiId: formData.upiId.trim() || undefined,
        },
      };

      await apiClient.put('/api/v1/astrologers/me/profile', payload);
      toast.success('Profile setup complete', 'Your astrologer profile is ready!');
      router.push('/astrologer/dashboard');
    } catch {
      toast.error('Something went wrong', 'Could not save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background-offWhite flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-card p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-lexend text-text-primary">
            Set Up Your Profile
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Step {currentStep + 1} of {TOTAL_STEPS} &mdash; {STEPS[currentStep]}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {STEPS.map((_, idx) => {
            const Icon = STEP_ICONS[idx];
            const isActive = idx === currentStep;
            const isDone = idx < currentStep;
            return (
              <div
                key={idx}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : isDone
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-100 text-text-tertiary'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>

        {/* Step Content */}
        <div className="relative overflow-hidden min-h-[340px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {currentStep === 0 && (
                <StepBioPhoto
                  formData={formData}
                  errors={errors}
                  updateField={updateField}
                />
              )}
              {currentStep === 1 && (
                <StepProfessionalDetails
                  formData={formData}
                  errors={errors}
                  updateField={updateField}
                  toggleArrayItem={toggleArrayItem}
                />
              )}
              {currentStep === 2 && (
                <StepPricing
                  formData={formData}
                  errors={errors}
                  updateField={updateField}
                />
              )}
              {currentStep === 3 && (
                <StepBankDetails
                  formData={formData}
                  errors={errors}
                  updateField={updateField}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 gap-3">
          {currentStep > 0 ? (
            <Button variant="ghost" onClick={handleBack} disabled={submitting}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            isLoading={submitting}
            disabled={submitting}
          >
            {currentStep === TOTAL_STEPS - 1 ? 'Complete Setup' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Components ────────────────────────────────────────────────────

interface StepProps {
  formData: FormData;
  errors: FormErrors;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

interface StepProfessionalProps extends StepProps {
  toggleArrayItem: (key: 'specializations' | 'languages', item: string) => void;
}

// ─── Shared Styles ──────────────────────────────────────────────────────

const inputClass = (hasError: boolean) =>
  `w-full h-11 px-4 rounded-xl border text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
    hasError ? 'border-status-error' : 'border-gray-200'
  }`;

const labelClass = 'block text-sm font-medium text-text-primary mb-1.5';

// ─── Step 1: Bio & Photo ────────────────────────────────────────────────

function StepBioPhoto({ formData, errors, updateField }: StepProps) {
  const charCount = formData.bio.length;

  return (
    <div className="space-y-5">
      {/* Profile Image Placeholder */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
          <Camera className="w-8 h-8 text-text-tertiary" />
        </div>
        <p className="text-xs text-text-tertiary">Profile photo upload coming soon</p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className={labelClass}>
          About You <span className="text-status-error">*</span>
        </label>
        <textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => {
            if (e.target.value.length <= 500) {
              updateField('bio', e.target.value);
            }
          }}
          placeholder="Tell users about your experience, expertise, and consultation style..."
          rows={4}
          className={`w-full px-4 py-3 rounded-xl border text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none ${
            errors.bio ? 'border-status-error' : 'border-gray-200'
          }`}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.bio ? (
            <p className="text-xs text-status-error">{errors.bio}</p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ${
              charCount >= 480 ? 'text-status-error' : 'text-text-tertiary'
            }`}
          >
            {charCount}/500
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Professional Details ───────────────────────────────────────

function StepProfessionalDetails({
  formData,
  errors,
  toggleArrayItem,
  updateField,
}: StepProfessionalProps) {
  return (
    <div className="space-y-5">
      {/* Specializations */}
      <div>
        <label className={labelClass}>
          Specializations <span className="text-status-error">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((spec) => {
            const selected = formData.specializations.includes(spec);
            return (
              <button
                key={spec}
                type="button"
                onClick={() => toggleArrayItem('specializations', spec)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selected
                    ? 'bg-primary text-white shadow-sm'
                    : 'border border-gray-300 text-text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
        {errors.specializations && (
          <p className="text-xs text-status-error mt-1">{errors.specializations}</p>
        )}
      </div>

      {/* Languages */}
      <div>
        <label className={labelClass}>
          Languages <span className="text-status-error">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => {
            const selected = formData.languages.includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => toggleArrayItem('languages', lang)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selected
                    ? 'bg-primary text-white shadow-sm'
                    : 'border border-gray-300 text-text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
        {errors.languages && (
          <p className="text-xs text-status-error mt-1">{errors.languages}</p>
        )}
      </div>

      {/* Experience Years */}
      <div>
        <label htmlFor="experienceYears" className={labelClass}>
          Years of Experience <span className="text-status-error">*</span>
        </label>
        <input
          id="experienceYears"
          type="number"
          min={0}
          max={99}
          value={formData.experienceYears}
          onChange={(e) => updateField('experienceYears', e.target.value)}
          placeholder="e.g., 5"
          className={inputClass(!!errors.experienceYears)}
        />
        {errors.experienceYears && (
          <p className="text-xs text-status-error mt-1">{errors.experienceYears}</p>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Pricing ────────────────────────────────────────────────────

function StepPricing({ formData, errors, updateField }: StepProps) {
  return (
    <div className="space-y-5">
      {/* Chat Price */}
      <div>
        <label htmlFor="chatPricePerMin" className={labelClass}>
          Chat Price per Minute <span className="text-status-error">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
            &#8377;
          </span>
          <input
            id="chatPricePerMin"
            type="number"
            min={1}
            value={formData.chatPricePerMin}
            onChange={(e) => updateField('chatPricePerMin', e.target.value)}
            placeholder="e.g., 20"
            className={`${inputClass(!!errors.chatPricePerMin)} pl-8`}
          />
        </div>
        {errors.chatPricePerMin && (
          <p className="text-xs text-status-error mt-1">{errors.chatPricePerMin}</p>
        )}
      </div>

      {/* Call Price */}
      <div>
        <label htmlFor="callPricePerMin" className={labelClass}>
          Call Price per Minute <span className="text-status-error">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
            &#8377;
          </span>
          <input
            id="callPricePerMin"
            type="number"
            min={1}
            value={formData.callPricePerMin}
            onChange={(e) => updateField('callPricePerMin', e.target.value)}
            placeholder="e.g., 30"
            className={`${inputClass(!!errors.callPricePerMin)} pl-8`}
          />
        </div>
        {errors.callPricePerMin && (
          <p className="text-xs text-status-error mt-1">{errors.callPricePerMin}</p>
        )}
      </div>

      {/* Helper text */}
      <div className="bg-primary/5 rounded-xl p-3 flex items-start gap-2">
        <IndianRupee className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-text-secondary">
          Most astrologers charge &#8377;15&ndash;&#8377;50/min. You can update your pricing anytime
          from settings.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: Bank Details ───────────────────────────────────────────────

function StepBankDetails({ formData, errors, updateField }: StepProps) {
  return (
    <div className="space-y-4">
      {/* Bank Name */}
      <div>
        <label htmlFor="bankName" className={labelClass}>
          Bank Name <span className="text-status-error">*</span>
        </label>
        <input
          id="bankName"
          type="text"
          value={formData.bankName}
          onChange={(e) => updateField('bankName', e.target.value)}
          placeholder="e.g., State Bank of India"
          className={inputClass(!!errors.bankName)}
        />
        {errors.bankName && (
          <p className="text-xs text-status-error mt-1">{errors.bankName}</p>
        )}
      </div>

      {/* Account Holder Name */}
      <div>
        <label htmlFor="accountHolderName" className={labelClass}>
          Account Holder Name <span className="text-status-error">*</span>
        </label>
        <input
          id="accountHolderName"
          type="text"
          value={formData.accountHolderName}
          onChange={(e) => updateField('accountHolderName', e.target.value)}
          placeholder="As per bank records"
          className={inputClass(!!errors.accountHolderName)}
        />
        {errors.accountHolderName && (
          <p className="text-xs text-status-error mt-1">{errors.accountHolderName}</p>
        )}
      </div>

      {/* Account Number */}
      <div>
        <label htmlFor="accountNumber" className={labelClass}>
          Account Number <span className="text-status-error">*</span>
        </label>
        <input
          id="accountNumber"
          type="text"
          inputMode="numeric"
          value={formData.accountNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            updateField('accountNumber', val);
          }}
          placeholder="Enter account number"
          className={inputClass(!!errors.accountNumber)}
        />
        {errors.accountNumber && (
          <p className="text-xs text-status-error mt-1">{errors.accountNumber}</p>
        )}
      </div>

      {/* IFSC Code */}
      <div>
        <label htmlFor="ifscCode" className={labelClass}>
          IFSC Code <span className="text-status-error">*</span>
        </label>
        <input
          id="ifscCode"
          type="text"
          maxLength={11}
          value={formData.ifscCode}
          onChange={(e) => updateField('ifscCode', e.target.value.toUpperCase())}
          placeholder="e.g., SBIN0001234"
          className={inputClass(!!errors.ifscCode)}
        />
        {errors.ifscCode && (
          <p className="text-xs text-status-error mt-1">{errors.ifscCode}</p>
        )}
      </div>

      {/* UPI ID */}
      <div>
        <label htmlFor="upiId" className={labelClass}>
          UPI ID <span className="text-text-tertiary text-xs">(optional)</span>
        </label>
        <input
          id="upiId"
          type="text"
          value={formData.upiId}
          onChange={(e) => updateField('upiId', e.target.value)}
          placeholder="e.g., yourname@upi"
          className={inputClass(!!errors.upiId)}
        />
        {errors.upiId && (
          <p className="text-xs text-status-error mt-1">{errors.upiId}</p>
        )}
      </div>
    </div>
  );
}
