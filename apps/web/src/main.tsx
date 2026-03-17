/**
 * Application Entry Point
 * Sets up TanStack Router and TanStack Query providers
 */

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { queryClient } from './lib/query-client';
import { routeTree } from './routeTree.gen';
import { v4 as uuidv4 } from 'uuid';

declare global {
  interface Window {
    userId: string;
    nickname: string;
  }
}
import './index.css';

// Create router instance
const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;

// Generate and store userId in localStorage if not present
const USER_ID_KEY = 'userId';
let userId = localStorage.getItem(USER_ID_KEY);
if (!userId) {
  userId = uuidv4();
  localStorage.setItem(USER_ID_KEY, userId);
}

// Optionally, make userId globally accessible
window.userId = userId;

// Soft identity: nickname stored locally
const NICKNAME_KEY = 'nickname';
let nickname = localStorage.getItem(NICKNAME_KEY);
if (!nickname) {
  // Default nickname: Player-XXXX using last 4 chars of userId
  nickname = `Player-${userId.slice(-4)}`;
  localStorage.setItem(NICKNAME_KEY, nickname);
}
window.nickname = nickname;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
