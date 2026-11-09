import React from 'react';

export default function WallpaperBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Background Image: iOS 16 Fluid Swirl Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: "url('/wallpaper.jpg')",
          filter: 'brightness(0.92) contrast(1.05)'
        }}
      />

      {/* Modern Frosted Dark Gradient Overlay for optimal text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/75 backdrop-blur-[1px]" />
      
      {/* Subtle radial vignette accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
