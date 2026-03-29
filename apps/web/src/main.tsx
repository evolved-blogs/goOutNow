/**
 * Application Entry Point
 * Sets up TanStack Router, TanStack Query, and Auth providers
 */

import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { queryClient } from './lib/query-client';
import { routeTree } from './routeTree.gen';
import { AuthProvider } from './features/auth/context';
import './index.css';

// window.userId / window.nickname are set by AuthProvider once the session is restored
declare global {
  interface Window {
    userId: string;
    nickname: string;
  }
}
window.userId = '';
window.nickname = '';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
