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
import { Wallet, History, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UpdateProfileData } from '@/types/api.types';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

const MENU_ITEMS = [
  {
    icon: Wallet,
    label: 'My Wallet',
    href: '/wallet',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-l-primary',
  },
  {
    icon: History,
    label: 'Consultation History',
    href: '/history/chat',
    color: 'text-status-info',
    bgColor: 'bg-status-info/10',
    borderColor: 'border-l-status-info',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
    color: 'text-text-secondary',
    bgColor: 'bg-gray-100',
    borderColor: 'border-l-text-secondary',
  },
  {
    icon: HelpCircle,
    label: 'Help & Support',
    href: '/support',
    color: 'text-status-warning',
    bgColor: 'bg-status-warning/10',
    borderColor: 'border-l-status-warning',
  },
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

  // Handle logout - directly log out without confirm dialog since it is not destructive
  const handleLogout = () => {
    logout();
    addToast({
      type: 'success',
      title: 'Logged Out',
      message: 'You have been logged out successfully.',
    });
    router.push('/login');
  };

  // Render shimmer skeleton loading state
  const renderSkeleton = () => (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        <div className="py-4">
          <Skeleton className="w-48 h-5 mb-6 rounded-lg skeleton-shimmer" />
          <Skeleton className="w-40 h-8 mb-8 rounded-lg skeleton-shimmer" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile header skeleton */}
              <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-6 skeleton-shimmer">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-24 h-24 rounded-full mb-4 skeleton-shimmer" />
                  <Skeleton className="h-6 w-40 mb-2 rounded skeleton-shimmer" />
                  <Skeleton className="h-4 w-32 mb-1 rounded skeleton-shimmer" />
                  <Skeleton className="h-3 w-44 rounded skeleton-shimmer" />
                </div>
              </div>
              {/* Personal details skeleton */}
              <div className="bg-white rounded-xl p-6 shadow-web-sm">
                <Skeleton className="h-5 w-36 mb-5 rounded skeleton-shimmer" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-20 rounded skeleton-shimmer" />
                      <Skeleton className="h-4 w-32 rounded skeleton-shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-web-sm">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full skeleton-shimmer" />
                    <Skeleton className="h-4 w-28 rounded skeleton-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );

  // Show skeleton while auth is being checked or redirecting
  if (!isReady) {
    return renderSkeleton();
  }

  // Profile data loading state
  if (isProfileLoading) {
    return renderSkeleton();
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Profile' },
          ]}
        />

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-text-primary font-lexend mb-6">My Profile</h1>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
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
          </div>

          {/* Sidebar - Quick Links */}
          <div className="lg:col-span-1 space-y-6">
            {/* Menu Items */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-0 overflow-hidden" padding="none">
                <nav aria-label="Quick links">
                  {MENU_ITEMS.map((item, index) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-label={`Go to ${item.label}`}
                      className={`group flex items-center justify-between p-4 hover:bg-background-offWhite transition-all duration-200 ${
                        index !== MENU_ITEMS.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 transition-transform duration-200 group-hover:translate-x-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bgColor} ${item.color}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-text-primary">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </nav>
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
                className="w-full text-status-error border-status-error/30 hover:bg-status-error/5 hover:border-status-error/50 transition-all duration-200"
                onClick={handleLogout}
                aria-label="Log out of your account"
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
        </div>
      </PageContainer>

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
    </div>
  );
}
