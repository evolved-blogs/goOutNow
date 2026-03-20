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

  description: z.string().max(500, 'Description must be less than 500 characters').optional(),

  activityType: z.string().min(1, 'Activity type is required'),

  vibe: z.enum(['Chill', 'Energetic', 'Creative', 'Networking', 'Fun']).optional(),

  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),

  scheduledTime: z.string().refine((val) => {
    if (!val || !val.includes('T')) return false;
    const date = new Date(val);
    return !isNaN(date.getTime()) && date > new Date();
  }, 'Scheduled time must be a valid date and time in the future'),

  requiredParticipants: z
    .number()
    .min(1, 'At least 1 person is required')
    .max(100, 'Maximum 100 people allowed'),

  rolesNeeded: z
    .array(
      z.object({
        role: z.string().min(1, 'Role name is required'),
        count: z.number().int().min(1, 'Count must be at least 1'),
      }),
    )
    .optional(),

  createdById: z.string().min(1, 'User ID is required'),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;

/**
 * Activity type options
 */
export const ACTIVITY_TYPES = [
  { value: 'sports', label: '⚽ Sports' },
  { value: 'music', label: '🎸 Music' },
  { value: 'social', label: '☕ Social' },
  { value: 'fitness', label: '🏋️ Fitness' },
  { value: 'learning', label: '📚 Learning' },
  { value: 'creative', label: '🎨 Creative' },
  { value: 'other', label: '✨ Other' },
] as const;

/**
 * Default form values
 */
export const DEFAULT_FORM_VALUES: CreatePostFormData = {
  title: '',
  description: '',
  activityType: '',
  vibe: undefined,
  latitude: 0,
  longitude: 0,
  scheduledTime: '',
  requiredParticipants: 4,
  rolesNeeded: [],
  createdById: 'demo-user-id', // TODO: Replace with actual user ID from auth
};
