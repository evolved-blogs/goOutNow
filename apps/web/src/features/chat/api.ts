import { API_ENDPOINTS } from '../../lib/api-config';
import type { GlobalMessage } from './types';

export async function fetchGlobalMessages(): Promise<GlobalMessage[]> {
  const res = await fetch(API_ENDPOINTS.chat.list);
  if (!res.ok) throw new Error('Failed to fetch global chat messages');
  return res.json() as Promise<GlobalMessage[]>;
}

export async function sendGlobalMessage(userId: string, text: string): Promise<GlobalMessage> {
  const res = await fetch(API_ENDPOINTS.chat.send, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, text }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json() as Promise<GlobalMessage>;
}
