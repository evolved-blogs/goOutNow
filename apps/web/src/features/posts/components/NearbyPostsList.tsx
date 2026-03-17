/**
 * Nearby Posts List Component
 * Displays list of nearby posts using TanStack Query
 * Handles loading and error states
 */

import { Loader2, MapPin } from 'lucide-react';
import { useNearbyPosts } from '../hooks';
import { PostCard } from './PostCard';
import type { NearbyPostsParams } from '../types';

interface NearbyPostsListProps {
  location: NearbyPostsParams;
}

export function NearbyPostsList({ location }: NearbyPostsListProps) {
  const { data: posts, isLoading, isError, error } = useNearbyPosts(location);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        <p className="mt-4 text-slate-600">Finding activities near you...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: {error.message}</p>
        <p className="text-sm text-slate-500 mt-2">
          Please try again later or check your connection.
        </p>
      </div>
    );
  }

  // Filter out past posts (hide old posts automatically)
  const upcoming = (posts || []).filter((p) => new Date(p.scheduledTime) > new Date());

  if (!upcoming || upcoming.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 mx-auto text-slate-300" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No activities found nearby</h3>
        <p className="mt-2 text-slate-500">Be the first to create an activity in your area!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900">
        {upcoming.length} {upcoming.length === 1 ? 'Activity' : 'Activities'} Near You
      </h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
        {upcoming.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
