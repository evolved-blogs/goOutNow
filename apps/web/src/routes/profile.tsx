import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Calendar, CheckCircle, Loader2, MapPin, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/features/auth/context';
import { useUserProfile, useUserActivity, useUpdateProfile } from '@/features/users/hooks';
import { HeroNav } from '@/shared/ui/HeroNav';

export const Route = createFileRoute('/profile')({ component: ProfilePage });

const INTEREST_ICONS: Record<string, string> = {
  Music: '🎵',
  Fitness: '💪',
  Coffee: '☕',
  Hiking: '🏔️',
  Cooking: '🍳',
  Sports: '⚽',
  Travel: '✈️',
  Art: '🎨',
  Reading: '📚',
  Gaming: '🎮',
  Dance: '💃',
  Photography: '📷',
};

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

const ACTIVITY_BG: Record<string, string> = {
  sports: 'bg-purple-600',
  music: 'bg-purple-600',
  social: 'bg-teal-600',
  fitness: 'bg-green-600',
  learning: 'bg-blue-600',
  creative: 'bg-orange-500',
  food: 'bg-amber-500',
  adventure: 'bg-cyan-500',
  wellness: 'bg-teal-500',
  other: 'bg-slate-500',
};

const ALL_INTERESTS = [
  'Music',
  'Fitness',
  'Coffee',
  'Hiking',
  'Cooking',
  'Sports',
  'Travel',
  'Art',
  'Reading',
  'Gaming',
  'Dance',
  'Photography',
];

function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const city = localStorage.getItem('lastCity') || 'Your Location';

  const { data: profile, isLoading: profileLoading } = useUserProfile(userId);
  const { data: activity = [] } = useUserActivity(userId);
  const updateMutation = useUpdateProfile(userId);

  // Single edit sheet state — all fields edited together
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ displayName: '', bio: '', interests: [] as string[] });

  const displayName =
    profile?.displayName || (user ? `Player-${user.id.slice(-4).toUpperCase()}` : 'Player');
  const username = displayName.toLowerCase().replace(/\s+/g, '_');
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const stats = profile?.stats;
  const interests = profile?.interests ?? [];
  const bio = profile?.bio ?? '';
  const rating = stats?.rating ?? 0;
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  const upcoming = activity
    .filter((a) => new Date(a.scheduledTime) > new Date())
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, 5);

  const achievements: { label: string; icon: string; color: string }[] = [
    ...(profile
      ? [
          {
            label: 'Early Adopter',
            icon: '⭐',
            color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          },
        ]
      : []),
    ...((stats?.eventsHosted ?? 0) >= 3
      ? [{ label: 'Top Host', icon: '🎤', color: 'bg-purple-50 text-purple-700 border-purple-200' }]
      : []),
    ...((stats?.peopleMet ?? 0) >= 10
      ? [{ label: 'Connector', icon: '🔗', color: 'bg-green-50 text-green-700 border-green-200' }]
      : []),
    ...((stats?.activitiesJoined ?? 0) >= 3
      ? [{ label: '3-Week Streak', icon: '🔥', color: 'bg-red-50 text-red-600 border-red-200' }]
      : []),
  ];

  const openEdit = () => {
    setDraft({
      displayName: profile?.displayName ?? '',
      bio: profile?.bio ?? '',
      interests: [...(profile?.interests ?? [])],
    });
    setEditing(true);
  };

  const saveAll = () => {
    updateMutation.mutate(
      {
        displayName: draft.displayName || undefined,
        bio: draft.bio || undefined,
        interests: draft.interests,
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  const toggleInterest = (interest: string) => {
    setDraft((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  if (profileLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #4C1D95 0%, #7C3AED 60%, #F9FAFB 100%)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* ── Hero: avatar on purple gradient ── */}
      <div
        className="pb-10"
        style={{ background: 'linear-gradient(to bottom, #4C1D95 0%, #6D28D9 50%, #8B5CF6 100%)' }}
      >
        <HeroNav />
        {/* Avatar + name */}
        <div className="flex flex-col items-center px-4 pt-4">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-purple-400/40 border-4 border-white/20 shadow-xl flex items-center justify-center">
              <span className="text-white text-2xl font-extrabold tracking-wide">{initials}</span>
            </div>
            <div className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-white shadow">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <h2 className="text-white text-xl font-bold">{displayName}</h2>
          <p className="text-white/60 text-sm mt-0.5">@{username}</p>
          <div className="flex items-center gap-3 mt-2.5">
            <span className="flex items-center gap-1 text-white/65 text-xs">
              <MapPin className="w-3.5 h-3.5" />
              {city}
            </span>
            {memberSince && (
              <>
                <span className="text-white/30">·</span>
                <span className="flex items-center gap-1 text-white/65 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  Member since {memberSince}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 -mt-5 pb-4 space-y-3 max-w-2xl mx-auto">
        {/* Stats card */}
        <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <div className="grid grid-cols-4 divide-x divide-gray-100 text-center">
            <div className="flex flex-col items-center gap-0.5 pr-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats?.activitiesJoined ?? 0}
              </span>
              <span className="text-xs text-slate-500">Joined</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats?.peopleMet ?? 0}
              </span>
              <span className="text-xs text-slate-500">People Met</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats?.eventsHosted ?? 0}
              </span>
              <span className="text-xs text-slate-500">Hosted</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 pl-2">
              <span className="text-2xl font-extrabold text-slate-900">
                {rating > 0 ? rating.toFixed(1) : '—'}
              </span>
              <span className="text-xs text-slate-500">Rating</span>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-900">About</h3>
            <button onClick={openEdit} className="text-sm font-semibold text-purple-600">
              Edit
            </button>
          </div>
          {bio ? (
            <p className="text-sm text-slate-600 leading-relaxed">{bio}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">
              Add a bio to let others know who you are.
            </p>
          )}
        </div>

        {/* Interests */}
        {interests.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-900 mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-sm font-medium px-3 py-1.5 rounded-full border border-purple-100"
                >
                  {INTEREST_ICONS[interest] ?? '✨'} {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="font-bold text-slate-900 mb-3">Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {achievements.map((a) => (
                <span
                  key={a.label}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${a.color}`}
                >
                  {a.icon} {a.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5">
            <h3 className="font-bold text-slate-900">Upcoming Activities</h3>
            <button className="text-sm font-semibold text-purple-600">See all</button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-400 italic px-4 pb-4">No upcoming activities.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcoming.map((item) => {
                const dt = new Date(item.scheduledTime);
                const today = new Date();
                const tomorrow = new Date(Date.now() + 86_400_000);
                const dayLabel =
                  dt.toDateString() === today.toDateString()
                    ? 'Today'
                    : dt.toDateString() === tomorrow.toDateString()
                      ? 'Tomorrow'
                      : dt.toLocaleDateString('en-US', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        });
                const timeLabel = dt.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                });
                const typeKey = item.activityType.toLowerCase();
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl ${ACTIVITY_BG[typeKey] ?? 'bg-purple-600'}`}
                    >
                      {ACTIVITY_ICONS[typeKey] ?? '🎯'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {dayLabel} · {timeLabel}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Profile CTA */}
        <button
          onClick={openEdit}
          className="w-full py-4 rounded-2xl text-base font-bold text-white shadow-lg"
          style={{ background: 'linear-gradient(to right, #7C3AED, #5B21B6)' }}
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* ── Edit Profile bottom sheet ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !updateMutation.isPending && setEditing(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-900">Edit Profile</h2>
              <button
                onClick={() => setEditing(false)}
                disabled={updateMutation.isPending}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 disabled:opacity-40"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Display Name
                </label>
                <input
                  value={draft.displayName}
                  onChange={(e) => setDraft((p) => ({ ...p, displayName: e.target.value }))}
                  placeholder={`Player-${userId.slice(-4).toUpperCase()}`}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">About</label>
                <textarea
                  value={draft.bio}
                  onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))}
                  rows={4}
                  placeholder="Tell others about yourself…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Interests{' '}
                  <span className="text-xs font-normal text-slate-400">
                    ({draft.interests.length} selected)
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_INTERESTS.map((interest) => {
                    const selected = draft.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
                          selected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-gray-50 text-slate-600 border-gray-200'
                        }`}
                      >
                        {INTEREST_ICONS[interest] ?? '✨'} {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 pb-6 pt-3 border-t border-gray-100 shrink-0 flex gap-3">
              <button
                onClick={() => setEditing(false)}
                disabled={updateMutation.isPending}
                className="flex-1 border border-gray-200 text-slate-700 rounded-2xl py-3.5 text-sm font-semibold disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={saveAll}
                disabled={updateMutation.isPending}
                className="flex-1 bg-purple-600 text-white rounded-2xl py-3.5 text-sm font-bold hover:bg-purple-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
