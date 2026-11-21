// server/services/gemini.service.js
// Talks to Google's Gemini API (via the current @google/genai SDK) to
// evaluate prompt quality. The caller's own Gemini API key is used
// for every request - nothing is hardcoded or stored server-side.

const { GoogleGenAI } = require('@google/genai');

// The exact system prompt specified by the product spec. TokenLens
// never answers the user's prompt - it only evaluates it and returns
// structured JSON describing the evaluation.
const SYSTEM_PROMPT = `You are TokenLens.

You are NOT an AI assistant.

Your ONLY responsibility is evaluating prompt quality.

Never answer the user's prompt.

Instead classify the prompt into one category.

Possible categories:

- Code Generation
- Debugging
- Refactoring
- Documentation
- Code Explanation
- General Programming

Then evaluate it.

Be strict.

Return ONLY JSON.

Format

{
  "category":"",
  "score":0,
  "strengths":[],
  "issues":[],
  "suggestions":[],
  "estimated_prompt_tokens":0,
  "estimated_response_length":"",
  "prompt_efficiency":"Excellent | Good | Average | Poor"
}

Do not include markdown.

Do not include explanations.

Only valid JSON.`;

// gemini-2.5-flash is fast, cheap, and free-tier eligible - a good
// default for this kind of short, structured evaluation task. Swap
// this constant if you'd rather use a different Gemini model.
const MODEL = 'gemini-2.5-flash';

/**
 * Sends the user's prompt to Gemini for evaluation and returns the
 * parsed structured analysis.
 *
 * @param {{ apiKey: string, prompt: string }} params
 * @returns {Promise<object>} parsed analysis JSON
 */
async function evaluatePrompt({ apiKey, prompt }) {
  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        // Ask Gemini to respond as strict JSON so we can parse it reliably.
        responseMimeType: 'application/json',
      },
    });
  } catch (err) {
    throw normalizeGeminiError(err);
  }

  const rawText = response.text;
  return parseAnalysisJson(rawText);
}

/**
 * @google/genai throws an ApiError with a `.status` field already set
 * to the underlying HTTP status code, so this mostly just passes that
 * through - with a couple of message-based fallbacks for cases where
 * status isn't populated.
 */
function normalizeGeminiError(err) {
  const normalized = new Error(err.message || 'Gemini request failed');
  normalized.status = err.status;

  const lower = (err.message || '').toLowerCase();
  if (!normalized.status) {
    if (lower.includes('api key not valid') || lower.includes('api_key_invalid')) {
      normalized.status = 401;
    } else if (lower.includes('quota') || lower.includes('rate limit')) {
      normalized.status = 429;
    }
  }

  return normalized;
}

/**
 * Parses the model's JSON output and normalizes it to the shape the
 * frontend expects. Throws a tagged error if parsing fails so the
 * controller can return a clean "invalid JSON" response.
 */
function parseAnalysisJson(rawText) {
  if (!rawText) {
    const err = new Error('Model returned an empty response');
    err.code = 'INVALID_JSON';
    throw err;
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    const err = new Error('Model did not return valid JSON');
    err.code = 'INVALID_JSON';
    throw err;
  }

  return {
    category: parsed.category || 'General Programming',
    score: clampScore(parsed.score),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    estimated_prompt_tokens: Number(parsed.estimated_prompt_tokens) || 0,
    estimated_response_length: parsed.estimated_response_length || 'Medium',
    prompt_efficiency: parsed.prompt_efficiency || 'Average',
  };
}

function clampScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

module.exports = { evaluatePrompt };
