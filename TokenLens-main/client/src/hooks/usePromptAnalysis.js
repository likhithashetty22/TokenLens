// src/hooks/usePromptAnalysis.js
// Encapsulates the request lifecycle (idle / loading / success / error)
// for analyzing a prompt, keeping Dashboard.jsx focused on layout.
import { useState, useCallback } from 'react';
import { analyzePrompt } from '../services/api.js';

export function usePromptAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAnalysis = useCallback(async ({ apiKey, prompt }) => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyzePrompt({ apiKey, prompt });
      setResult(data);
    } catch (err) {
      setError(err);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, runAnalysis, reset };
}
