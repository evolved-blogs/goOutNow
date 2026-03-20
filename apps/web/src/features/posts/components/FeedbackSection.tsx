/**
 * FeedbackSection
 * Shown on the post detail page to joinee members only.
 * Displays the avg ratings summary + lets un-submitted members submit feedback.
 */

import { useState } from 'react';
import { Star, ThumbsUp, User, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useFeedbackSummary, useHasSubmittedFeedback, useSubmitFeedback } from '../hooks';

interface Props {
  postId: string;
  /** The current viewer's userId */
  userId: string;
  /** Whether the viewer has joined this activity */
  isMember: boolean;
  /** Whether the viewer is the organizer/creator */
  isCreator: boolean;
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hovered || value) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function FeedbackSection({ postId, userId, isMember, isCreator }: Props) {
  const { data: summary, isLoading: summaryLoading } = useFeedbackSummary(postId);
  const { data: checkData } = useHasSubmittedFeedback(postId, userId);
  const submitMutation = useSubmitFeedback(postId);

  const [activityRating, setActivityRating] = useState(0);
  const [organizerRating, setOrganizerRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const alreadySubmitted = submitted || checkData?.submitted;
  const canSubmit = isMember && !isCreator && !alreadySubmitted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityRating || !organizerRating) return;
    await submitMutation.mutateAsync({
      fromUserId: userId,
      activityRating,
      organizerRating,
      comment: comment.trim() || undefined,
    });
    setSubmitted(true);
  };

  const visibleFeedbacks = showAll
    ? (summary?.feedbacks ?? [])
    : (summary?.feedbacks ?? []).slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ThumbsUp className="w-5 h-5 text-purple-600" />
        <h3 className="text-base font-semibold text-slate-800">Feedback & Ratings</h3>
      </div>

      {/* Summary strip */}
      {!summaryLoading && summary && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Activity</p>
            <p className="text-2xl font-bold text-purple-700">
              {summary.avgActivityRating > 0 ? summary.avgActivityRating.toFixed(1) : '—'}
            </p>
            <StarRating value={Math.round(summary.avgActivityRating)} readonly />
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">Organizer</p>
            <p className="text-2xl font-bold text-purple-700">
              {summary.avgOrganizerRating > 0 ? summary.avgOrganizerRating.toFixed(1) : '—'}
            </p>
            <StarRating value={Math.round(summary.avgOrganizerRating)} readonly />
          </div>
          <p className="col-span-2 text-xs text-slate-400 text-center">
            {summary.totalFeedbacks === 0
              ? 'No feedback yet'
              : `Based on ${summary.totalFeedbacks} review${summary.totalFeedbacks > 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {/* Submit form — only for joinee members who haven't submitted yet */}
      {canSubmit && (
        <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-5 space-y-4">
          <p className="text-sm font-medium text-slate-700">Leave your feedback</p>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Rate the Activity</label>
            <StarRating value={activityRating} onChange={setActivityRating} />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500">Rate the Organizer</label>
            <StarRating value={organizerRating} onChange={setOrganizerRating} />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Suggestions / Comments (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add details about skill level, what to bring, etc."
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>

          {submitMutation.isError && (
            <p className="text-xs text-red-500">{(submitMutation.error as Error).message}</p>
          )}

          <Button
            type="submit"
            disabled={!activityRating || !organizerRating || submitMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >
            {submitMutation.isPending ? 'Submitting…' : 'Submit Feedback'}
          </Button>
        </form>
      )}

      {/* Submitted confirmation */}
      {alreadySubmitted && isMember && !isCreator && (
        <p className="text-sm text-green-600 font-medium border-t border-slate-100 pt-4">
          ✅ You have already submitted your feedback. Thank you!
        </p>
      )}

      {/* Not a member notice */}
      {!isMember && !isCreator && (
        <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
          Join this activity to leave feedback after it ends.
        </p>
      )}

      {/* Individual feedback list */}
      {summary && summary.totalFeedbacks > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reviews</p>
          {visibleFeedbacks.map((fb) => (
            <div key={fb.id} className="bg-slate-50 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">
                    {fb.fromUserId === userId ? 'You' : `Player #${fb.fromUserId.slice(0, 6)}`}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-slate-400">
                  <span>🏅 {fb.activityRating}/5</span>
                  <span>👤 {fb.organizerRating}/5</span>
                </div>
              </div>
              {fb.comment && <p className="text-xs text-slate-600 pl-6">"{fb.comment}"</p>}
            </div>
          ))}

          {summary.totalFeedbacks > 3 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="flex items-center gap-1 text-xs text-purple-600 hover:underline"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Show all {summary.totalFeedbacks} reviews
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
