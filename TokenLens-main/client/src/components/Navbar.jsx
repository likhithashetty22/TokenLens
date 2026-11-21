// src/components/Navbar.jsx
// Top navigation bar showing the TokenLens brand mark.
import { ScanSearch } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-base-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid place-items-center w-8 h-8 rounded-lg bg-accent/15 text-accent-light">
            <ScanSearch size={18} strokeWidth={2.25} />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-slate-50">
            TokenLens
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-good animate-pulseSlow" />
          prompt analysis, not answers
        </span>
      </div>
    </header>
  );
}
