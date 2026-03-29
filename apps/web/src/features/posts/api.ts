/**
 * Post Feature API Layer
 * All API calls isolated from UI components
 * Uses fetch API with proper error handling
 */

import { API_ENDPOINTS } from '@/lib/api-config';
import type {
  Post,
  PostWithDistance,
  CreatePostInput,
  JoinPostInput,
  NearbyPostsParams,
  PostMember,
  PostMessage,
  FeedbackSummary,
  CreateFeedbackInput,
  PendingFeedbackItem,
} from './types';

/**
 * Fetches nearby posts based on user location
 */
export async function fetchNearbyPosts(params: NearbyPostsParams): Promise<PostWithDistance[]> {
  const response = await fetch(API_ENDPOINTS.posts.nearby(params.latitude, params.longitude));

  if (!response.ok) {
    throw new Error('Failed to fetch nearby posts');
  }

  return response.json();
}

/**
 * Creates a new post
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  const response = await fetch(API_ENDPOINTS.posts.list, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create post');
  }

  return response.json();
}

/**
 * Joins a post
 */
export async function joinPost(postId: string, input: JoinPostInput): Promise<Post> {
  const response = await fetch(API_ENDPOINTS.posts.join(postId), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to join post');
  }

  return response.json();
}

/**
 * Fetches a single post by ID
 */
export async function fetchPostById(id: string): Promise<Post> {
  const response = await fetch(API_ENDPOINTS.posts.byId(id));

  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }

  return response.json();
}

/**
 * Fetches the list of members for a post (creator-only view)
 */
export async function fetchPostMembers(postId: string): Promise<PostMember[]> {
  const response = await fetch(API_ENDPOINTS.posts.members(postId));

  if (!response.ok) {
    throw new Error('Failed to fetch post members');
  }

  return response.json();
}

/**
 * Fetches all posts created by a specific user
 */
export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const response = await fetch(API_ENDPOINTS.posts.byUser(userId));
  if (!response.ok) throw new Error('Failed to fetch user posts');
  return response.json();
}

/**
 * Fetches all chat messages for a post
 */
export async function fetchMessages(postId: string): Promise<PostMessage[]> {
  const response = await fetch(API_ENDPOINTS.posts.messages(postId));
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
}

/**
 * Sends a chat message to a post
 */
export async function sendMessage(
  postId: string,
  userId: string,
  text: string,
): Promise<PostMessage> {
  const response = await fetch(API_ENDPOINTS.posts.messages(postId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, text }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

/**
 * Fetches feedback summary (ratings + all feedbacks) for a post
 */
export async function fetchFeedbackSummary(postId: string): Promise<FeedbackSummary> {
  const response = await fetch(API_ENDPOINTS.posts.feedback(postId));
  if (!response.ok) throw new Error('Failed to fetch feedback');
  return response.json();
}

/**
 * Submit feedback for an activity
 */
export async function submitFeedback(
  postId: string,
  input: CreateFeedbackInput,
): Promise<{ id: string }> {
  const response = await fetch(API_ENDPOINTS.posts.feedback(postId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to submit feedback');
  }
  return response.json();
}

/**
 * Check if current user has already submitted feedback for a post
 */
export async function checkFeedbackSubmitted(
  postId: string,
  userId: string,
): Promise<{ submitted: boolean }> {
  const response = await fetch(API_ENDPOINTS.posts.feedbackCheck(postId, userId));
  if (!response.ok) throw new Error('Failed to check feedback status');
  return response.json();
}

/**
 * Fetch pending feedback items (completed activities not yet rated by user)
 */
export async function fetchPendingFeedback(userId: string): Promise<PendingFeedbackItem[]> {
  const response = await fetch(API_ENDPOINTS.feedback.pending(userId));
  if (!response.ok) throw new Error('Failed to fetch pending feedback');
  return response.json();
}
