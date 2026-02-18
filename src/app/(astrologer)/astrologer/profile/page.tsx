'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import {
  Mail,
  Phone,
  Star,
  Languages,
  Award,
  Clock,
  Edit,
  Camera,
  IndianRupee,
  BarChart3,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { QuickLinks, type QuickLinkItem } from '@/components/shared';

const SIDEBAR_LINKS: QuickLinkItem[] = [
  {
    icon: BarChart3,
    label: 'Earnings',
    href: '/astrologer/earnings',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/astrologer/settings',
    color: 'text-text-secondary',
    bgColor: 'bg-gray-100',
  },
];

export default function AstrologerProfilePage() {
  const { astrologer, isHydrated } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: astrologer?.bio || '',
    experience: astrologer?.experience?.toString() || '',
    chatRate: astrologer?.chatPricePerMinute?.toString() || '',
    callRate: astrologer?.callPricePerMinute?.toString() || '',
  });

  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const validateEditData = () => {
    const errors: Record<string, string> = {};
    if (!editData.bio.trim()) errors.bio = 'Bio is required';
    const exp = Number(editData.experience);
    if (!editData.experience || isNaN(exp) || exp < 0 || exp > 60) errors.experience = 'Enter valid experience (0-60 years)';
    const chat = Number(editData.chatRate);
    if (!editData.chatRate || isNaN(chat) || chat < 1) errors.chatRate = 'Enter a valid chat rate';
    const call = Number(editData.callRate);
    if (!editData.callRate || isNaN(call) || call < 1) errors.callRate = 'Enter a valid call rate';
    return errors;
  };

  const handleSave = () => {
    const errors = validateEditData();
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;
    // Would call API to update profile
    setIsEditing(false);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background-offWhite">
        <PageContainer size="lg">
          <div className="py-4">
            <Skeleton className="w-48 h-5 mb-6 rounded-lg skeleton-shimmer" />
            <Skeleton className="w-40 h-8 mb-8 rounded-lg skeleton-shimmer" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl overflow-hidden shadow-web-sm">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <Skeleton className="w-24 h-24 rounded-full skeleton-shimmer" />
                      <div className="space-y-2">
                        <Skeleton className="w-40 h-6 rounded skeleton-shimmer" />
                        <Skeleton className="w-60 h-4 rounded skeleton-shimmer" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <Skeleton className="w-48 h-4 rounded skeleton-shimmer" />
                    <Skeleton className="w-52 h-4 rounded skeleton-shimmer" />
                    <Skeleton className="w-40 h-4 rounded skeleton-shimmer" />
                  </div>
                </div>
                <Skeleton className="w-full h-32 rounded-xl skeleton-shimmer" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
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
  }

  return (
    <div className="min-h-screen bg-background-offWhite">
      <PageContainer size="lg">
        <Breadcrumbs items={[
          { label: 'Dashboard', href: '/astrologer/dashboard' },
          { label: 'Profile' },
        ]} />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-text-primary font-lexend">Profile</h1>
          <Button onClick={() => setIsEditing(true)} className="shadow-web-sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* 2-column layout (like user profile) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden shadow-web-sm" padding="none">
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 px-6 pt-6 pb-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center overflow-hidden shadow-web-sm">
                        {astrologer?.image ? (
                          <Image
                            src={astrologer.image}
                            alt={astrologer.name}
                            width={96}
                            height={96}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-primary">
                            {astrologer?.name?.charAt(0) || 'A'}
                          </span>
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Name & Quick Info */}
                    <div className="text-center md:text-left">
                      <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                        <h2 className="text-xl font-bold text-text-primary font-lexend">{astrologer?.name}</h2>
                        {astrologer?.status === 'approved' && (
                          <Badge variant="success" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 justify-center md:justify-start">
                        <Star className="w-4 h-4 text-secondary fill-secondary" />
                        <span className="font-semibold text-sm">{astrologer?.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-text-muted text-xs">
                          ({astrologer?.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="w-4 h-4 text-primary" />
                    </div>
                    {astrologer?.specialization?.join(', ') || 'Not specified'}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="w-8 h-8 rounded-full bg-status-info/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-status-info" />
                    </div>
                    {astrologer?.experience || 0} years experience
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <div className="w-8 h-8 rounded-full bg-status-warning/10 flex items-center justify-center">
                      <Languages className="w-4 h-4 text-status-warning" />
                    </div>
                    {astrologer?.languages?.join(', ') || 'Not specified'}
                  </div>
                </div>

                {/* Bio */}
                <div className="px-6 pb-6 pt-0">
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-text-primary font-lexend mb-2">About</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {astrologer?.bio || 'No bio added yet. Click Edit Profile to add your bio.'}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Rates */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-status-info/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-status-info" />
                    </div>
                    <span className="font-medium font-lexend">Chat</span>
                  </div>
                  <p className="text-xl font-bold text-text-primary font-lexend flex items-center">
                    <IndianRupee className="w-4 h-4" />
                    {astrologer?.chatPricePerMinute || 0}
                    <span className="text-sm text-text-muted font-normal ml-1">/min</span>
                  </p>
                </Card>

                <Card className="p-4 shadow-web-sm hover:shadow-web-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-status-success/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-status-success" />
                    </div>
                    <span className="font-medium font-lexend">Call</span>
                  </div>
                  <p className="text-xl font-bold text-text-primary font-lexend flex items-center">
                    <IndianRupee className="w-4 h-4" />
                    {astrologer?.callPricePerMinute || 0}
                    <span className="text-sm text-text-muted font-normal ml-1">/min</span>
                  </p>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="p-0 overflow-hidden shadow-web-sm" padding="none">
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Email</p>
                    <p className="text-sm font-medium">{astrologer?.email || 'Not added'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-status-success/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-status-success" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Phone</p>
                    <p className="text-sm font-medium">{astrologer?.phone || 'Not added'}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <QuickLinks items={SIDEBAR_LINKS} />
            </motion.div>
          </div>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Profile"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => { setEditData({ ...editData, bio: e.target.value }); setEditErrors((prev) => ({ ...prev, bio: '' })); }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] ${editErrors.bio ? 'border-status-error focus:ring-status-error/20' : ''}`}
                placeholder="Tell users about yourself..."
              />
              {editErrors.bio && <p className="text-xs text-status-error mt-1">{editErrors.bio}</p>}
            </div>

            <Input
              label="Years of Experience"
              type="number"
              value={editData.experience}
              onChange={(e) => { setEditData({ ...editData, experience: e.target.value }); setEditErrors((prev) => ({ ...prev, experience: '' })); }}
              error={editErrors.experience}
              min={0}
              max={60}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Chat Rate (₹/min)"
                type="number"
                value={editData.chatRate}
                onChange={(e) => { setEditData({ ...editData, chatRate: e.target.value }); setEditErrors((prev) => ({ ...prev, chatRate: '' })); }}
                error={editErrors.chatRate}
                min={1}
              />
              <Input
                label="Call Rate (₹/min)"
                type="number"
                value={editData.callRate}
                onChange={(e) => { setEditData({ ...editData, callRate: e.target.value }); setEditErrors((prev) => ({ ...prev, callRate: '' })); }}
                error={editErrors.callRate}
                min={1}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => { setIsEditing(false); setEditErrors({}); }}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      </PageContainer>
    </div>
  );
}
