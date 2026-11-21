// src/components/PromptInput.jsx
// Large textarea where the user pastes the prompt they want evaluated.
import { FileText } from 'lucide-react';

export default function PromptInput({ value, onChange, disabled }) {
  return (
    <div>
      <label htmlFor="prompt" className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
        <FileText size={13} />
        Prompt to analyze
      </label>
      <textarea
        id="prompt"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the prompt you're about to send to ChatGPT, Claude, Gemini, or Copilot..."
        rows={10}
        className="w-full resize-y min-h-[220px] rounded-xl bg-base-800/70 border border-white/10 px-4 py-3.5 text-sm
                   leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-accent/60 focus:ring-1
                   focus:ring-accent/40 outline-none transition disabled:opacity-50"
      />
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-600">
        <span>Your prompt is analyzed, never executed or answered.</span>
        <span className="font-mono">{value.length.toLocaleString()} chars</span>
      </div>
    </div>
  );
}
