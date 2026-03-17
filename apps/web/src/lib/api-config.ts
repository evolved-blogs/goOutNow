/**
 * API Configuration
 * Centralized API base URL and endpoints
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  posts: {
    list: `${API_BASE_URL}/posts`,
    nearby: (lat: number, lng: number) =>
      `${API_BASE_URL}/posts/nearby?latitude=${lat}&longitude=${lng}`,
    byId: (id: string) => `${API_BASE_URL}/posts/${id}`,
    join: (id: string) => `${API_BASE_URL}/posts/${id}/join`,
    members: (id: string) => `${API_BASE_URL}/posts/${id}/members`,
    messages: (id: string) => `${API_BASE_URL}/posts/${id}/messages`,
    messagesStream: (id: string) => `${API_BASE_URL}/posts/${id}/messages/stream`,
  },
  chat: {
    list: `${API_BASE_URL}/chat`,
    send: `${API_BASE_URL}/chat`,
    stream: `${API_BASE_URL}/chat/stream`,
  },
} as const;
