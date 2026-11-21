// src/components/Footer.jsx
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-good" />
          <span>Privacy First Prompt Analysis</span>
        </div>
        <span className="text-xs font-mono text-slate-600">
          Your API key never leaves this request. Nothing is stored.
        </span>
      </div>
    </footer>
  );
}
