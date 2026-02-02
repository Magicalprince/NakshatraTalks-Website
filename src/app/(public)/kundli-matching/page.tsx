'use client';

import { useRouter } from 'next/navigation';
import { MatchingForm } from '@/components/features/kundli';
import { useGenerateMatching } from '@/hooks/useKundli';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Heart, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { KundliInput } from '@/types/api.types';

export default function KundliMatchingPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const { mutate: generateMatching, isPending } = useGenerateMatching();

  const handleSubmit = (boyData: KundliInput, girlData: KundliInput) => {
    generateMatching(
      { boyDetails: boyData, girlDetails: girlData },
      {
        onSuccess: (response) => {
          if (response.data?.id) {
            addToast({
              type: 'success',
              title: 'Matching Complete',
              message: 'Compatibility analysis is ready.',
            });
            router.push(`/kundli-matching/${response.data.id}`);
          }
        },
        onError: (error) => {
          addToast({
            type: 'error',
            title: 'Matching Failed',
            message: error instanceof Error ? error.message : 'Failed to generate matching report',
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white py-8 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Kundli Matching</h1>
          <p className="text-white/80 text-sm">
            Check compatibility with Gun Milan for marriage
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Info Card */}
        <Card className="p-4 mb-6 bg-pink-50 border-pink-200">
          <h3 className="font-semibold text-pink-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            What We Analyze
          </h3>
          <ul className="text-sm text-pink-700 space-y-1">
            <li>• Ashtakoot Gun Milan (36 points)</li>
            <li>• Mangal Dosha compatibility</li>
            <li>• Nadi Dosha analysis</li>
            <li>• Overall compatibility score</li>
          </ul>
        </Card>

        {/* Form */}
        <MatchingForm onSubmit={handleSubmit} isLoading={isPending} />

        {/* Note */}
        <p className="text-xs text-text-muted text-center mt-6">
          For accurate matching, please enter exact birth details for both individuals.
        </p>

        {/* CTA */}
        <Card className="mt-8 p-5 text-center">
          <p className="text-sm text-text-secondary mb-3">
            Need expert guidance on your compatibility?
          </p>
          <Link href="/browse-chat">
            <Button variant="outline" size="sm">
              Consult an Astrologer
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
