/**
 * AppHeader — reusable horizontal purple gradient sticky header
 * Mirrors the mobile LinearGradient header bar used across all screens.
 *
 * Slots:
 *   left    — logo+city widget, back button, or blank spacer
 *   title   — centered page title text (optional)
 *   right   — bell button, logout icon, or blank spacer
 *   footer  — extra content rendered below the main row (e.g. search input)
 */

import React from 'react';

export interface AppHeaderProps {
  /** Left slot — logo widget, back button, etc. */
  left?: React.ReactNode;
  /** Centered page title text */
  title?: string;
  /** Right slot — bell, icon button, or blank spacer */
  right?: React.ReactNode;
  /** Extra content below the main header row (e.g. a search bar) */
  footer?: React.ReactNode;
}

// Shared gradient — matches mobile: LinearGradient colors={['#7C3AED','#6D28D9','#5B21B6']} horizontal
const HEADER_STYLE: React.CSSProperties = {
  background: 'linear-gradient(to right, #7C3AED, #6D28D9, #5B21B6)',
};

export function AppHeader({ left, title, right, footer }: AppHeaderProps) {
  return (
    <div className="sticky top-0 z-40 shadow-md" style={HEADER_STYLE}>
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        {/* Left slot — flex basis so center stays centred */}
        <div className="flex-1 flex items-center">{left ?? <div className="w-10 h-10" />}</div>

        {/* Center title */}
        {title && <h1 className="text-white font-bold text-lg leading-tight shrink-0">{title}</h1>}

        {/* Right slot */}
        <div className="flex-1 flex items-center justify-end">
          {right ?? <div className="w-10 h-10" />}
        </div>
      </div>

      {/* Optional footer row (e.g. search bar) */}
      {footer && <div className="px-4 pb-3">{footer}</div>}
    </div>
  );
}

/* ─── Pre-built slot pieces ─────────────────────────────────────────────── */

/** Logo + city subtitle — used on the Home screen */
export function LogoCitySlot({ city }: { city: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* No inner padding — matches mobile logo: width 38, height 38, bg white/20, resizeMode contain */}
      <img
        src="/logo.svg"
        alt="GoOutNow"
        className="w-10 h-10 rounded-lg bg-white/20 object-contain"
      />
      <span className="text-white/80 text-xs leading-tight">{city}</span>
    </div>
  );
}

/** Bell with orange notification dot */
export function BellSlot() {
  return (
    <button
      className="relative w-10 h-10 rounded-lg flex items-center justify-center"
      aria-label="Notifications"
    >
      {/* Using inline SVG to avoid extra icon library imports */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span
        className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2"
        style={{ borderColor: '#6D28D9' }}
      />
    </button>
  );
}

/** Back arrow button */
export function BackSlot({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-lg flex items-center justify-center"
      aria-label="Go back"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
    </button>
  );
}

/** Icon button (settings, logout, etc.) — pass any 24×24 lucide-react icon */
export function IconSlot({
  icon,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
      aria-label={label}
    >
      {icon}
    </button>
  );
}
