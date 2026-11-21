// src/components/AnalyzeButton.jsx
import { Sparkles, Loader2 } from 'lucide-react';

export default function AnalyzeButton({ onClick, loading, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5
                 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-light
                 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none w-full sm:w-auto"
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Analyzing…
        </>
      ) : (
        <>
          <Sparkles size={16} className="transition group-hover:scale-110" />
          Analyze Prompt
        </>
      )}
    </button>
  );
}
