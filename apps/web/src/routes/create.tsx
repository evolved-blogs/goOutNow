/**
 * Create Activity Page
 * Purple gradient hero with nav icons, back arrow + title, then the form.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { CreatePostForm } from '@/features/posts/components/CreatePostForm';
import { HeroNav } from '@/shared/ui/HeroNav';

export const Route = createFileRoute('/create')({ component: CreatePage });

function CreatePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero: nav icons + page title on purple gradient ── */}
      <div style={{ background: 'linear-gradient(to right, #7C3AED, #6D28D9, #5B21B6)' }}>
        <HeroNav />
        <div className="px-4 pb-4 flex items-center gap-3">
          <button
            onClick={() => void navigate({ to: '/' })}
            className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-white font-bold text-base">Create Activity</span>
        </div>
      </div>

      <div className="px-4 py-4">
        <CreatePostForm onSuccess={() => void navigate({ to: '/' })} />
      </div>
    </div>
  );
}
