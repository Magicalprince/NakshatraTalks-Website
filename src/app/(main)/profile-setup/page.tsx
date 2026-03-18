'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/stores/ui-store';
import { userService } from '@/lib/services/user.service';
import { Button } from '@/components/ui/Button';
import { UpdateProfileData } from '@/types/api.types';

const STEPS = ['Name & Gender', 'Birth Details', 'Location & Status', 'Email'];
const TOTAL_STEPS = STEPS.length;

type Gender = 'male' | 'female' | 'other';
type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

interface FormData {
  name: string;
  gender: Gender | '';
  dateOfBirth: string;
  timeOfBirth: string;
  timeUnknown: boolean;
  placeOfBirth: string;
  maritalStatus: MaritalStatus | '';
  email: string;
}

const initialFormData: FormData = {
  name: '',
  gender: '',
  dateOfBirth: '',
  timeOfBirth: '',
  timeUnknown: false,
  placeOfBirth: '',
  maritalStatus: '',
  email: '',
};

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

export default function ProfileSetupPage() {
  const { isReady, isLoading } = useRequireAuth();
  const updateUser = useAuthStore((s) => s.updateUser);
  const toast = useToast();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Partial<Record<keyof FormData, string>> = {};

      switch (step) {
        case 0:
          if (!formData.name || formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
          }
          if (!formData.gender) {
            newErrors.gender = 'Please select your gender';
          }
          break;
        case 1:
          if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
          }
          break;
        case 2:
          if (!formData.placeOfBirth || formData.placeOfBirth.trim().length < 2) {
            newErrors.placeOfBirth = 'Place of birth is required';
          }
          if (!formData.maritalStatus) {
            newErrors.maritalStatus = 'Please select your marital status';
          }
          break;
        case 3:
          if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
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
      const payload: UpdateProfileData = {
        name: formData.name.trim(),
        gender: formData.gender as Gender,
        dateOfBirth: formData.dateOfBirth,
        placeOfBirth: formData.placeOfBirth.trim(),
        maritalStatus: formData.maritalStatus as MaritalStatus,
      };

      if (!formData.timeUnknown && formData.timeOfBirth) {
        payload.timeOfBirth = formData.timeOfBirth;
      }

      if (formData.email.trim()) {
        payload.email = formData.email.trim();
      }

      const response = await userService.updateProfile(payload);

      if (response.success && response.data) {
        updateUser(response.data);
        toast.success('Profile completed', 'Your profile has been set up successfully.');
        router.push('/');
      } else {
        toast.error('Update failed', response.message || 'Could not save your profile. Please try again.');
      }
    } catch {
      toast.error('Something went wrong', 'Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    setShowSkipConfirm(true);
  };

  const confirmSkip = () => {
    router.push('/');
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
          <h1 className="text-2xl font-bold font-lexend text-text-primary">Complete Your Profile</h1>
          <p className="text-sm text-text-secondary mt-1">
            Step {currentStep + 1} of {TOTAL_STEPS} &mdash; {STEPS[currentStep]}
          </p>
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
        <div className="relative overflow-hidden min-h-[280px]">
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
                <StepNameGender
                  formData={formData}
                  errors={errors}
                  updateField={updateField}
                />
              )}
              {currentStep === 1 && (
                <StepBirthDetails
                  formData={formData}
                  errors={errors}
                  updateField={updateField}
                />
              )}
              {currentStep === 2 && (
                <StepLocationStatus
                  formData={formData}
                  errors={errors}
                  updateField={updateField}
                />
              )}
              {currentStep === 3 && (
                <StepEmail
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
            <Button variant="ghost" onClick={handleSkip} disabled={submitting}>
              Skip
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            isLoading={submitting}
            disabled={submitting}
          >
            {currentStep === TOTAL_STEPS - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>

        {/* Skip on later steps */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-sm text-text-tertiary hover:text-text-secondary mt-4 transition-colors"
            disabled={submitting}
          >
            Skip for now
          </button>
        )}
      </div>

      {/* Skip Confirmation Modal */}
      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold font-lexend text-text-primary mb-2">
                Skip profile setup?
              </h3>
              <p className="text-sm text-text-secondary mb-6">
                Your profile helps astrologers provide more accurate readings. You can always complete it later from your profile settings.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowSkipConfirm(false)}
                >
                  Continue Setup
                </Button>
                <Button variant="ghost" fullWidth onClick={confirmSkip}>
                  Skip
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Step Components ---------- */

interface StepProps {
  formData: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  updateField: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

function StepNameGender({ formData, errors, updateField }: StepProps) {
  const genders: { value: Gender; label: string }[] = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1.5">
          Full Name <span className="text-status-error">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter your full name"
          className={`w-full h-11 px-4 rounded-xl border text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
            errors.name ? 'border-status-error' : 'border-gray-200'
          }`}
        />
        {errors.name && <p className="text-xs text-status-error mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Gender <span className="text-status-error">*</span>
        </label>
        <div className="flex gap-2">
          {genders.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => updateField('gender', g.value)}
              className={`flex-1 h-10 rounded-full text-sm font-medium transition-all ${
                formData.gender === g.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        {errors.gender && <p className="text-xs text-status-error mt-1">{errors.gender}</p>}
      </div>
    </div>
  );
}

function StepBirthDetails({ formData, errors, updateField }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text-primary mb-1.5">
          Date of Birth <span className="text-status-error">*</span>
        </label>
        <input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateField('dateOfBirth', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full h-11 px-4 rounded-xl border text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
            errors.dateOfBirth ? 'border-status-error' : 'border-gray-200'
          }`}
        />
        {errors.dateOfBirth && (
          <p className="text-xs text-status-error mt-1">{errors.dateOfBirth}</p>
        )}
      </div>

      <div>
        <label htmlFor="timeOfBirth" className="block text-sm font-medium text-text-primary mb-1.5">
          Time of Birth
        </label>
        <input
          id="timeOfBirth"
          type="time"
          value={formData.timeUnknown ? '' : formData.timeOfBirth}
          onChange={(e) => updateField('timeOfBirth', e.target.value)}
          disabled={formData.timeUnknown}
          className={`w-full h-11 px-4 rounded-xl border border-gray-200 text-text-primary bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50 disabled:bg-gray-50`}
        />
        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formData.timeUnknown}
            onChange={(e) => {
              updateField('timeUnknown', e.target.checked);
              if (e.target.checked) updateField('timeOfBirth', '');
            }}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30"
          />
          <span className="text-sm text-text-secondary">I don&apos;t know my birth time</span>
        </label>
      </div>
    </div>
  );
}

function StepLocationStatus({ formData, errors, updateField }: StepProps) {
  const statuses: { value: MaritalStatus; label: string }[] = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="placeOfBirth" className="block text-sm font-medium text-text-primary mb-1.5">
          Place of Birth <span className="text-status-error">*</span>
        </label>
        <input
          id="placeOfBirth"
          type="text"
          value={formData.placeOfBirth}
          onChange={(e) => updateField('placeOfBirth', e.target.value)}
          placeholder="e.g., Mumbai, India"
          className={`w-full h-11 px-4 rounded-xl border text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
            errors.placeOfBirth ? 'border-status-error' : 'border-gray-200'
          }`}
        />
        {errors.placeOfBirth && (
          <p className="text-xs text-status-error mt-1">{errors.placeOfBirth}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Marital Status <span className="text-status-error">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {statuses.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => updateField('maritalStatus', s.value)}
              className={`h-10 rounded-full text-sm font-medium transition-all ${
                formData.maritalStatus === s.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {errors.maritalStatus && (
          <p className="text-xs text-status-error mt-1">{errors.maritalStatus}</p>
        )}
      </div>
    </div>
  );
}

function StepEmail({ formData, errors, updateField }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1.5">
          Email Address <span className="text-text-tertiary text-xs">(optional)</span>
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="you@example.com"
          className={`w-full h-11 px-4 rounded-xl border text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${
            errors.email ? 'border-status-error' : 'border-gray-200'
          }`}
        />
        {errors.email && <p className="text-xs text-status-error mt-1">{errors.email}</p>}
        <p className="text-xs text-text-tertiary mt-2">
          We&apos;ll use this for consultation receipts and important updates.
        </p>
      </div>
    </div>
  );
}
