// src/components/ErrorBanner.jsx
// Displays a friendly error message for known failure modes:
// invalid API key, network error, rate limit exceeded, invalid JSON.
import { AlertTriangle } from 'lucide-react';

export default function ErrorBanner({ error }) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-bad/25 bg-bad/10 px-4 py-3.5 text-sm text-red-200 animate-fadeUp"
    >
      <AlertTriangle size={18} className="text-bad shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-bad">{titleFor(error.code)}</p>
        <p className="text-red-200/80 mt-0.5">{error.message}</p>
      </div>
    </div>
  );
}

function titleFor(code) {
  switch (code) {
    case 'INVALID_API_KEY':
    case 'MISSING_API_KEY':
      return 'Invalid API key';
    case 'NETWORK_ERROR':
      return 'Network error';
    case 'RATE_LIMIT_EXCEEDED':
      return 'Rate limit exceeded';
    case 'INVALID_JSON':
      return 'Unreadable response';
    default:
      return 'Analysis failed';
  }
}
