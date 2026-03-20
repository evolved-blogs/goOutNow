/**
 * Post Details Page Route
 * Shows full post details and a map centered on the post location
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { usePost, usePostMembers } from '@/features/posts/hooks';
import { PostChat } from '@/features/posts/components/PostChat';
import { FeedbackSection } from '@/features/posts/components/FeedbackSection';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Users, MessageCircle, X, Clock, TrendingUp, UserCheck } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { userName, userColor } from '@/lib/chat-utils';
import { useState } from 'react';

// Cast path to any to avoid generated route type mismatch until the route generator is run
export const Route = createFileRoute('/post/:id' as any)({
  component: PostDetailsPage,
});

const VIBE_EMOJI: Record<string, string> = {
  Chill: '😌',
  Energetic: '⚡',
  Creative: '🎨',
  Networking: '🤝',
  Fun: '🎉',
};

function PostDetailsPage() {
  const id = window.location.pathname.split('/').pop() || '';
  const [chatOpen, setChatOpen] = useState(false);
  const { data: post, isLoading, isError, error } = usePost(id);
  const { data: members = [] } = usePostMembers(id);

  const isCreator = post?.createdById === window.userId;

  const markerIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p className="text-red-500">Error: {error.message}</p>;
  if (!post) return <p>Post not found</p>;

  const center: [number, number] = [post.latitude, post.longitude];
  const fillPct = Math.min((post.memberCount / post.requiredParticipants) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{post.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {/* Activity type */}
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg border border-blue-300">
                <TrendingUp className="w-3 h-3" />
                {post.activityType}
              </span>
              {/* Vibe */}
              {post.vibe && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                  {VIBE_EMOJI[post.vibe] ?? '✨'} {post.vibe}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/">
              <Button variant="outline">Back</Button>
            </Link>
            <Button asChild>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in Maps
              </a>
            </Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="detailsgrid-responsive">
          {/* LEFT column */}
          <div className="space-y-4">
            {/* Main details card */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Description */}
                {post.description && (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line border-l-4 border-purple-200 pl-3">
                    {post.description}
                  </p>
                )}

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">
                    {new Date(post.scheduledTime).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* People count + progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Users className="w-4 h-4" />
                      <span>
                        {post.memberCount} / {post.requiredParticipants} People
                      </span>
                    </div>
                    {fillPct >= 100 && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Full
                      </span>
                    )}
                    {fillPct >= 75 && fillPct < 100 && (
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        Almost Full
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={
                        fillPct >= 100
                          ? 'h-full bg-red-500 rounded-full transition-all'
                          : fillPct >= 75
                            ? 'h-full bg-orange-500 rounded-full transition-all'
                            : 'h-full bg-blue-500 rounded-full transition-all'
                      }
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>

                {/* Roles needed */}
                {post.rolesNeeded && post.rolesNeeded.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Roles Looking For
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.rolesNeeded.map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 text-sm text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          {r.role}
                          <span className="text-xs text-white bg-slate-400 rounded-full w-5 h-5 flex items-center justify-center font-bold">
                            {r.count}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Map */}
                <div style={{ isolation: 'isolate', position: 'relative', zIndex: 0 }}>
                  <div className="h-64 w-full rounded-md overflow-hidden border border-slate-200">
                    <MapContainer
                      center={center as any}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={center as any} icon={markerIcon as any} />
                    </MapContainer>
                  </div>
                </div>

                {/* Host */}
                <p className="text-xs text-slate-400 pt-1">
                  Hosted by{' '}
                  <span className="font-semibold text-slate-600">
                    {isCreator ? 'You' : `Player-${post.createdById.slice(-4)}`}
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* Members panel — visible only to the creator */}
            {isCreator && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Who joined ({members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <p className="text-sm text-slate-500">No one has joined yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {members.map((m) => {
                        const isCreatorMember = m.userId === post.createdById;
                        const name = userName(m.userId);
                        const color = userColor(m.userId);
                        return (
                          <li key={m.userId} className="flex items-center justify-between py-2">
                            <span className="flex items-center gap-2">
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: color,
                                  flexShrink: 0,
                                }}
                              />
                              <span className="text-sm font-medium text-slate-800">{name}</span>
                              {isCreatorMember && (
                                <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                                  host
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(m.joinedAt).toLocaleString()}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Feedback Section */}
            <FeedbackSection
              postId={id}
              userId={window.userId}
              isMember={members.some((m) => m.userId === window.userId)}
              isCreator={isCreator}
            />
          </div>

          {/* RIGHT column — chat (desktop only) */}
          <div style={{ position: 'sticky', top: '1.5rem' }} className="hidden md:block">
            <PostChat postId={id} createdById={post.createdById} />
          </div>
        </div>

        {/* Mobile Chat Button */}
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center w-14 h-14"
            aria-label="Toggle chat"
          >
            {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </button>
        </div>

        {/* Mobile Chat Drawer */}
        {chatOpen && (
          <div className="md:hidden fixed inset-0 z-30">
            <div className="fixed inset-0 bg-black/40" onClick={() => setChatOpen(false)} />
            <div
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl"
              style={{ animation: 'slideIn 0.3s ease-out' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-lg">Chat</h3>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="h-[calc(100vh-60px)]">
                <PostChat postId={id} createdById={post.createdById} />
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </div>
  );
}
