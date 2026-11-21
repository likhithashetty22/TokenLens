#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const eventName = process.argv[2] || 'unknown';
const logPath = process.argv[3];

if (!logPath) process.exit(0);

const SECRET_KEY_PATTERN = /(key|token|secret|password|credential|auth)/i;
const SECRET_VALUE_PATTERN = /(gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,})/;

function redact(value, keyHint = '') {
  if (typeof value === 'string') {
    if (SECRET_KEY_PATTERN.test(keyHint) || SECRET_VALUE_PATTERN.test(value)) return '[REDACTED]';
    return value;
  }
  if (Array.isArray(value)) return value.map(v => redact(v));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = redact(v, k);
    return out;
  }
  return value;
}

let raw = '';
process.stdin.on('data', chunk => { raw += chunk; });
process.stdin.on('end', () => {
  let payload;
  try {
    payload = raw.trim() ? JSON.parse(raw) : {};
  } catch {
    payload = { unparsedRaw: raw.slice(0, 500) };
  }

  const record = { loggedAt: new Date().toISOString(), event: eventName, payload: redact(payload) };

  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, JSON.stringify(record) + '\n');
  } catch {
    // Never let a logging failure break the user's actual Copilot session
  }

  process.exit(0);
});

setTimeout(() => process.exit(0), 5000);
