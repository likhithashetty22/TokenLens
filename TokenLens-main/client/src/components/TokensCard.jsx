// src/components/TokensCard.jsx
import { Hash, Ruler } from 'lucide-react';

export default function TokensCard({ tokens, responseLength }) {
  return (
    <div className="glass-panel p-5 flex flex-col justify-between animate-fadeUp">
      <span className="text-xs font-medium text-slate-400 mb-3">Estimated Tokens</span>
      <div className="flex items-center gap-3 mb-3">
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-info/15 text-info shrink-0">
          <Hash size={18} />
        </div>
        <span className="font-display font-semibold text-2xl text-slate-100">
          {tokens.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Ruler size={13} />
        Expected response:
        <span className="font-medium text-slate-200">{responseLength}</span>
      </div>
    </div>
  );
}
