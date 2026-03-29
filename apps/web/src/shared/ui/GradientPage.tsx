/**
 * GradientPage — full-page wrapper that replicates the mobile NearbyScreen
 * background: LinearGradient colors={['#5B21B6','#7C3AED', background]} locations={[0, 0.25, 0.55]}
 *
 * Usage (home page):
 *   <GradientPage>
 *     <AppHeader ... />
 *     ... hero + cards ...
 *   </GradientPage>
 *
 * For pages that only need a plain gray background with a purple header,
 * use AppHeader directly inside a normal <div className="min-h-screen bg-gray-50">.
 */

import React from 'react';

// background-attachment: fixed mirrors the mobile LinearGradient absoluteFill —
// the gradient is pinned to the viewport so it doesn't scroll with the content,
// exactly like React Native's StyleSheet.absoluteFill behaviour.
const GRADIENT_STYLE: React.CSSProperties = {
  background: 'linear-gradient(to bottom, #5B21B6 0%, #7C3AED 25%, #F9FAFB 55%)',
  backgroundAttachment: 'fixed',
};

interface GradientPageProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientPage({ children, className = '' }: GradientPageProps) {
  return (
    <div className={`min-h-screen ${className}`} style={GRADIENT_STYLE}>
      {children}
    </div>
  );
}
