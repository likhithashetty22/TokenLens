const path = require('path');
const vscode = require('vscode');
const { readAllSessions } = require('./src/db');
const { readLiveSessions } = require('./src/liveCapture');
const { mergeSessions } = require('./src/mergeSessions');
const { installHooks, removeHooks, hooksInstalled, getLiveCaptureLogPath } = require('./src/hooks');
const { analyzeAllSessions } = require('./src/detectors');
const {
  computeSessionScore,
  generateSessionGoodPoints,
  generateSessionImprovements,
  generateGlobalFeedback
} = require('./src/feedback');
const { renderDashboard } = require('./src/webview');

function activate(context) {
  const showDashboard = vscode.commands.registerCommand('copilotPromptCoach.showDashboard', async () => {
    const panel = vscode.window.createWebviewPanel(
      'copilotPromptCoach',
      'Prompt Coach',
      vscode.ViewColumn.One,
      { enableScripts: false }
    );

    try {
      let dbSessions = [];
      try {
        dbSessions = await readAllSessions();
      } catch (err) {
        console.warn('DB read failed, continuing with live data only:', err.message);
      }

      let liveSessions = [];
      if (hooksInstalled()) {
        liveSessions = readLiveSessions(getLiveCaptureLogPath());
      }

      const sessions = mergeSessions(dbSessions, liveSessions);
      const analysis = analyzeAllSessions(sessions);

      const scoresBySession = {};
      const goodPointsBySession = {};
      const improvementsBySession = {};
      for (const sessionReport of analysis.perSession) {
        scoresBySession[sessionReport.sessionId] = computeSessionScore(sessionReport);
        goodPointsBySession[sessionReport.sessionId] = generateSessionGoodPoints(sessionReport);
        improvementsBySession[sessionReport.sessionId] = generateSessionImprovements(sessionReport);
      }
      const globalTips = generateGlobalFeedback(analysis);
      const totalTurns = sessions.reduce((sum, s) => sum + s.turns.length, 0);

      panel.webview.html = renderDashboard({
        analysis,
        globalTips,
        sessionCount: sessions.length,
        totalTurns,
        scoresBySession,
        goodPointsBySession,
        improvementsBySession
      });
    } catch (err) {
      panel.webview.html = `
        <body style="font-family: sans-serif; padding: 20px; background:#0d1117; color:#e6edf3;">
          <h2>Couldn't load Copilot session data</h2>
          <p>${err.message.replace(/\n/g, '<br>')}</p>
        </body>`;
    }
  });

  const installLiveCapture = vscode.commands.registerCommand('copilotPromptCoach.installLiveCapture', async () => {
    try {
      const loggerSource = path.join(context.extensionPath, 'scripts', 'hook-logger.js');
      const { configPath, logPath } = installHooks(loggerSource);
      vscode.window.showInformationMessage(
        `Live capture hooks installed at ${configPath}. Events will log to ${logPath} as you use Copilot going forward.`
      );
    } catch (err) {
      vscode.window.showErrorMessage(`Couldn't install hooks: ${err.message}`);
    }
  });

  const removeLiveCapture = vscode.commands.registerCommand('copilotPromptCoach.removeLiveCapture', async () => {
    const removed = removeHooks();
    vscode.window.showInformationMessage(removed ? 'Live capture hooks removed.' : 'No live capture hooks were installed.');
  });

  context.subscriptions.push(showDashboard, installLiveCapture, removeLiveCapture);
}

function deactivate() {}

module.exports = { activate, deactivate };
