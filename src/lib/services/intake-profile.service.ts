/**
 * Intake Profile Service
 * Manages birth detail profiles for consultations (self, spouse, child, etc.)
 * Matches mobile app's intake-profile.service.ts
 */

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse } from '@/types/api.types';

// ─── Types ──────────────────────────────────────────────────────────

export interface IntakeProfile {
  id: string;
  userId: string;
  name: string;
  relation: 'myself' | 'spouse' | 'child' | 'parent' | 'sibling' | 'friend' | 'other';
  dateOfBirth: string;
  placeOfBirth: string;
  timeOfBirth: string | null;
  timeOfBirthUnknown: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntakeProfileData {
  name: string;
  relation: IntakeProfile['relation'];
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string;
  timeOfBirth?: string; // HH:MM:SS or null
  timeOfBirthUnknown?: boolean;
}

export type UpdateIntakeProfileData = Partial<CreateIntakeProfileData>;

// ─── Normalization ──────────────────────────────────────────────────

function normalizeProfile(raw: Record<string, unknown>): IntakeProfile {
  return {
    id: (raw.id || raw.profile_id) as string,
    userId: (raw.userId || raw.user_id) as string,
    name: raw.name as string,
    relation: (raw.relation || 'other') as IntakeProfile['relation'],
    dateOfBirth: (raw.dateOfBirth || raw.date_of_birth) as string,
    placeOfBirth: (raw.placeOfBirth || raw.place_of_birth) as string,
    timeOfBirth: (raw.timeOfBirth || raw.time_of_birth || null) as string | null,
    timeOfBirthUnknown: Boolean(raw.timeOfBirthUnknown ?? raw.time_of_birth_unknown ?? false),
    isDefault: Boolean(raw.isDefault ?? raw.is_default ?? false),
    createdAt: (raw.createdAt || raw.created_at || '') as string,
    updatedAt: (raw.updatedAt || raw.updated_at || '') as string,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResponse<T>(raw: any): ApiResponse<T> {
  if (raw && typeof raw.success === 'boolean' && 'data' in raw) {
    return raw as ApiResponse<T>;
  }
  return { success: true, data: raw as T, message: undefined };
}

// ─── Service ────────────────────────────────────────────────────────

class IntakeProfileService {
  async listProfiles(): Promise<ApiResponse<IntakeProfile[]>> {
    const raw = await apiClient.get(API_ENDPOINTS.INTAKE_PROFILES.LIST);
    const response = normalizeResponse<IntakeProfile[]>(raw);
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map((p) => normalizeProfile(p as unknown as Record<string, unknown>));
    }
    return response;
  }

  async createProfile(data: CreateIntakeProfileData): Promise<ApiResponse<IntakeProfile>> {
    const raw = await apiClient.post(API_ENDPOINTS.INTAKE_PROFILES.CREATE, data);
    const response = normalizeResponse<IntakeProfile>(raw);
    if (response.data) {
      response.data = normalizeProfile(response.data as unknown as Record<string, unknown>);
    }
    return response;
  }

  async updateProfile(id: string, data: UpdateIntakeProfileData): Promise<ApiResponse<IntakeProfile>> {
    const raw = await apiClient.put(API_ENDPOINTS.INTAKE_PROFILES.UPDATE(id), data);
    const response = normalizeResponse<IntakeProfile>(raw);
    if (response.data) {
      response.data = normalizeProfile(response.data as unknown as Record<string, unknown>);
    }
    return response;
  }

  async deleteProfile(id: string): Promise<ApiResponse<{ success: boolean }>> {
    const raw = await apiClient.delete(API_ENDPOINTS.INTAKE_PROFILES.DELETE(id));
    return normalizeResponse(raw);
  }

  async setDefault(id: string): Promise<ApiResponse<IntakeProfile>> {
    const raw = await apiClient.patch(API_ENDPOINTS.INTAKE_PROFILES.SET_DEFAULT(id));
    const response = normalizeResponse<IntakeProfile>(raw);
    if (response.data) {
      response.data = normalizeProfile(response.data as unknown as Record<string, unknown>);
    }
    return response;
  }
}

export const intakeProfileService = new IntakeProfileService();
