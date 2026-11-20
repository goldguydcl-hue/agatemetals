import './index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a1a2e] px-4 text-white">
      <p className="text-[0.72rem] font-semibold tracking-[0.25em] text-[#d4af37]">
        AGATE METALS • LIVE REFERENCE
      </p>
      <h1 className="text-center text-2xl font-bold leading-tight">
        Agate Metals Checker
      </h1>
      <p className="text-center text-sm text-white/70">
        Know what your bullion is worth
      </p>
      <div className="mt-2 flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/5 px-4 py-2">
        <span className="text-sm font-semibold text-[#d4af37]">
          Gold • Silver • Platinum • Palladium • Rhodium
        </span>
      </div>
      <button
        className="mt-4 cursor-pointer rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-[#0a1a2e] transition-colors hover:bg-[#e3c25a]"
        onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
      >
        Tap to check your metal
      </button>
      <p className="text-[0.72rem] text-white/50">
        {context.username ? `Hi ${context.username} — ` : ''}Estimates only, not
        financial advice.
      </p>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
