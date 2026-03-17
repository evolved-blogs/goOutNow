/**
 * Post Feature Types
 * Matches the backend API response types
 */

export interface Post {
  id: string;
  title: string;
  activityType: string;
  latitude: number;
  longitude: number;
  scheduledTime: string;
  createdById: string;
  memberCount: number;
  requiredPlayers: number;
  createdAt: string;
}

export interface PostWithDistance extends Post {
  distance: number; // Distance in kilometers
}

export interface CreatePostInput {
  title: string;
  activityType: string;
  latitude: number;
  longitude: number;
  scheduledTime: string;
  requiredPlayers: number;
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
