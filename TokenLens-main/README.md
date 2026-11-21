# TokenLens

AI Prompt Quality Analyzer. Analyzes the quality of a prompt before
you send it to ChatGPT, Claude, Gemini, or Copilot — it does not
answer the prompt.

Uses **Google Gemini** under the hood (free-tier API keys available at
https://aistudio.google.com/apikey).

## Project structure

```
tokenlens/
  server/            Express REST API (Node.js)
    index.js         App entry point
    routes/           Route definitions
    controllers/       Request validation + response shaping
    services/         Gemini API integration
    .env.example
    package.json

  client/            React + Tailwind + Recharts frontend (Vite)
    src/
      components/     Reusable UI components
      pages/          Dashboard.jsx (the only page)
      services/       axios API client
      hooks/          usePromptAnalysis.js
    .env.example
    package.json
```

## Getting a Gemini API key (free)

1. Go to https://aistudio.google.com/apikey
2. Sign in with a Google account.
3. Click **Create API key**. Copy it — it starts with `AIza...`.

Gemini's free tier is generous enough for testing this app; no billing
setup is required to get started.

## Running locally

### 1. Backend

```
cd server
cp .env.example .env
npm install
npm run dev
```

Runs on http://localhost:5000. Exposes `POST /api/analyze`.

### 2. Frontend

```
cd client
cp .env.example .env
npm install
npm run dev
```

Runs on http://localhost:5173 and proxies `/api` to the backend.

## How it works

1. You paste your Gemini API key (used only for the current request,
   never stored) and a prompt into the dashboard.
2. Clicking **Analyze Prompt** sends both to the backend.
3. The backend calls Gemini (`gemini-2.5-flash` by default, see
   `server/services/gemini.service.js`) with a strict system
   instruction telling the model to evaluate — never answer — the
   prompt, and to return structured JSON only.
4. The frontend renders the score, category, strengths, issues,
   suggestions, token estimate, and efficiency rating.

## Notes

- No database / storage — this is a stateless MVP.
- Rate limiting is applied on `/api/analyze` to protect against abuse.
- Errors are normalized into: invalid API key, network error, rate
  limit exceeded, and invalid JSON from the model.
- Want to change models? Edit the `MODEL` constant in
  `server/services/gemini.service.js`.
