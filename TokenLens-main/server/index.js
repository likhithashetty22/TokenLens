// server/index.js
// Entry point for the TokenLens backend. Boots the Express app,
// wires up middleware (CORS, JSON parsing, rate limiting) and routes,
// and starts the HTTP server.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const analyzeRoutes = require('./routes/analyze.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Core middleware -------------------------------------------------

// Allow the configured frontend origin(s) to call this API.
// Falls back to "*" for local development convenience.
const allowedOrigin = process.env.CLIENT_ORIGIN || '*';
app.use(
  cors({
    origin: allowedOrigin,
  })
);

app.use(express.json({ limit: '1mb' }));

// Basic rate limiting to protect the /api/analyze endpoint from abuse,
// since every request proxies a call to the Gemini API using the
// caller-supplied key.
const analyzeLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please wait a moment and try again.',
  },
});

// --- Health check ------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'tokenlens-backend' });
});

// --- Routes -------------------------------------------------------------

app.use('/api/analyze', analyzeLimiter, analyzeRoutes);

// --- 404 handler ---------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found.' });
});

// --- Centralized error handler --------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong on the server.',
  });
});

app.listen(PORT, () => {
  console.log(`TokenLens backend listening on port ${PORT}`);
});
