// server/controllers/analyze.controller.js
// Validates incoming requests to POST /api/analyze and translates
// service-layer results/errors into consistent HTTP responses.

const { evaluatePrompt } = require('../services/gemini.service');

/**
 * POST /api/analyze
 * Body: { apiKey: string, prompt: string }
 */
async function analyzePrompt(req, res) {
  const { apiKey, prompt } = req.body || {};

  // --- Input validation ---------------------------------------------
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return res.status(400).json({
      error: 'MISSING_API_KEY',
      message: 'Please provide your Gemini API key.',
    });
  }

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({
      error: 'MISSING_PROMPT',
      message: 'Please provide a prompt to analyze.',
    });
  }

  if (prompt.length > 20000) {
    return res.status(400).json({
      error: 'PROMPT_TOO_LONG',
      message: 'Prompt is too long. Please shorten it and try again.',
    });
  }

  try {
    const analysis = await evaluatePrompt({ apiKey, prompt });
    return res.status(200).json(analysis);
  } catch (err) {
    return handleServiceError(err, res);
  }
}

/**
 * Maps known error types thrown by the Gemini service into clean,
 * frontend-friendly HTTP error responses.
 */
function handleServiceError(err, res) {
  const status = err.status || err.statusCode;

  // Invalid / unauthorized API key
  if (status === 401) {
    return res.status(401).json({
      error: 'INVALID_API_KEY',
      message: 'Your Gemini API key is invalid or unauthorized.',
    });
  }

  // Rate limit / quota exceeded on the caller's Gemini account
  if (status === 429) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Gemini rate limit exceeded. Please wait and try again.',
    });
  }

  // The model did not return valid JSON
  if (err.code === 'INVALID_JSON') {
    return res.status(502).json({
      error: 'INVALID_JSON',
      message: 'Received an unreadable response from the AI model.',
    });
  }

  // Generic network / connectivity failure
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      error: 'NETWORK_ERROR',
      message: 'Could not reach Gemini. Check your connection and try again.',
    });
  }

  console.error('Gemini service error:', err);
  return res.status(500).json({
    error: 'ANALYSIS_FAILED',
    message: 'Failed to analyze prompt. Please try again.',
  });
}

module.exports = { analyzePrompt };
