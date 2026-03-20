/**
 * Home Page Route
 * Displays nearby posts based on user location
 */

import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { NearbyPostsList } from '@/features/posts/components/NearbyPostsList';
import { PendingFeedbackModal } from '@/features/posts/components/PendingFeedbackModal';

// Fallback center (Chennai)
const DEFAULT_LOCATION = { latitude: 13.0827, longitude: 80.2707 };

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(
    null,
  );

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => setLocation(DEFAULT_LOCATION),
      );
    } else {
      setLocation(DEFAULT_LOCATION);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Proactive feedback modal — shows when user has unrated past activities */}
      <PendingFeedbackModal userId={window.userId} />

      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Discover Activities Near You</h2>
          <p className="mt-2 text-slate-600">Join local activities and meet new people</p>
        </div>

        {location ? (
          <NearbyPostsList location={location} />
        ) : (
          <p className="text-center text-slate-500">Detecting your location…</p>
        )}
      </div>
    </div>
  );
}
