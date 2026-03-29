import { createRootRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/context';

function RootComponent() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      void navigate({ to: '/login', replace: true });
    }
  }, [isLoading, user, isLoginPage, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoginPage) return <Outlet />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
      <Outlet />
    </div>
  );
}

export const Route = createRootRoute({ component: RootComponent });
