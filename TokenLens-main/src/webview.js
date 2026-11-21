function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Simple inline SVG logo: magnifying glass with a brace inside, echoing the
// TokenLens mark, drawn from scratch (not copied) as an SVG path/shape set.
const LOGO_SVG = `
<svg width="28" height="28" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="42" cy="42" r="30" fill="none" stroke="#4f8cff" stroke-width="8"/>
  <line x1="63" y1="63" x2="88" y2="88" stroke="#4f8cff" stroke-width="9" stroke-linecap="round"/>
  <text x="42" y="52" font-family="monospace" font-size="30" font-weight="bold" fill="#4f8cff" text-anchor="middle">{ }</text>
</svg>`;

function scoreColor(score) {
  if (score >= 80) return '#3fb950';
  if (score >= 50) return '#d29922';
  return '#f85149';
}

function renderDashboard({ analysis, globalTips, sessionCount, totalTurns, goodPointsBySession, improvementsBySession, scoresBySession }) {
  const flaggedCount = analysis.perSession.filter(s => (improvementsBySession[s.sessionId] || []).length > 0).length;
  const totalTokens = analysis.perSession.reduce((sum, s) => sum + s.tokenEstimate.total, 0);

  const historyItems = analysis.perSession.map(s => {
    const score = scoresBySession[s.sessionId];
    return `
      <div class="history-item">
        <div class="history-title">${escapeHtml(s.summary)}</div>
        <div class="history-meta">
          <span class="badge" style="background:${scoreColor(score)}22;color:${scoreColor(score)};border-color:${scoreColor(score)}55;">${score}</span>
          <span class="source-tag">${s.source === 'live' ? 'live' : 'history'}</span>
        </div>
      </div>`;
  }).join('');

  const sessionCards = analysis.perSession.map(s => {
    const score = scoresBySession[s.sessionId];
    const good = goodPointsBySession[s.sessionId] || [];
    const improve = improvementsBySession[s.sessionId] || [];

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${escapeHtml(s.summary)}</div>
            <div class="card-sub">${s.lengthAnalysis.turnCount} turn(s) &middot; ~${s.tokenEstimate.total.toLocaleString()} tokens (est.) &middot; ${s.source === 'live' ? 'live-captured' : 'history'}</div>
          </div>
          <div class="score-badge" style="border-color:${scoreColor(score)};color:${scoreColor(score)};">${score}<span class="score-max">/100</span></div>
        </div>
        <div class="split">
          <div class="split-col">
            <div class="split-heading good">&#10003; What's good</div>
            <ul>${good.map(g => `<li>${escapeHtml(g)}</li>`).join('')}</ul>
          </div>
          <div class="split-col">
            <div class="split-heading warn">&#9888; What could be improved</div>
            <ul>${improve.length ? improve.map(g => `<li>${escapeHtml(g)}</li>`).join('') : '<li class="muted">Nothing flagged.</li>'}</ul>
          </div>
        </div>
      </div>`;
  }).join('');

  const globalSection = globalTips.length
    ? `<div class="card global"><div class="card-title">Across all sessions</div><ul>${globalTips.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<style>
  :root {
    --bg: #0d1117;
    --panel: #161b22;
    --border: #30363d;
    --text: #e6edf3;
    --muted: #8b949e;
    --accent: #4f8cff;
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", sans-serif;
    background: var(--bg);
    color: var(--text);
    margin: 0;
    padding: 0;
  }
  .topbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
  }
  .topbar .title { font-size: 1.15em; font-weight: 700; }
  .topbar .subtitle { color: var(--muted); font-size: 0.85em; margin-left: 6px; }
  .layout { display: flex; }
  .sidebar {
    width: 260px;
    border-right: 1px solid var(--border);
    padding: 16px;
    flex-shrink: 0;
  }
  .sidebar-heading {
    text-transform: uppercase;
    font-size: 0.72em;
    letter-spacing: 0.05em;
    color: var(--muted);
    margin-bottom: 10px;
  }
  .history-item {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 6px;
    background: var(--panel);
    border: 1px solid var(--border);
  }
  .history-title { font-size: 0.85em; margin-bottom: 6px; }
  .history-meta { display: flex; align-items: center; gap: 8px; }
  .badge {
    font-family: monospace;
    font-size: 0.75em;
    padding: 1px 7px;
    border-radius: 10px;
    border: 1px solid;
  }
  .source-tag { font-size: 0.7em; color: var(--muted); text-transform: uppercase; }
  .main { flex: 1; padding: 24px; min-width: 0; }
  .stats-row {
    display: flex;
    gap: 24px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 20px;
  }
  .stat .stat-value { font-size: 1.4em; font-weight: 700; }
  .stat .stat-label { color: var(--muted); font-size: 0.78em; }
  .card {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 18px 20px;
    margin-bottom: 16px;
  }
  .card.global { border-left: 3px solid #d29922; }
  .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .card-title { font-size: 1em; font-weight: 600; }
  .card-sub { color: var(--muted); font-size: 0.78em; margin-top: 4px; }
  .score-badge {
    font-family: monospace;
    font-weight: 700;
    font-size: 1.1em;
    border: 2px solid;
    border-radius: 8px;
    padding: 4px 10px;
    white-space: nowrap;
  }
  .score-max { font-size: 0.6em; color: var(--muted); font-weight: 400; }
  .split { display: flex; gap: 20px; flex-wrap: wrap; }
  .split-col { flex: 1; min-width: 220px; }
  .split-heading { font-size: 0.82em; font-weight: 600; margin-bottom: 8px; }
  .split-heading.good { color: #3fb950; }
  .split-heading.warn { color: #d29922; }
  ul { margin: 0; padding-left: 18px; }
  li { margin-bottom: 6px; line-height: 1.4; font-size: 0.88em; }
  li.muted { color: var(--muted); font-style: italic; }
  .footnote { color: var(--muted); font-size: 0.78em; margin-top: 10px; }
</style>
</head>
<body>
  <div class="topbar">
    ${LOGO_SVG}
    <span class="title">Copilot Prompt Coach</span>
    <span class="subtitle">prompt quality analyzer</span>
  </div>
  <div class="layout">
    <div class="sidebar">
      <div class="sidebar-heading">Session History</div>
      ${historyItems || '<div class="footnote">No sessions found yet.</div>'}
    </div>
    <div class="main">
      <div class="stats-row">
        <div class="stat"><div class="stat-value">${sessionCount}</div><div class="stat-label">sessions</div></div>
        <div class="stat"><div class="stat-value">${totalTurns}</div><div class="stat-label">total turns</div></div>
        <div class="stat"><div class="stat-value">${flaggedCount}</div><div class="stat-label">flagged</div></div>
        <div class="stat"><div class="stat-value">~${totalTokens.toLocaleString()}</div><div class="stat-label">tokens (est.)</div></div>
      </div>
      ${globalSection}
      ${sessionCards || '<p>No sessions to analyze yet.</p>'}
      <div class="footnote">Token counts are estimates from message text, not GitHub's actual billed usage. Schema is based on an undocumented local format and may change with future Copilot updates.</div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = { renderDashboard };
