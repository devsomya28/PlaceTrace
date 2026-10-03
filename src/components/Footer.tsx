import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#010f1f] border-t border-[#273647] py-6 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-center md:text-left">
          <span className="font-semibold text-[#c0c1ff]">PlaceTrace</span>
          <span className="text-[#464554]">•</span>
          <span className="text-[#c7c4d7]">
            Empirical placement bottleneck diagnosis without speculative bias. Designed for engineering students.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs text-[#c7c4d7]">v0.9.4-telemetry</span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#00885d]/30 text-[#4edea3] font-mono uppercase tracking-wider border border-[#00885d]/40">
            Live Signal Core
          </span>
        </div>
      </div>
    </footer>
  );
};
