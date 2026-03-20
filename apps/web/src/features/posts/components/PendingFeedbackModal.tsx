/**
 * PendingFeedbackModal
 * Proactively asks users to rate activities they attended but haven't reviewed yet.
 * Shows one pending activity at a time as a modal overlay.
 * Appears automatically on the home page when pending items exist.
 */

import { useState } from 'react';
import { X, Star, Calendar, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { usePendingFeedback, useSubmitFeedback } from '../hooks';
import type { PendingFeedbackItem } from '../types';

/* ─────────────────────────────────── helpers ── */

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="cursor-pointer transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hovered || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-200 fill-slate-200'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ─────────────────────────────── card for one item ── */

interface FeedbackCardProps {
  item: PendingFeedbackItem;
  userId: string;
  index: number;
  total: number;
  onDone: () => void;
  onSkip: () => void;
}

function FeedbackCard({ item, userId, index, total, onDone, onSkip }: FeedbackCardProps) {
  const [activityRating, setActivityRating] = useState(0);
  const [organizerRating, setOrganizerRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitMutation = useSubmitFeedback(item.postId);

  const canSubmit = activityRating > 0 && organizerRating > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await submitMutation.mutateAsync({
      fromUserId: userId,
      activityRating,
      organizerRating,
      comment: comment.trim() || undefined,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Counter */}
      <p className="text-xs text-slate-400 font-medium">
        {index + 1} of {total} pending
      </p>

      {/* Activity info */}
      <div className="bg-purple-50 rounded-xl p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-slate-800 leading-tight">{item.title}</p>
            <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              {item.activityType}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(item.scheduledTime)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {item.memberCount} player{item.memberCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Ratings */}
      <div className="space-y-4">
        <StarRating value={activityRating} onChange={setActivityRating} label="Rate the Activity" />
        <StarRating
          value={organizerRating}
          onChange={setOrganizerRating}
          label="Rate the Organizer"
        />
      </div>

      {/* Comment */}
      <div className="space-y-1">
        <label className="text-xs text-slate-500">Comments (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience…"
          rows={3}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
        />
      </div>

      {submitMutation.isError && (
        <p className="text-xs text-red-500">{(submitMutation.error as Error).message}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition-colors"
        >
          Skip for now
        </button>
        <Button
          type="submit"
          disabled={!canSubmit || submitMutation.isPending}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center justify-center gap-1"
        >
          {submitMutation.isPending ? (
            'Submitting…'
          ) : (
            <>
              Submit <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ──────────────────────────────────── modal ── */

interface Props {
  userId: string;
}

export function PendingFeedbackModal({ userId }: Props) {
  const { data: pending, isLoading } = usePendingFeedback(userId);

  // Track which items are done/skipped locally
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [modalClosed, setModalClosed] = useState(false);

  if (isLoading || modalClosed) return null;

  const items: PendingFeedbackItem[] = (pending ?? []).filter(
    (item) => !dismissedIds.has(item.postId),
  );

  if (items.length === 0) return null;

  const current = items[0];

  const dismiss = (postId: string) => {
    setDismissedIds((prev) => new Set([...prev, postId]));
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && setModalClosed(true)}
    >
      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">How did it go?</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              You have {items.length} activit{items.length === 1 ? 'y' : 'ies'} waiting for a review
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalClosed(true)}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400"
            aria-label="Close feedback modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-6 mt-3" />

        {/* Card body */}
        <div className="px-6 py-5">
          <FeedbackCard
            key={current.postId}
            item={current}
            userId={userId}
            index={0}
            total={items.length}
            onDone={() => dismiss(current.postId)}
            onSkip={() => dismiss(current.postId)}
          />
        </div>
      </div>
    </div>
  );
}
