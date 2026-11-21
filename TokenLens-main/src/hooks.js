const fs = require('fs');
const path = require('path');
const os = require('os');

function getHookConfigPath() {
  return path.join(os.homedir(), '.copilot', 'hooks', 'prompt-coach.json');
}

function getLiveCaptureLogPath() {
  return path.join(os.homedir(), '.copilot-prompt-coach', 'live-events.jsonl');
}

function buildHookConfig(loggerScriptPath, logPath) {
  const events = ['sessionStart', 'sessionEnd', 'userPromptSubmitted', 'postToolUse', 'errorOccurred'];
  const hooks = {};

  for (const eventName of events) {
    const nodeCommand = `node "${loggerScriptPath}" ${eventName} "${logPath}"`;
    hooks[eventName] = [
      { type: 'command', bash: nodeCommand, powershell: nodeCommand, timeoutSec: 10 }
    ];
  }

  return { version: 1, hooks };
}

function ensureLoggerScriptInstalled(extensionScriptSourcePath) {
  const destDir = path.join(os.homedir(), '.copilot-prompt-coach');
  const destPath = path.join(destDir, 'hook-logger.js');
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(extensionScriptSourcePath, destPath);
  return destPath;
}

function installHooks(extensionScriptSourcePath) {
  const loggerPath = ensureLoggerScriptInstalled(extensionScriptSourcePath);
  const logPath = getLiveCaptureLogPath();
  const config = buildHookConfig(loggerPath, logPath);

  const configPath = getHookConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  return { configPath, loggerPath, logPath };
}

function removeHooks() {
  const configPath = getHookConfigPath();
  if (fs.existsSync(configPath)) {
    fs.unlinkSync(configPath);
    return true;
  }
  return false;
}

function hooksInstalled() {
  return fs.existsSync(getHookConfigPath());
}

module.exports = { getHookConfigPath, getLiveCaptureLogPath, installHooks, removeHooks, hooksInstalled };
