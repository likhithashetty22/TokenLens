/**
 * Computes a simple 0-100 "prompt quality" score for a session, in the
 * same spirit as TokenLens's score badge. This is a heuristic, not a
 * scientific measure - starts at 100 and subtracts for each issue found.
 */
function computeSessionScore(sessionReport) {
  let score = 100;
  score -= sessionReport.repromptLoops.length * 15;
  score -= sessionReport.incompleteTurns.length * 20;
  score -= (sessionReport.promptQualityIssues?.length || 0) * 8;
  if (sessionReport.lengthAnalysis.flag === 'long_session') score -= 10;
  return Math.max(0, Math.min(100, score));
}

function generateSessionGoodPoints(sessionReport) {
  const good = [];
  if (sessionReport.repromptLoops.length === 0) good.push('No rephrasing loops - prompts landed on the first try.');
  if (sessionReport.incompleteTurns.length === 0) good.push('Every prompt received a completed response.');
  if (sessionReport.lengthAnalysis.flag !== 'long_session') good.push('Session length stayed efficient.');
  if ((sessionReport.promptQualityIssues?.length || 0) === 0) good.push('Prompts included enough detail (language/framework, format, constraints) for Copilot to work from.');
  if (good.length === 0) good.push('Session completed successfully.');
  return good;
}

function generateSessionImprovements(sessionReport) {
  const improvements = [];
  const { repromptLoops, incompleteTurns, lengthAnalysis, promptQualityIssues } = sessionReport;

  if (repromptLoops.length > 0) {
    improvements.push(
      `Rephrased a similar question ${repromptLoops.length} time(s) - try including the specific error message, file name, or expected output up front.`
    );
  }
  if (incompleteTurns.length > 0) {
    improvements.push(
      `${incompleteTurns.length} prompt(s) didn't get a completed response - consider breaking large asks into smaller steps.`
    );
  }
  if (lengthAnalysis.flag === 'long_session') {
    improvements.push(
      `Ran ${lengthAnalysis.turnCount} turns - long sessions resend the full history each time, increasing token usage. Consider starting fresh for unrelated follow-ups.`
    );
  }
  if (promptQualityIssues && promptQualityIssues.length > 0) {
    // De-duplicate identical issue text (e.g. same missing-language flag across turns)
    const seen = new Set();
    for (const pq of promptQualityIssues) {
      if (!seen.has(pq.issue)) {
        seen.add(pq.issue);
        improvements.push(pq.issue);
      }
    }
  }
  return improvements;
}

function generateSessionFeedback(sessionReport) {
  const tips = [];
  const { summary, repromptLoops, incompleteTurns, lengthAnalysis, tokenEstimate } = sessionReport;

  if (repromptLoops.length > 0) {
    tips.push(
      `In "${summary}", you rephrased a similar question ${repromptLoops.length} time(s). ` +
      `Try including the specific error message, file name, or expected output in your first attempt.`
    );
  }
  if (incompleteTurns.length > 0) {
    tips.push(
      `${incompleteTurns.length} prompt(s) in "${summary}" didn't get a completed response. ` +
      `This can happen if a request was interrupted or too broad - consider breaking large asks into smaller steps.`
    );
  }
  if (lengthAnalysis.flag === 'long_session') {
    tips.push(
      `"${summary}" ran ${lengthAnalysis.turnCount} turns. Long-running sessions resend the full conversation ` +
      `history with every message, which increases token usage - starting a fresh session for unrelated ` +
      `follow-ups can be faster and cheaper.`
    );
  }
  if (tokenEstimate.total > 0) {
    tips.push(
      `Estimated token usage for this session: ~${tokenEstimate.total.toLocaleString()} tokens ` +
      `(~${tokenEstimate.inputTokens.toLocaleString()} in / ~${tokenEstimate.outputTokens.toLocaleString()} out). ` +
      `This is an estimate based on message text, not GitHub's exact billed count.`
    );
  }
  if (tips.length === 0) {
    tips.push(`No notable issues found in "${summary}" - this session looks efficient.`);
  }

  return tips;
}

function generateGlobalFeedback(analysis) {
  const tips = [];
  if (analysis.boilerplate.length > 0) {
    for (const b of analysis.boilerplate) {
      tips.push(
        `You've opened ${b.occurrences} different sessions with a very similar first message ` +
        `(starting: "${b.example.slice(0, 60)}..."). Consider adding this as project context in a ` +
        `.github/copilot-instructions.md file instead of retyping it each time.`
      );
    }
  }
  return tips;
}

module.exports = {
  computeSessionScore,
  generateSessionGoodPoints,
  generateSessionImprovements,
  generateSessionFeedback,
  generateGlobalFeedback
};
