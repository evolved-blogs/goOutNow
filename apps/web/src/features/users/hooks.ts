import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserProfile, updateUserProfile, fetchUserActivity } from './api';
import type { UpdateProfileInput } from './types';

export const userKeys = {
  profile: (id: string) => ['users', 'profile', id] as const,
  activity: (id: string) => ['users', 'activity', id] as const,
};

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => fetchUserProfile(userId),
    enabled: Boolean(userId),
  });
}

export function useUserActivity(userId: string) {
  return useQuery({
    queryKey: userKeys.activity(userId),
    queryFn: () => fetchUserActivity(userId),
    enabled: Boolean(userId),
  });
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateUserProfile(userId, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(userKeys.profile(userId), updated);
    },
  });
}
