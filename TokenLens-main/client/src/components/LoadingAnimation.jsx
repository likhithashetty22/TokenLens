// src/components/LoadingAnimation.jsx
// Shown in place of the results section while an analysis request is
// in flight.
import { Loader2 } from 'lucide-react';

export default function LoadingAnimation() {
  return (
    <div className="glass-panel flex flex-col items-center justify-center gap-3 py-16 animate-fadeUp">
      <Loader2 size={28} className="text-accent-light animate-spin" />
      <p className="text-sm text-slate-400">Evaluating prompt quality…</p>
      <div className="flex gap-1.5 mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulseSlow" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulseSlow" style={{ animationDelay: '200ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulseSlow" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
}
