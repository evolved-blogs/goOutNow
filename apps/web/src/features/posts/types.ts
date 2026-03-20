/**
 * Post Feature Types
 * Matches the backend API response types
 */

export interface Post {
  id: string;
  title: string;
  description?: string;
  activityType: string;
  vibe?: string;
  latitude: number;
  longitude: number;
  scheduledTime: string;
  createdById: string;
  memberCount: number;
  requiredParticipants: number;
  rolesNeeded?: { role: string; count: number }[];
  createdAt: string;
}

export interface PostWithDistance extends Post {
  distance: number; // Distance in kilometers
}

export interface CreatePostInput {
  title: string;
  description?: string;
  activityType: string;
  vibe?: string;
  latitude: number;
  longitude: number;
  scheduledTime: string;
  requiredParticipants: number;
  rolesNeeded?: { role: string; count: number }[];
  createdById: string;
}

export interface JoinPostInput {
  userId: string;
}

export interface NearbyPostsParams {
  latitude: number;
  longitude: number;
}

export interface PostMember {
  userId: string;
  joinedAt: string;
}

export interface PostMessage {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  postId: string;
  fromUserId: string;
  activityRating: number;
  organizerRating: number;
  comment: string | null;
  createdAt: string;
}

export interface FeedbackSummary {
  totalFeedbacks: number;
  avgActivityRating: number;
  avgOrganizerRating: number;
  feedbacks: Feedback[];
}

export interface CreateFeedbackInput {
  fromUserId: string;
  activityRating: number;
  organizerRating: number;
  comment?: string;
}

export interface PendingFeedbackItem {
  postId: string;
  title: string;
  activityType: string;
  scheduledTime: string;
  createdById: string;
  memberCount: number;
}
