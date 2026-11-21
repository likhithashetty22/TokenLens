// src/components/EfficiencyCard.jsx
import { Gauge } from 'lucide-react';

const EFFICIENCY_STYLES = {
  Excellent: { color: '#34d399', width: '100%' },
  Good: { color: '#60a5fa', width: '75%' },
  Average: { color: '#fbbf24', width: '50%' },
  Poor: { color: '#f87171', width: '25%' },
};

export default function EfficiencyCard({ efficiency }) {
  const style = EFFICIENCY_STYLES[efficiency] || EFFICIENCY_STYLES.Average;

  return (
    <div className="glass-panel p-5 flex flex-col justify-between animate-fadeUp">
      <span className="text-xs font-medium text-slate-400 mb-3">Prompt Efficiency</span>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
          style={{ backgroundColor: `${style.color}26`, color: style.color }}
        >
          <Gauge size={18} />
        </div>
        <span className="font-display font-medium text-base" style={{ color: style.color }}>
          {efficiency}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: style.width, backgroundColor: style.color }}
        />
      </div>
    </div>
  );
}
