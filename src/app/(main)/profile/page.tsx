'use client';

import { useState } from 'react';
import { ProfileHeader, PersonalDetails, EditProfileForm } from '@/components/features/profile';
import { useUserProfile, useUpdateProfile, useUploadProfileImage } from '@/hooks/useUserProfile';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ArrowLeft, Wallet, History, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UpdateProfileData } from '@/types/api.types';

const MENU_ITEMS = [
  { icon: Wallet, label: 'My Wallet', href: '/wallet', color: 'text-primary' },
  { icon: History, label: 'Consultation History', href: '/history/chat', color: 'text-status-info' },
  { icon: Settings, label: 'Settings', href: '/settings', color: 'text-text-secondary' },
  { icon: HelpCircle, label: 'Help & Support', href: '/support', color: 'text-status-warning' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Auth protection - redirects to login if not authenticated
  const { isReady } = useRequireAuth();

  // Fetch profile data
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();

  // Mutations
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();

  // Handle profile update
  const handleUpdateProfile = (data: UpdateProfileData) => {
    updateProfile(data, {
      onSuccess: () => {
        setIsEditModalOpen(false);
        addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully.',
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: error instanceof Error ? error.message : 'Failed to update profile',
        });
      },
    });
  };

  // Handle image upload
  const handleImageUpload = (file: File) => {
    uploadImage(file, {
      onSuccess: () => {
        addToast({
          type: 'success',
          title: 'Image Updated',
          message: 'Your profile image has been updated.',
        });
      },
      onError: (error) => {
        addToast({
          type: 'error',
          title: 'Upload Failed',
          message: error instanceof Error ? error.message : 'Failed to upload image',
        });
      },
    });
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/login');
    }
  };

  // Show skeleton while auth is being checked or redirecting
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <div className="bg-primary rounded-b-3xl px-4 pt-6 pb-8">
          <div className="flex flex-col items-center">
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="w-32 h-6 mb-2" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  // Profile data loading state
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <div className="bg-primary rounded-b-3xl px-4 pt-6 pb-8">
          <div className="flex flex-col items-center">
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="w-32 h-6 mb-2" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-white p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        name={profile?.name || user?.name}
        phone={profile?.phone || user?.phone || ''}
        email={profile?.email || user?.email}
        profileImage={profile?.profileImage || user?.profileImage}
        onEditClick={() => setIsEditModalOpen(true)}
        onImageUpload={handleImageUpload}
        isUploading={isUploading}
      />

      {/* Content */}
      <div className="p-4 -mt-4 space-y-4">
        {/* Personal Details */}
        <PersonalDetails
          name={profile?.name}
          email={profile?.email}
          phone={profile?.phone || ''}
          dateOfBirth={profile?.dateOfBirth}
          placeOfBirth={profile?.placeOfBirth}
          timeOfBirth={profile?.timeOfBirth}
          gender={profile?.gender}
          maritalStatus={profile?.maritalStatus}
        />

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-0 overflow-hidden">
            {MENU_ITEMS.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index !== MENU_ITEMS.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-text-primary">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </Link>
            ))}
          </Card>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            className="w-full text-status-error border-status-error/30 hover:bg-status-error/5"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        {/* App Version */}
        <p className="text-center text-xs text-text-muted pt-4">
          NakshatraTalks v1.0.0
        </p>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        className="max-w-lg"
      >
        <EditProfileForm
          initialData={{
            name: profile?.name || undefined,
            email: profile?.email || undefined,
            dateOfBirth: profile?.dateOfBirth || undefined,
            timeOfBirth: profile?.timeOfBirth || undefined,
            placeOfBirth: profile?.placeOfBirth || undefined,
            gender: profile?.gender || undefined,
            maritalStatus: profile?.maritalStatus || undefined,
          }}
          onSubmit={handleUpdateProfile}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isUpdating}
        />
      </Modal>

      {/* Bottom padding for mobile nav */}
      <div className="h-24" />
    </div>
  );
}
