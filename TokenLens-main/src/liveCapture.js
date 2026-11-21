const fs = require('fs');

function readLiveEvents(logPath) {
  if (!fs.existsSync(logPath)) return [];
  const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);
  const events = [];
  for (const line of lines) {
    try { events.push(JSON.parse(line)); } catch { /* skip malformed line */ }
  }
  return events;
}

function extractPromptText(payload) {
  return payload?.prompt ?? payload?.promptText ?? payload?.message ?? payload?.text ?? '';
}

function extractToolName(payload) {
  return payload?.toolName ?? payload?.tool ?? 'unknown tool';
}

function readLiveSessions(logPath) {
  const events = readLiveEvents(logPath);
  const sessions = [];
  let current = null;
  let sessionCounter = 0;

  for (const evt of events) {
    if (evt.event === 'sessionStart') {
      sessionCounter++;
      current = {
        id: `live-${sessionCounter}-${evt.loggedAt}`,
        cwd: evt.payload?.cwd ?? 'unknown',
        summary: '(live-captured session)',
        source: 'live',
        turns: []
      };
      sessions.push(current);
      continue;
    }

    if (!current) continue;

    if (evt.event === 'userPromptSubmitted') {
      current.turns.push({
        userMessage: extractPromptText(evt.payload),
        assistantResponse: null,
        timestamp: new Date(evt.loggedAt).getTime(),
        _toolNames: []
      });
      if (current.summary === '(live-captured session)') {
        current.summary = extractPromptText(evt.payload).slice(0, 80) || current.summary;
      }
      continue;
    }

    if (evt.event === 'postToolUse') {
      const lastTurn = current.turns[current.turns.length - 1];
      if (lastTurn) lastTurn._toolNames.push(extractToolName(evt.payload));
      continue;
    }

    if (evt.event === 'sessionEnd') current = null;
  }

  for (const session of sessions) {
    for (const turn of session.turns) {
      if (turn._toolNames && turn._toolNames.length > 0) {
        turn.assistantResponse = `(approximate) Used tools: ${turn._toolNames.join(', ')}`;
      }
      delete turn._toolNames;
    }
  }

  return sessions;
}

module.exports = { readLiveSessions, readLiveEvents };
