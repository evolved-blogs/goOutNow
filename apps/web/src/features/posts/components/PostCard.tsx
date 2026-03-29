/**
 * Post Card Component — purple-themed card with banner image
 */

import { MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Link } from '@tanstack/react-router';
import { formatDate, formatDistance } from '@/shared/utils/cn';
import { useJoinPost } from '../hooks';
import type { PostWithDistance } from '../types';

const ACTIVITY_ICONS: Record<string, string> = {
  sports: '⚽',
  music: '🎵',
  social: '🤝',
  fitness: '💪',
  learning: '📚',
  creative: '🎨',
  food: '🍕',
  adventure: '🏔️',
  wellness: '🧘',
  other: '🎯',
};

interface PostCardProps {
  post: PostWithDistance;
}

export function PostCard({ post }: PostCardProps) {
  const joinPostMutation = useJoinPost(post.id);
  const handleJoin = () => {
    joinPostMutation.mutate(
      { userId: window.userId },
      {
        onSuccess: () => {
          localStorage.setItem(`joined:${window.userId}:${post.id}`, 'true');
          const key = `joinedCount:${window.userId}`;
          const current = parseInt(localStorage.getItem(key) || '0', 10);
          localStorage.setItem(key, String(current + 1));
        },
      },
    );
  };

  const isCreator = post.createdById === window.userId;
  const hasAlreadyJoined =
    isCreator || localStorage.getItem(`joined:${window.userId}:${post.id}`) === 'true';

  const now = new Date();
  const eventTime = new Date(post.scheduledTime);
  const hoursRemaining = Math.floor((eventTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  const daysUntil = Math.ceil((eventTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isToday = eventTime.toDateString() === now.toDateString();
  const isTomorrow = daysUntil === 1;
  const isVeryUrgent = hoursRemaining <= 6 && hoursRemaining > 0;
  const maxPlayers = post.requiredParticipants;
  const fillPercentage = Math.min((post.memberCount / maxPlayers) * 100, 100);

  const urgencyBadge = isVeryUrgent
    ? { text: `${hoursRemaining}h left`, bg: 'bg-orange-500' }
    : isToday
      ? { text: 'Today', bg: 'bg-purple-600' }
      : isTomorrow
        ? { text: 'Tomorrow', bg: 'bg-orange-400' }
        : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Banner image seeded by post ID for consistency */}
      <div className="relative h-44 shrink-0">
        <img
          src={`https://picsum.photos/seed/${post.id}/600/300`}
          alt={post.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {urgencyBadge && (
          <div
            className={cn(
              'absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1',
              urgencyBadge.bg,
            )}
          >
            <Clock className="w-3 h-3" />
            {urgencyBadge.text}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <h3 className="font-bold text-slate-900 text-base leading-tight">{post.title}</h3>

        {/* Distance */}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
          <span className="text-purple-600 font-semibold text-sm">
            {formatDistance(post.distance)}
          </span>
        </div>

        {/* Joinee count + progress */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="font-medium">
              {post.memberCount}/{maxPlayers} Joinees
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{formatDate(post.scheduledTime)}</span>
          </div>
          {isToday && (
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Today
            </span>
          )}
        </div>

        {/* Activity type */}
        <div className="flex items-center gap-1.5 text-sm text-slate-700 flex-wrap">
          <span className="text-base">
            {ACTIVITY_ICONS[post.activityType.toLowerCase()] ?? '🎯'}
          </span>
          <span>{post.activityType}</span>
          {post.vibe && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 text-xs">{post.vibe}</span>
            </>
          )}
        </div>

        {/* Description */}
        {post.description && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{post.description}</p>
        )}

        {/* Roles */}
        {post.rolesNeeded && post.rolesNeeded.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.rolesNeeded.slice(0, 3).map((r, i) => (
              <span
                key={i}
                className="text-xs text-slate-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200"
              >
                {r.role} ×{r.count}
              </span>
            ))}
            {post.rolesNeeded.length > 3 && (
              <span className="text-xs text-slate-400">+{post.rolesNeeded.length - 3} more</span>
            )}
          </div>
        )}

        {/* Creator */}
        <div className="text-xs text-slate-400 pt-0.5">
          {isCreator ? (
            <span className="text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> You created this
            </span>
          ) : (
            `by Player-${post.createdById.slice(-4)}`
          )}
        </div>

        {/* Spacer pushes buttons to bottom */}
        <div className="flex-1" />
        {/* Action buttons */}
        <div className="flex gap-2.5 pt-1">
          <Link
            to={`/post/${post.id}` as any}
            className="flex-1 text-center border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors"
          >
            Details
          </Link>
          <button
            onClick={handleJoin}
            disabled={joinPostMutation.isPending || hasAlreadyJoined}
            className="flex-1 bg-purple-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {joinPostMutation.isPending
              ? 'Joining\u2026'
              : isCreator
                ? 'Created'
                : hasAlreadyJoined
                  ? 'Joined \u2713'
                  : 'Join'}
          </button>
        </div>

        {joinPostMutation.isError && (
          <p className="text-xs text-red-500">{joinPostMutation.error.message}</p>
        )}
      </div>
    </div>
  );
}
