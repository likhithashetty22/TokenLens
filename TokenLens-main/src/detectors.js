const stringSimilarity = require('string-similarity');
const { encode } = require('gpt-tokenizer');
const { analyzePromptQuality } = require('./promptQuality');

function estimateTokens(text) {
  if (!text) return 0;
  try {
    return encode(text).length;
  } catch {
    return Math.ceil(text.length / 4);
  }
}

function detectRepromptLoops(turns, { similarityThreshold = 0.35, maxGapMs = 300_000 } = {}) {
  const findings = [];
  for (let i = 1; i < turns.length; i++) {
    const prev = turns[i - 1];
    const curr = turns[i];
    if (!prev.userMessage || !curr.userMessage) continue;

    const similarity = stringSimilarity.compareTwoStrings(prev.userMessage, curr.userMessage);
    const gap = (curr.timestamp ?? 0) - (prev.timestamp ?? 0);

    if (similarity >= similarityThreshold && gap >= 0 && gap <= maxGapMs) {
      findings.push({
        type: 'reprompt_loop',
        similarity: Math.round(similarity * 100) / 100,
        gapMs: gap,
        first: prev.userMessage,
        second: curr.userMessage
      });
    }
  }
  return findings;
}

function detectIncompleteTurns(turns) {
  return turns
    .filter(t => t.assistantResponse === null || t.assistantResponse === undefined)
    .map(t => ({
      type: 'incomplete_response',
      prompt: t.userMessage,
      timestamp: t.timestamp
    }));
}

function analyzeSessionLength(session, { longSessionThreshold = 6 } = {}) {
  const turnCount = session.turns.length;
  const timestamps = session.turns.map(t => t.timestamp).filter(Boolean);
  const durationMs = timestamps.length >= 2
    ? Math.max(...timestamps) - Math.min(...timestamps)
    : 0;

  return {
    turnCount,
    durationMs,
    flag: turnCount >= longSessionThreshold ? 'long_session' : null
  };
}

function detectBoilerplate(sessions, { minOccurrences = 2, similarityThreshold = 0.55, prefixLength = 120 } = {}) {
  const openers = sessions
    .map(s => ({ sessionId: s.id, text: (s.turns[0]?.userMessage || '').slice(0, prefixLength) }))
    .filter(o => o.text.length > 20);

  const clusters = [];
  const used = new Set();

  for (let i = 0; i < openers.length; i++) {
    if (used.has(i)) continue;
    const cluster = [openers[i]];
    used.add(i);
    for (let j = i + 1; j < openers.length; j++) {
      if (used.has(j)) continue;
      const sim = stringSimilarity.compareTwoStrings(openers[i].text, openers[j].text);
      if (sim >= similarityThreshold) {
        cluster.push(openers[j]);
        used.add(j);
      }
    }
    if (cluster.length >= minOccurrences) {
      clusters.push({ type: 'boilerplate_repetition', occurrences: cluster.length, example: cluster[0].text });
    }
  }

  return clusters;
}

function estimateSessionTokens(session) {
  let inputTokens = 0;
  let outputTokens = 0;
  for (const t of session.turns) {
    inputTokens += estimateTokens(t.userMessage);
    outputTokens += estimateTokens(t.assistantResponse || '');
  }
  return { inputTokens, outputTokens, total: inputTokens + outputTokens };
}

function detectPromptQualityIssues(turns) {
  const issues = [];
  for (const t of turns) {
    const found = analyzePromptQuality(t.userMessage);
    for (const issue of found) {
      issues.push({ type: 'prompt_quality', prompt: t.userMessage, issue });
    }
  }
  return issues;
}

function analyzeSession(session) {
  return {
    sessionId: session.id,
    summary: session.summary,
    source: session.source ?? 'db',
    repromptLoops: detectRepromptLoops(session.turns),
    incompleteTurns: detectIncompleteTurns(session.turns),
    lengthAnalysis: analyzeSessionLength(session),
    tokenEstimate: estimateSessionTokens(session),
    promptQualityIssues: detectPromptQualityIssues(session.turns)
  };
}

function analyzeAllSessions(sessions) {
  return {
    perSession: sessions.map(analyzeSession),
    boilerplate: detectBoilerplate(sessions)
  };
}

module.exports = {
  estimateTokens,
  detectRepromptLoops,
  detectIncompleteTurns,
  analyzeSessionLength,
  detectBoilerplate,
  estimateSessionTokens,
  analyzeSession,
  analyzeAllSessions
};
