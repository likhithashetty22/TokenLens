/**
 * Analyzes the CONTENT of a single prompt - not behavior across turns.
 * This is deliberately rule-based (not an LLM call) to keep the tool fully
 * local/offline/private, matching the rest of this project's design. That
 * means it's a heuristic, not a semantic understanding of the prompt - it
 * will miss things a real language-aware reviewer would catch, and can
 * occasionally flag something that's actually fine. Treat its output as
 * "worth double-checking," not gospel.
 */

const BUILD_VERBS = /\b(build|create|make|write|generate|develop|design|implement)\b/i;
const CODE_NOUNS = /\b(app|application|dashboard|website|page|component|api|function|script|program|feature|form|endpoint|service|module)\b/i;

const LANGUAGE_FRAMEWORK_KEYWORDS = [
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'node', 'express',
  'python', 'django', 'flask', 'fastapi', 'java', 'spring', 'kotlin',
  'javascript', 'typescript', 'html', 'css', 'tailwind', 'bootstrap',
  'c++', 'c#', '.net', 'go', 'golang', 'rust', 'php', 'laravel', 'ruby', 'rails',
  'swift', 'sql', 'mongodb', 'postgres', 'mysql', 'flutter', 'android', 'ios'
];

const FORMAT_HINT_KEYWORDS = [
  'only code', 'no explanation', 'with comments', 'explain', 'step by step',
  'markdown', 'json', 'just the code', 'code only', 'with tests', 'include tests'
];

const CONSTRAINT_KEYWORDS = [
  'error handling', 'validation', 'edge case', 'constraint', 'requirement',
  'must', 'should not', 'accessibility', 'responsive', 'mobile', 'security',
  'performance', 'limit', 'max', 'min', 'required field'
];

const ERROR_CONTEXT_KEYWORDS = [
  'error', 'bug', 'issue', 'fail', 'exception', 'crash', 'not working', "doesn't work", "isn't working"
];

function wordCount(text) {
  return (text.trim().match(/\S+/g) || []).length;
}

function containsAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

/**
 * Returns an array of plain-language issue strings for a single prompt.
 * Only runs the relevant checks based on what kind of prompt this looks
 * like (e.g., no point flagging "missing language" on a question that
 * isn't asking for code to be generated at all).
 */
function analyzePromptQuality(text) {
  if (!text || !text.trim()) return [];

  const issues = [];
  const isBuildRequest = BUILD_VERBS.test(text) && CODE_NOUNS.test(text);
  const isBugFixRequest = containsAny(text, ERROR_CONTEXT_KEYWORDS);
  const words = wordCount(text);

  if (isBuildRequest) {
    if (!containsAny(text, LANGUAGE_FRAMEWORK_KEYWORDS)) {
      issues.push('No language or framework specified - Copilot has to guess your stack, which can produce code you have to rewrite.');
    }
    if (!containsAny(text, FORMAT_HINT_KEYWORDS)) {
      issues.push('No output format specified (e.g. "just the code," "with comments," "explain as you go") - responses can end up longer or shorter than you wanted.');
    }
    if (!containsAny(text, CONSTRAINT_KEYWORDS)) {
      issues.push('No constraints mentioned (validation, error handling, responsive/mobile, etc.) - worth adding if these matter for this piece.');
    }
  }

  if (isBugFixRequest) {
    const hasErrorMessageHint = /".*"|error:|exception:|traceback|stack trace/i.test(text);
    if (!hasErrorMessageHint) {
      issues.push('No actual error message or stack trace included - pasting the exact error usually gets a faster, more accurate fix.');
    }
  }

  if (words <= 5 && (isBuildRequest || isBugFixRequest)) {
    issues.push(`Very short prompt (${words} words) for what it's asking - a bit more detail up front often avoids a back-and-forth.`);
  }

  return issues;
}

module.exports = { analyzePromptQuality };
