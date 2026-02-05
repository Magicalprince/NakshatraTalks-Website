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
} from 'lucide-react';

export default function AstrologerProfilePage() {
  const { astrologer, isHydrated } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: astrologer?.bio || '',
    experience: astrologer?.experience?.toString() || '',
    chatRate: astrologer?.chatPricePerMinute?.toString() || '',
    callRate: astrologer?.callPricePerMinute?.toString() || '',
  });

  const handleSave = () => {
    // Would call API to update profile
    setIsEditing(false);
  };

  if (!isHydrated) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <Skeleton className="w-full h-48" />
        <Skeleton className="w-full h-32" />
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="text-text-secondary text-sm">Manage your public profile</p>
        </div>
        <Button onClick={() => setIsEditing(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
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
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Star className="w-4 h-4 text-secondary fill-secondary" />
              <span className="font-semibold">{astrologer?.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-text-muted text-sm">
                ({astrologer?.totalReviews || 0} reviews)
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold text-text-primary">{astrologer?.name}</h2>
              {astrologer?.status === 'approved' && (
                <Badge variant="success" className="text-xs">Verified</Badge>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-text-secondary">
                <Award className="w-4 h-4" />
                {astrologer?.specialization?.join(', ') || 'Not specified'}
              </p>
              <p className="flex items-center gap-2 text-text-secondary">
                <Clock className="w-4 h-4" />
                {astrologer?.experience || 0} years experience
              </p>
              <p className="flex items-center gap-2 text-text-secondary">
                <Languages className="w-4 h-4" />
                {astrologer?.languages?.join(', ') || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-semibold text-text-primary mb-2">About</h3>
          <p className="text-text-secondary text-sm">
            {astrologer?.bio || 'No bio added yet. Click Edit Profile to add your bio.'}
          </p>
        </div>
      </Card>

      {/* Rates */}
      <Card className="p-6">
        <h3 className="font-semibold text-text-primary mb-4">Consultation Rates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-status-info" />
              <span className="font-medium">Chat</span>
            </div>
            <p className="text-xl font-bold text-text-primary flex items-center">
              <IndianRupee className="w-4 h-4" />
              {astrologer?.chatPricePerMinute || 0}
              <span className="text-sm text-text-muted font-normal ml-1">/min</span>
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-status-success" />
              <span className="font-medium">Call</span>
            </div>
            <p className="text-xl font-bold text-text-primary flex items-center">
              <IndianRupee className="w-4 h-4" />
              {astrologer?.callPricePerMinute || 0}
              <span className="text-sm text-text-muted font-normal ml-1">/min</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="p-6">
        <h3 className="font-semibold text-text-primary mb-4">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Email</p>
              <p className="text-sm font-medium">{astrologer?.email || 'Not added'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-text-muted" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Phone</p>
              <p className="text-sm font-medium">{astrologer?.phone || 'Not added'}</p>
            </div>
          </div>
        </div>
      </Card>

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
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px]"
              placeholder="Tell users about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Years of Experience
            </label>
            <Input
              type="number"
              value={editData.experience}
              onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Chat Rate (₹/min)
              </label>
              <Input
                type="number"
                value={editData.chatRate}
                onChange={(e) => setEditData({ ...editData, chatRate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Call Rate (₹/min)
              </label>
              <Input
                type="number"
                value={editData.callRate}
                onChange={(e) => setEditData({ ...editData, callRate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
