/**
 * Post Feature Hooks
 * TanStack Query hooks for server state management
 * All hooks isolated from UI components
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '../../lib/api-config';
import type { NearbyPostsParams, CreatePostInput, JoinPostInput, PostMessage } from './types';
import {
  fetchNearbyPosts,
  createPost,
  joinPost,
  fetchPostById,
  fetchPostMembers,
  fetchMessages,
  sendMessage,
} from './api';

/**
 * Query keys for cache management
 */
export const postKeys = {
  all: ['posts'] as const,
  nearby: (params: NearbyPostsParams) => [...postKeys.all, 'nearby', params] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
  members: (id: string) => [...postKeys.all, 'members', id] as const,
  messages: (id: string) => [...postKeys.all, 'messages', id] as const,
};

/**
 * Hook to fetch nearby posts
 * Automatically handles loading, error, and data states
 */
export function useNearbyPosts(params: NearbyPostsParams) {
  return useQuery({
    queryKey: postKeys.nearby(params),
    queryFn: () => fetchNearbyPosts(params),
    enabled: Boolean(params.latitude && params.longitude),
  });
}

/**
 * Hook to fetch a single post
 */
export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => fetchPostById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to fetch members of a post (shown to creator only in the UI)
 */
export function usePostMembers(postId: string, enabled = true) {
  return useQuery({
    queryKey: postKeys.members(postId),
    queryFn: () => fetchPostMembers(postId),
    enabled: Boolean(postId) && enabled,
  });
}

/**
 * Hook to create a post
 * Includes optimistic updates and cache invalidation
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => createPost(input),
    onSuccess: () => {
      // Invalidate nearby posts query to refetch
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

/**
 * Hook to join a post
 * Includes optimistic updates
 */
export function useJoinPost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: JoinPostInput) => joinPost(postId, input),
    onSuccess: () => {
      // Invalidate post detail and nearby posts
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}

/**
 * Hook to subscribe to messages for a post via SSE (instant delivery).
 * - Initial load: REST fetch (fetchMessages)
 * - Live updates: EventSource on /messages/stream appends new messages
 *   directly into the query cache without a full re-fetch.
 */
export function useMessages(postId: string) {
  const queryClient = useQueryClient();

  // Seed the cache with the existing messages on mount
  const query = useQuery({
    queryKey: postKeys.messages(postId),
    queryFn: () => fetchMessages(postId),
    enabled: Boolean(postId),
  });

  // Open an SSE connection for real-time new messages
  useEffect(() => {
    if (!postId) return;

    const url = API_ENDPOINTS.posts.messagesStream(postId);
    const es = new EventSource(url);

    es.onmessage = (event: MessageEvent) => {
      const msg: PostMessage = JSON.parse(event.data as string);
      queryClient.setQueryData<PostMessage[]>(postKeys.messages(postId), (prev) =>
        prev ? [...prev, msg] : [msg],
      );
    };

    es.onerror = () => {
      // Browser will auto-reconnect; nothing extra needed here
    };

    return () => es.close();
  }, [postId, queryClient]);

  return query;
}

/**
 * Hook to send a message for a post.
 * Invalidates messages on success so the list refreshes.
 */
export function useSendMessage(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; text: string }) =>
      sendMessage(postId, input.userId, input.text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.messages(postId) });
    },
  });
}
