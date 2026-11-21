// server/routes/analyze.routes.js
// Defines the REST route(s) for prompt analysis and delegates the
// actual work to the analyze controller.

const express = require('express');
const { analyzePrompt } = require('../controllers/analyze.controller');

const router = express.Router();

// POST /api/analyze
// Body: { apiKey: string, prompt: string }
router.post('/', analyzePrompt);

module.exports = router;
