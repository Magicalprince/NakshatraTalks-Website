'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import { UpdateProfileData } from '@/types/api.types';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  timeOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: UpdateProfileData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function EditProfileForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: EditProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      timeOfBirth: initialData?.timeOfBirth || '',
      placeOfBirth: initialData?.placeOfBirth || '',
      gender: initialData?.gender,
      maritalStatus: initialData?.maritalStatus,
    },
  });

  const handleFormSubmit = (data: ProfileFormData) => {
    // Filter out empty strings
    const cleanedData: UpdateProfileData = {};
    if (data.name) cleanedData.name = data.name;
    if (data.email) cleanedData.email = data.email;
    if (data.dateOfBirth) cleanedData.dateOfBirth = data.dateOfBirth;
    if (data.timeOfBirth) cleanedData.timeOfBirth = data.timeOfBirth;
    if (data.placeOfBirth) cleanedData.placeOfBirth = data.placeOfBirth;
    if (data.gender) cleanedData.gender = data.gender;
    if (data.maritalStatus) cleanedData.maritalStatus = data.maritalStatus;

    onSubmit(cleanedData);
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-6">
        Edit Profile
      </h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Name */}
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register('name')}
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
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

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Gender</label>
          <select
            {...register('gender')}
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-xs text-status-error">{errors.gender.message}</p>
          )}
        </div>

        {/* Marital Status */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary">Marital Status</label>
          <select
            {...register('maritalStatus')}
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
          {errors.maritalStatus && (
            <p className="text-xs text-status-error">{errors.maritalStatus.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={!isDirty || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
