/**
 * © 2026 MH DRIVER (MH DIVER). ALL RIGHTS RESERVED.
 * High Quality iOS 16 Fluid Background with Vibrant Ambient Glow.
 */

import React from 'react';

export default function WallpaperBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Base Wallpaper: Bright & Vivid iOS 16 Fluid Swirl */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: "url('/wallpaper.jpg')",
          filter: 'brightness(1.05) saturate(1.15) contrast(1.02)'
        }}
      />

      {/* Gentle frosted glass tint - keeping the wallpaper bright and vibrant */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/25 via-slate-950/35 to-slate-950/50 backdrop-blur-[2px]" />

      {/* Ambient soft glow highlights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-400/20 blur-[100px]" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-amber-400/15 blur-[100px]" />
    </div>
  );
}
