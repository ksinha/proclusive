'use client';

import { useEffect, useState } from 'react';

export function BackgroundEffects() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Atmospheric Gradient */}
      <div
        className="absolute w-[150%] h-[150%] -top-[25%] -left-[25%] animate-atmosphere"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, rgba(201, 169, 98, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(201, 169, 98, 0.03) 0%, transparent 50%)
          `
        }}
      />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 169, 98, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 98, 0.045) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 75%)'
        }}
      />

      {/* Corner Accents (Desktop Only) */}
      <div className="hidden lg:block">
        {/* Top-left corner - positioned below nav */}
        <div
          className="fixed top-[100px] left-[30px] w-[100px] h-[100px] border-l border-t"
          style={{ borderColor: 'rgba(201, 169, 98, 0.25)' }}
        />
        {/* Bottom-right corner - positioned just above page bottom */}
        <div
          className="fixed bottom-[30px] right-[30px] w-[100px] h-[100px] border-r border-b"
          style={{ borderColor: 'rgba(201, 169, 98, 0.25)' }}
        />
      </div>
    </div>
  );
}
