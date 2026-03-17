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
