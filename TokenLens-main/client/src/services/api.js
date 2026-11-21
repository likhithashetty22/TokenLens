// src/services/api.js
// Thin wrapper around axios for talking to the TokenLens backend.
// Keeps all HTTP concerns (base URL, error normalization) out of
// components and hooks.
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL,
  timeout: 45000,
});

/**
 * Calls POST /analyze with the user's API key and prompt.
 * Throws a normalized Error with a `.code` and friendly `.message`
 * so the UI can branch on error type (invalid key, rate limit, etc).
 */
export async function analyzePrompt({ apiKey, prompt }) {
  try {
    const { data } = await client.post('/analyze', { apiKey, prompt });
    return data;
  } catch (err) {
    throw normalizeError(err);
  }
}

function normalizeError(err) {
  // Network-level failure (no response received at all)
  if (!err.response) {
    const e = new Error('Network error. Please check your connection and try again.');
    e.code = 'NETWORK_ERROR';
    return e;
  }

  const { status, data } = err.response;
  const code = data?.error || `HTTP_${status}`;
  const message = data?.message || 'Something went wrong. Please try again.';

  const e = new Error(message);
  e.code = code;
  e.status = status;
  return e;
}
