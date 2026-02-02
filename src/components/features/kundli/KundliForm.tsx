'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import { KundliInput } from '@/types/api.types';

const kundliSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().min(1, 'Time of birth is required'),
  placeOfBirth: z.string().min(2, 'Place of birth is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
});

type KundliFormData = z.infer<typeof kundliSchema>;

interface KundliFormProps {
  initialData?: Partial<KundliFormData>;
  onSubmit: (data: KundliInput) => void;
  isLoading?: boolean;
  title?: string;
  submitText?: string;
}

export function KundliForm({
  initialData,
  onSubmit,
  isLoading,
  title = 'Birth Details',
  submitText = 'Generate Kundli',
}: KundliFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KundliFormData>({
    resolver: zodResolver(kundliSchema),
    defaultValues: {
      name: initialData?.name || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      timeOfBirth: initialData?.timeOfBirth || '',
      placeOfBirth: initialData?.placeOfBirth || '',
    },
  });

  const handleFormSubmit = (data: KundliFormData) => {
    onSubmit({
      ...data,
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || 'Asia/Kolkata',
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6">{title}</h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Name */}
        <Input
          label="Full Name"
          placeholder="Enter full name"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Date of Birth */}
        <Input
          label="Date of Birth"
          type="date"
          error={errors.dateOfBirth?.message}
          {...register('dateOfBirth')}
        />

        {/* Time of Birth */}
        <Input
          label="Time of Birth"
          type="time"
          error={errors.timeOfBirth?.message}
          {...register('timeOfBirth')}
        />

        {/* Place of Birth */}
        <Input
          label="Place of Birth"
          placeholder="Enter city/town"
          error={errors.placeOfBirth?.message}
          {...register('placeOfBirth')}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            submitText
          )}
        </Button>
      </form>
    </Card>
  );
}

// Matching Form (for two people)
interface MatchingFormProps {
  onSubmit: (boyData: KundliInput, girlData: KundliInput) => void;
  isLoading?: boolean;
}

export function MatchingForm({ onSubmit, isLoading }: MatchingFormProps) {
  const boyForm = useForm<KundliFormData>({
    resolver: zodResolver(kundliSchema),
  });

  const girlForm = useForm<KundliFormData>({
    resolver: zodResolver(kundliSchema),
  });

  const handleSubmit = () => {
    boyForm.handleSubmit((boyData) => {
      girlForm.handleSubmit((girlData) => {
        onSubmit(
          {
            ...boyData,
            latitude: boyData.latitude || 0,
            longitude: boyData.longitude || 0,
            timezone: boyData.timezone || 'Asia/Kolkata',
          },
          {
            ...girlData,
            latitude: girlData.latitude || 0,
            longitude: girlData.longitude || 0,
            timezone: girlData.timezone || 'Asia/Kolkata',
          }
        );
      })();
    })();
  };

  return (
    <div className="space-y-6">
      {/* Boy's Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Boy&apos;s Details
        </h3>
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            error={boyForm.formState.errors.name?.message}
            {...boyForm.register('name')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              error={boyForm.formState.errors.dateOfBirth?.message}
              {...boyForm.register('dateOfBirth')}
            />
            <Input
              label="Time of Birth"
              type="time"
              error={boyForm.formState.errors.timeOfBirth?.message}
              {...boyForm.register('timeOfBirth')}
            />
          </div>
          <Input
            label="Place of Birth"
            placeholder="Enter city/town"
            error={boyForm.formState.errors.placeOfBirth?.message}
            {...boyForm.register('placeOfBirth')}
          />
        </div>
      </Card>

      {/* Girl's Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Girl&apos;s Details
        </h3>
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Enter full name"
            error={girlForm.formState.errors.name?.message}
            {...girlForm.register('name')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              error={girlForm.formState.errors.dateOfBirth?.message}
              {...girlForm.register('dateOfBirth')}
            />
            <Input
              label="Time of Birth"
              type="time"
              error={girlForm.formState.errors.timeOfBirth?.message}
              {...girlForm.register('timeOfBirth')}
            />
          </div>
          <Input
            label="Place of Birth"
            placeholder="Enter city/town"
            error={girlForm.formState.errors.placeOfBirth?.message}
            {...girlForm.register('placeOfBirth')}
          />
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        type="button"
        variant="primary"
        className="w-full"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Match...
          </>
        ) : (
          'Check Compatibility'
        )}
      </Button>
    </div>
  );
}
