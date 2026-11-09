/**
 * © 2026 MH DRIVER (MH DIVER). ALL RIGHTS RESERVED.
 * Modern Apple-style Glassmorphism Navbar.
 */

import React from 'react';
import { History, HelpCircle, Sparkles } from 'lucide-react';

export default function Navbar({ onOpenHistory, onOpenGuide, historyCount }) {
  return (
    <nav className="relative z-20 w-full border-b border-white/15 backdrop-blur-2xl bg-slate-950/30 transition-all">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo MH DRIVER */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center group">
              <img
                src="/big-logo.svg"
                alt="MH DRIVER Logo"
                className="h-9 w-auto object-contain drop-shadow-[0_2px_12px_rgba(56,189,248,0.35)] group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div class="flex items-center gap-2"><span class="text-2xl font-black tracking-wider text-white">MH</span><span class="text-2xl font-black tracking-wider text-sky-400">DRIVER</span><span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">PRO</span></div>';
                }}
              />
            </a>
          </div>

          {/* Navigation Pill Links */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 p-1 shadow-lg shadow-black/10">
              <a
                href="/"
                className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-white/20 shadow-sm transition-all"
              >
                Trang Chủ
              </a>
              <button
                onClick={onOpenGuide}
                className="rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white/80 hover:bg-white/15 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                <span>Hướng Dẫn</span>
              </button>
              <button
                onClick={onOpenHistory}
                className="rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white/80 hover:bg-white/15 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-purple-400" />
                <span>Lịch Sử</span>
                {historyCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-gradient-to-r from-sky-400 to-blue-500 text-black font-extrabold text-[10px] rounded-full shadow-sm">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
