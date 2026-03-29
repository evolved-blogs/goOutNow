import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNearbyPosts } from '@/features/posts/hooks';
import { PostCard } from '@/features/posts/components/PostCard';
import { HeroNav } from '@/shared/ui/HeroNav';

export const Route = createFileRoute('/search')({ component: SearchPage });

const DEFAULT_LOCATION = { latitude: 13.0827, longitude: 80.2707 };

function SearchPage() {
  const [query, setQuery] = useState('');

  const { data: posts = [], isLoading } = useNearbyPosts(DEFAULT_LOCATION);

  const filtered = query.trim()
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.description?.toLowerCase().includes(query.toLowerCase()) ||
          p.activityType.toLowerCase().includes(query.toLowerCase()),
      )
    : posts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero: nav + search bar on purple gradient ── */}
      <div style={{ background: 'linear-gradient(to right, #7C3AED, #6D28D9, #5B21B6)' }}>
        <HeroNav />
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-white/70 shrink-0" />
            <input
              type="search"
              placeholder="Search activities…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-white/60 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="w-full max-w-7xl mx-auto px-4 py-4">
        {isLoading ? (
          <p className="text-center text-slate-500 py-12">Loading activities…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-purple-300" />
            </div>
            <p className="text-slate-500 font-medium">
              {query ? `No activities matching "${query}"` : 'No activities found'}
            </p>
            <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-600 mb-3">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
