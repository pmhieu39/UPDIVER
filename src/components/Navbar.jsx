import React from 'react';
import { History, HelpCircle } from 'lucide-react';

export default function Navbar({ onOpenHistory, onOpenGuide, historyCount }) {
  return (
    <nav className="relative z-20 w-full border-b border-white/10 backdrop-blur-xl bg-black/40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo MH DRIVER */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center">
              <img
                src="/big-logo.svg"
                alt="MH DRIVER Logo"
                className="h-9 w-auto object-contain drop-shadow-[0_2px_10px_rgba(56,189,248,0.3)] transition-transform hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div class="flex items-center gap-2"><span class="text-2xl font-black tracking-wider text-white">MH</span><span class="text-2xl font-black tracking-wider text-sky-400">DRIVER</span><span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">PRO</span></div>';
                }}
              />
            </a>
          </div>

          {/* Navigation Pill Links */}
          <div className="flex items-center space-x-1 rounded-full bg-white/10 backdrop-blur-2xl border border-white/15 p-1 shadow-lg shadow-black/20">
            <a
              href="/"
              className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-white/20 shadow-sm transition-all"
            >
              Trang Chủ
            </a>
            <button
              onClick={onOpenGuide}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              Hướng Dẫn
            </button>
            <button
              onClick={onOpenHistory}
              className="rounded-full px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-purple-400" />
              Lịch Sử
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-sky-500 text-black font-bold text-[10px] rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
