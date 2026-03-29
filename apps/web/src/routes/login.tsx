import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context';
import { MapPin, Phone, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/login')({ component: LoginPage });

function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) void navigate({ to: '/', replace: true });
  }, [isLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      setError('Enter a valid phone number with country code (e.g. +919876543210)');
      return;
    }
    setSubmitting(true);
    try {
      await login(phone);
      void navigate({ to: '/', replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #4C1D95 0%, #7C3AED 60%, #EDE9FE 100%)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(to bottom, #4C1D95 0%, #6D28D9 45%, #8B5CF6 100%)' }}
    >
      {/* ── Hero section ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 text-center">
        {/* App icon */}
        <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/20">
          <MapPin className="w-10 h-10 text-white" strokeWidth={2} />
        </div>

        <h1 className="text-white text-4xl font-extrabold tracking-tight">GoOutNow</h1>
        <p className="text-purple-200 text-base mt-3 max-w-xs leading-relaxed">
          Discover &amp; join local activities happening near you
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['🎵 Music', '⚽ Sports', '☕ Coffee', '🏔️ Hiking'].map((tag) => (
            <span
              key={tag}
              className="bg-white/15 border border-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl sm:rounded-3xl sm:mx-auto sm:w-full sm:max-w-md sm:mb-10 sm:pb-10">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
            <Phone className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign in with phone</h2>
        </div>
        <p className="text-slate-500 text-sm mb-6 ml-13">
          No OTP needed — returning users sign in instantly.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.trim())}
                className="w-full rounded-2xl border-2 border-gray-200 focus:border-purple-500 pl-10 pr-4 py-3.5 text-slate-900 text-base placeholder-slate-400 focus:outline-none transition-colors"
                disabled={submitting}
                required
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Include country code — e.g. +1 for US, +91 for India
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <span className="text-red-500 mt-0.5 shrink-0">⚠️</span>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || phone.length < 5}
            className="w-full text-white font-bold rounded-2xl py-4 text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-[0.98]"
            style={{ background: 'linear-gradient(to right, #7C3AED, #5B21B6)' }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Just a moment…
              </>
            ) : (
              'Continue →'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-slate-400">secure &amp; private</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Trust badges */}
        <div className="flex justify-center gap-6">
          {[
            { icon: '🔒', label: 'No spam' },
            { icon: '🚀', label: 'Instant access' },
            { icon: '🌍', label: 'Any country' },
          ].map((b) => (
            <div key={b.label} className="flex flex-col items-center gap-1">
              <span className="text-xl">{b.icon}</span>
              <span className="text-xs text-slate-500">{b.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          By continuing you agree to our{' '}
          <span className="text-purple-600 font-medium cursor-pointer">terms of use</span>.
        </p>
      </div>
    </div>
  );
}
