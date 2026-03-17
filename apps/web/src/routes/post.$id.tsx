/**
 * Post Details Page Route
 * Shows full post details and a map centered on the post location
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { usePost, usePostMembers } from '@/features/posts/hooks';
import { PostChat } from '@/features/posts/components/PostChat';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Users, MessageCircle, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { userName, userColor } from '@/lib/chat-utils';
import { useState } from 'react';

// Cast path to any to avoid generated route type mismatch until the route generator is run
export const Route = createFileRoute('/post/:id' as any)({
  component: PostDetailsPage,
});

function PostDetailsPage() {
  // Extract id from the URL as a simple fallback for router params
  const id = window.location.pathname.split('/').pop() || '';
  const [chatOpen, setChatOpen] = useState(false);
  const { data: post, isLoading, isError, error } = usePost(id);

  // Always fetch members as long as we have an id — the panel is only
  // *rendered* when isCreator is true.  Fetching unconditionally avoids
  // the race where isCreator is false on the first render (post not yet
  // loaded) and TanStack Query never retries the disabled query.
  const { data: members = [] } = usePostMembers(id);

  const isCreator = post?.createdById === window.userId;

  // Leaflet marker icon fix
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{post.title}</h2>
          <div className="flex gap-2">
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

        {/* Two-column layout: left = details + members, right = chat */}
        <div className="detailsgrid-responsive">
          {/* LEFT column */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Activity: {post.activityType}</p>
                  <div className="text-sm text-slate-600">
                    Time: {new Date(post.scheduledTime).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">Members: {post.memberCount}</div>

                  <div className="mt-4 h-72 w-full rounded-md overflow-hidden">
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
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40" onClick={() => setChatOpen(false)} />

            {/* Drawer from right */}
            <div
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl"
              style={{
                animation: 'slideIn 0.3s ease-out',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-lg">Chat</h3>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Component */}
              <div className="h-[calc(100vh-60px)]">
                <PostChat postId={id} createdById={post.createdById} />
              </div>
            </div>
          </div>
        )}

        {/* CSS for slide-in animation */}
        <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
      </div>
    </div>
  );
}
