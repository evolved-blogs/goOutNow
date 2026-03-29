/**
 * HeroNav — nav icon row designed to be embedded inside each page's gradient hero section.
 * Shows logo/brand on the left and Home / Search / Create / Profile icons on the right.
 * Reads the current pathname itself so callers need no extra props.
 */

import { Link, useRouterState } from '@tanstack/react-router';
import { Home, Search, Plus, User } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export function HeroNav() {
  const { location } = useRouterState();
  const pathname = location.pathname;

  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2">
        <img
          src="/logo.svg"
          alt="GoOutNow"
          className="w-8 h-8 rounded-lg bg-white/20 object-contain"
        />
        <span className="text-white font-bold text-base hidden sm:block">GoOutNow</span>
      </Link>

      {/* Nav icons */}
      <div className="flex items-center gap-1">
        <Link
          to="/"
          className={cn(
            'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-colors',
            pathname === '/' ? 'bg-white/20' : 'hover:bg-white/10',
          )}
          aria-label="Home"
        >
          <Home className="w-5 h-5 text-white" strokeWidth={pathname === '/' ? 2.5 : 1.5} />
          <span
            className={cn(
              'text-[10px] font-medium',
              pathname === '/' ? 'text-white' : 'text-white/70',
            )}
          >
            Home
          </span>
        </Link>

        <Link
          to="/search"
          className={cn(
            'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-colors',
            pathname === '/search' ? 'bg-white/20' : 'hover:bg-white/10',
          )}
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-white" strokeWidth={pathname === '/search' ? 2.5 : 1.5} />
          <span
            className={cn(
              'text-[10px] font-medium',
              pathname === '/search' ? 'text-white' : 'text-white/70',
            )}
          >
            Search
          </span>
        </Link>

        <Link
          to="/create"
          className={cn(
            'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-colors',
            pathname === '/create' ? 'bg-white/20' : 'hover:bg-white/10',
          )}
          aria-label="Create"
        >
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
              pathname === '/create' ? 'bg-white/40' : 'bg-white/20',
            )}
          >
            <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span
            className={cn(
              'text-[10px] font-medium',
              pathname === '/create' ? 'text-white' : 'text-white/70',
            )}
          >
            Create
          </span>
        </Link>

        <Link
          to="/profile"
          className={cn(
            'flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-colors',
            pathname === '/profile' ? 'bg-white/20' : 'hover:bg-white/10',
          )}
          aria-label="Profile"
        >
          <User className="w-5 h-5 text-white" strokeWidth={pathname === '/profile' ? 2.5 : 1.5} />
          <span
            className={cn(
              'text-[10px] font-medium',
              pathname === '/profile' ? 'text-white' : 'text-white/70',
            )}
          >
            Profile
          </span>
        </Link>
      </div>
    </div>
  );
}
