import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
          <nav className="bg-white border-b border-slate-200 w-full sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 w-full">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => (window.location.href = '/')}
                >
                  <img src="/src/assets/logo.svg" alt="GoOutNow logo" className="w-10 h-10" />
                  <span className="text-2xl font-bold text-slate-900">GoOutNow</span>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <Link
                    to="/"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                    activeProps={{ className: 'text-blue-600 hover:text-blue-700' }}
                  >
                    Nearby Activities
                  </Link>
                  <Link
                    to="/create"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                    activeProps={{ className: 'text-blue-600 hover:text-blue-700' }}
                  >
                    Create Activity
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="w-full">
            <Outlet />
          </main>
        </div>
      </>
    );
  },
});
