/**
 * Create Post Page Route
 * Displays create post form
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { CreatePostForm } from '@/features/posts/components/CreatePostForm';

export const Route = createFileRoute('/create')({
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to the dashboard (home) — the nearby posts list will
    // automatically show the latest data because useCreatePost already
    // invalidates the postKeys.all query on success.
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Create New Activity</h2>
          <p className="mt-2 text-slate-600">Invite others to join your activity</p>
        </div>

        <CreatePostForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
