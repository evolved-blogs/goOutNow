/**
 * Post Form Configuration
 * TanStack Form schema and validation using Zod
 * Separated from UI components for reusability
 */

import { z } from 'zod';

/**
 * Create Post Form Schema
 * Validates all required fields with proper constraints
 */
export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),

  activityType: z.string().min(2, 'Activity type is required'),

  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),

  scheduledTime: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, 'Scheduled time must be in the future'),

  requiredPlayers: z
    .number()
    .min(2, 'At least 2 players are required')
    .max(100, 'Maximum 100 players allowed'),

  createdById: z.string().min(1, 'User ID is required'),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;

/**
 * Activity type options
 */
export const ACTIVITY_TYPES = [
  { value: 'cricket', label: 'Cricket' },
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'badminton', label: 'Badminton' },
  { value: 'volleyball', label: 'Volleyball' },
] as const;

/**
 * Default form values
 */
export const DEFAULT_FORM_VALUES: CreatePostFormData = {
  title: '',
  activityType: '',
  latitude: 0,
  longitude: 0,
  scheduledTime: '',
  requiredPlayers: 6,
  createdById: 'demo-user-id', // TODO: Replace with actual user ID from auth
};
