'use client';

import { useRouter } from 'next/navigation';
import { KundliForm } from '@/components/features/kundli';
import { useGenerateKundli } from '@/hooks/useKundli';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { KundliInput } from '@/types/api.types';

export default function GenerateKundliPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { mutate: generateKundli, isPending } = useGenerateKundli();

  const handleSubmit = (data: KundliInput) => {
    generateKundli(data, {
      onSuccess: (response) => {
        if (response.data?.id) {
          addToast({
            type: 'success',
            title: 'Kundli Generated',
            message: 'Your kundli has been generated successfully.',
          });
          router.push(`/kundli/${response.data.id}`);
        }
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Generation Failed',
          message: error instanceof Error ? error.message : 'Failed to generate kundli',
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/kundli">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-text-primary">Generate Kundli</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        <p className="text-text-secondary text-sm text-center mb-6">
          Enter your birth details to generate your free Kundli
        </p>

        <KundliForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          title="Birth Details"
          submitText="Generate Kundli"
        />

        <p className="text-xs text-text-muted text-center mt-4">
          For accurate predictions, please enter exact birth time and place.
        </p>
      </div>

      {/* Full-screen loading overlay while generating */}
      {isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary font-lexend mb-2">
              Generating Your Kundli
            </h3>
            <p className="text-sm text-text-secondary font-lexend text-center max-w-xs">
              Calculating planetary positions and preparing your birth chart report...
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
