/**
 * Post Card Component
 * Displays a single post with join functionality
 * Reusable component with no business logic
 */

import { MapPin, Clock, Users, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { Button, buttonVariants } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';
import { Link } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/ui/card';
import { formatDate, formatDistance } from '@/shared/utils/cn';
import { useJoinPost } from '../hooks';
import type { PostWithDistance } from '../types';

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
          // Mark this post as joined for this device
          localStorage.setItem(`joined:${window.userId}:${post.id}`, 'true');
          // increment local join count for soft identity social proof
          const key = `joinedCount:${window.userId}`;
          const current = parseInt(localStorage.getItem(key) || '0', 10);
          localStorage.setItem(key, String(current + 1));
        },
      },
    );
  };

  // soft identity info
  const isCreator = post.createdById === window.userId;

  const joinedCountKey = `joinedCount:${window.userId}`;
  const joinedCount = parseInt(localStorage.getItem(joinedCountKey) || '0', 10);
  // Track whether this specific user has already joined this post
  const hasJoinedKey = `joined:${window.userId}:${post.id}`;
  const hasAlreadyJoined = isCreator || localStorage.getItem(hasJoinedKey) === 'true';

  // Calculate time remaining and urgency
  const now = new Date();
  const eventTime = new Date(post.scheduledTime);
  const hoursRemaining = Math.floor((eventTime.getTime() - now.getTime()) / (1000 * 60 * 60));
  const isToday = eventTime.toDateString() === now.toDateString();
  const isSoon = hoursRemaining <= 24 && hoursRemaining > 0;
  const isVeryUrgent = hoursRemaining <= 6 && hoursRemaining > 0;
  const maxPlayers = 6; // Default max players for activities
  const fillPercentage = (post.memberCount / maxPlayers) * 100;
  const almostFull = post.memberCount >= 4; // heuristic

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-purple-300 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg">{post.title}</CardTitle>
            {/* Distance badge */}
            <div className="flex items-center gap-2 mt-2">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {formatDistance(post.distance)}
              </span>
            </div>
          </div>
          {/* Urgency badge */}
          {isVeryUrgent && (
            <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              <Zap className="w-3 h-3" />
              <span>Starting in {hoursRemaining}h</span>
            </div>
          )}
          {isSoon && !isVeryUrgent && (
            <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>{hoursRemaining}h left</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 pb-3">
        {/* Player count progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Users className="w-4 h-4" />
              <span>
                {post.memberCount}/{maxPlayers} Players
              </span>
            </div>
            {almostFull && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                Almost Full!
              </span>
            )}
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', {
                'bg-blue-500': fillPercentage <= 70,
                'bg-orange-500': fillPercentage > 70 && fillPercentage < 100,
                'bg-red-500': fillPercentage >= 100,
              })}
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Date/Time info */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="font-medium">{formatDate(post.scheduledTime)}</span>
          {isToday && (
            <span className="ml-auto text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Today
            </span>
          )}
        </div>

        {/* Activity type badge */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-300">
            <TrendingUp className="w-3 h-3" />
            {post.activityType}
          </span>
          {joinedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border border-green-300">
              <CheckCircle className="w-3 h-3" />
              Played {joinedCount}x
            </span>
          )}
        </div>

        {/* Creator info */}
        <div className="text-xs text-slate-500 border-t border-slate-100 pt-2">
          {isCreator ? (
            <div className="flex items-center gap-1 text-green-600 font-semibold">
              <CheckCircle className="w-3 h-3" />
              You created this
            </div>
          ) : (
            <span>by {`Player-${post.createdById.slice(-4)}`}</span>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto pt-3 px-4 pb-4">
        <div className="w-full">
          <div className="flex gap-2">
            <Link
              to={`/post/${post.id}` as any}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'flex-1')}
            >
              Details
            </Link>

            <div className="flex-1">
              <Button
                onClick={handleJoin}
                disabled={
                  joinPostMutation.isPending || joinPostMutation.isSuccess || hasAlreadyJoined
                }
                size="sm"
                className="w-full"
              >
                {joinPostMutation.isPending
                  ? 'Joining...'
                  : isCreator
                    ? 'Created'
                    : hasAlreadyJoined
                      ? 'Joined ✓'
                      : joinPostMutation.isSuccess
                        ? 'Joined!'
                        : 'Join'}
              </Button>
            </div>
          </div>
        </div>
      </CardFooter>

      {joinPostMutation.isError && (
        <p className="text-xs text-red-500 mx-4 mb-2">{joinPostMutation.error.message}</p>
      )}
    </Card>
  );
}
