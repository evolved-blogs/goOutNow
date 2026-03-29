import { API_ENDPOINTS } from '@/lib/api-config';
import type { UserProfile, RecentActivity, UpdateProfileInput } from './types';

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const res = await fetch(API_ENDPOINTS.users.profile(userId));
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json() as Promise<UserProfile>;
}

export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput,
): Promise<UserProfile> {
  const res = await fetch(API_ENDPOINTS.users.update(userId), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json() as Promise<UserProfile>;
}

export async function fetchUserActivity(userId: string): Promise<RecentActivity[]> {
  const res = await fetch(API_ENDPOINTS.users.activity(userId));
  if (!res.ok) throw new Error('Failed to fetch activity');
  return res.json() as Promise<RecentActivity[]>;
}
