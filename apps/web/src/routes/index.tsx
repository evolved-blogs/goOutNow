/**
 * Home Page Route — mirrors the mobile NearbyScreen
 * Logo + bell live inside the hero section on the same gradient — no separate header bar.
 */

import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { NearbyPostsList } from '@/features/posts/components/NearbyPostsList';
import { PendingFeedbackModal } from '@/features/posts/components/PendingFeedbackModal';
import { useNearbyPosts } from '@/features/posts/hooks';
import { GradientPage } from '@/shared/ui/GradientPage';
import { HeroNav } from '@/shared/ui/HeroNav';

const DEFAULT_LOCATION = { latitude: 13.0827, longitude: 80.2707 };

export const Route = createFileRoute('/')({ component: IndexPage });

function IndexPage() {
  const [location, setLocation] = React.useState(DEFAULT_LOCATION);

  React.useEffect(() => {
    if (!navigator.geolocation) {
      localStorage.setItem('lastCity', 'Chennai, India');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = (await res.json()) as {
            address?: { city?: string; town?: string; village?: string; country?: string };
          };
          const cityName =
            data.address?.city || data.address?.town || data.address?.village || 'Your Area';
          const country = data.address?.country ?? '';
          const label = country ? `${cityName}, ${country}` : cityName;
          localStorage.setItem('lastCity', label);
        } catch {
          // silently ignore reverse geocode errors
        }
      },
      () => {
        localStorage.setItem('lastCity', 'Chennai, India');
      },
    );
  }, []);

  const { data: posts = [], isLoading } = useNearbyPosts(location);
  const count = posts.length;

  return (
    <GradientPage>
      <PendingFeedbackModal userId={window.userId} />

      <HeroNav />

      {/* ── Hero — title + subtitle on gradient ── */}
      <div className="px-4 pt-2 pb-8">
        {/* Hero text */}
        <div className="text-center">
          <h1 className="text-white text-xl font-bold sm:text-2xl">Discover Activities Near You</h1>
          <p className="text-white/85 text-sm mt-1">Join local activities and meet new people</p>
        </div>
      </div>

      {/* ── Cards section ── */}
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-white text-base font-bold">
            {isLoading ? 'Loading\u2026' : `${count} Activities Near You`}
          </h2>
          <button className="text-white/80 text-sm font-semibold">Filter</button>
        </div>

        <div className="pb-6">
          <NearbyPostsList location={location} hideHeader />
        </div>
      </div>
    </GradientPage>
  );
}
