// src/components/ApiKeyInput.jsx
// Controlled input for the user's Gemini API key. Masked by default,
// with a toggle to reveal it. The key is only held in memory / passed
// with the analyze request - never persisted or logged.
import { useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export default function ApiKeyInput({ value, onChange, disabled }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor="api-key" className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
        <KeyRound size={13} />
        Gemini API Key
      </label>
      <div className="relative">
        <input
          id="api-key"
          type={visible ? 'text' : 'password'}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="AIza..."
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl bg-base-800/70 border border-white/10 px-4 py-3 pr-11 text-sm font-mono
                     text-slate-100 placeholder:text-slate-600 focus:border-accent/60 focus:ring-1 focus:ring-accent/40
                     outline-none transition disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? 'Hide API key' : 'Show API key'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-slate-600">
        Used only for this request. TokenLens never stores your key. No key yet?{' '}
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="text-accent-light hover:underline"
        >
          Get a free Gemini API key
        </a>
        .
      </p>
    </div>
  );
}
