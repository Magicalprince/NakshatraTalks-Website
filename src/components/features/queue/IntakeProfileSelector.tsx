'use client';

/**
 * IntakeProfileSelector — Modal to select or create an intake profile
 * before initiating a chat request. Backend requires intakeProfileId.
 * Matches mobile app flow: choose existing profile or create new one.
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { intakeProfileService, IntakeProfile, CreateIntakeProfileData } from '@/lib/services/intake-profile.service';
import { User, Plus, Check, Calendar, MapPin, Clock, Loader2 } from 'lucide-react';

interface IntakeProfileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (profileId: string) => void;
  astrologerName?: string;
}

export function IntakeProfileSelector({
  isOpen,
  onClose,
  onSelect,
  astrologerName,
}: IntakeProfileSelectorProps) {
  const [profiles, setProfiles] = useState<IntakeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [formData, setFormData] = useState<CreateIntakeProfileData>({
    name: '',
    relation: 'myself',
    dateOfBirth: '',
    placeOfBirth: '',
    timeOfBirth: '',
    timeOfBirthUnknown: false,
  });

  // Fetch profiles on open
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    (async () => {
      try {
        const response = await intakeProfileService.listProfiles();
        const data = response.data || [];
        setProfiles(data);
        // Auto-select default profile
        const defaultProfile = data.find((p) => p.isDefault) || data[0];
        if (defaultProfile) {
          setSelectedId(defaultProfile.id);
        }
      } catch {
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    if (selectedId) {
      onSelect(selectedId);
    }
  }, [selectedId, onSelect]);

  const handleCreate = useCallback(async () => {
    if (!formData.name.trim() || !formData.dateOfBirth || !formData.placeOfBirth.trim()) return;
    setCreating(true);
    try {
      const response = await intakeProfileService.createProfile({
        ...formData,
        name: formData.name.trim(),
        placeOfBirth: formData.placeOfBirth.trim(),
        timeOfBirth: formData.timeOfBirthUnknown ? undefined : formData.timeOfBirth || undefined,
      });
      if (response.data) {
        setProfiles((prev) => [...prev, response.data!]);
        setSelectedId(response.data.id);
        setShowCreateForm(false);
      }
    } catch {
      // Error handled silently
    } finally {
      setCreating(false);
    }
  }, [formData]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const RELATIONS: { value: CreateIntakeProfileData['relation']; label: string }[] = [
    { value: 'myself', label: 'Myself' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'child', label: 'Child' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-5 max-w-md mx-auto">
        <h2 className="text-lg font-bold font-lexend text-gray-900 mb-1">
          Select Birth Profile
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {astrologerName
            ? `Share your birth details with ${astrologerName} for accurate consultation.`
            : 'Choose a birth profile to share with the astrologer.'}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : showCreateForm ? (
          /* ── Create New Profile Form ── */
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Enter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
              <div className="flex flex-wrap gap-1.5">
                {RELATIONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, relation: r.value }))}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      formData.relation === r.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData((p) => ({ ...p, dateOfBirth: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth *</label>
              <input
                type="text"
                value={formData.placeOfBirth}
                onChange={(e) => setFormData((p) => ({ ...p, placeOfBirth: e.target.value }))}
                placeholder="e.g., Chennai, Tamil Nadu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time of Birth</label>
              {!formData.timeOfBirthUnknown && (
                <input
                  type="time"
                  value={formData.timeOfBirth || ''}
                  onChange={(e) => setFormData((p) => ({ ...p, timeOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary mb-1.5"
                />
              )}
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.timeOfBirthUnknown || false}
                  onChange={(e) => setFormData((p) => ({ ...p, timeOfBirthUnknown: e.target.checked, timeOfBirth: '' }))}
                  className="rounded border-gray-300"
                />
                I don&apos;t know the exact time
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>
                Back
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCreate}
                disabled={creating || !formData.name.trim() || !formData.dateOfBirth || !formData.placeOfBirth.trim()}
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Continue'}
              </Button>
            </div>
          </div>
        ) : (
          /* ── Profile List ── */
          <div>
            {profiles.length > 0 ? (
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedId(profile.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                      selectedId === profile.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        selectedId === profile.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {selectedId === profile.id ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 truncate">{profile.name}</span>
                          {profile.isDefault && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium">Default</span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full capitalize">{profile.relation}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(profile.dateOfBirth)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {profile.placeOfBirth}
                          </span>
                          {profile.timeOfBirth && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {profile.timeOfBirth}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 mb-4">
                <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No birth profiles found.</p>
                <p className="text-xs text-gray-400">Create one to share your details with the astrologer.</p>
              </div>
            )}

            {/* Add New Profile Button */}
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="w-full p-2.5 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 mb-4"
            >
              <Plus className="w-4 h-4" />
              Create New Profile
            </button>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleConfirm}
                disabled={!selectedId}
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
