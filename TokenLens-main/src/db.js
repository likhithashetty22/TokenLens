const path = require('path');
const os = require('os');
const fs = require('fs');
const initSqlJs = require('sql.js');

function findSessionStorePath() {
  const platform = os.platform();
  let base;

  if (platform === 'win32') {
    base = path.join(process.env.APPDATA || '', 'Code', 'User', 'globalStorage', 'github.copilot-chat');
  } else if (platform === 'darwin') {
    base = path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User', 'globalStorage', 'github.copilot-chat');
  } else {
    base = path.join(os.homedir(), '.config', 'Code', 'User', 'globalStorage', 'github.copilot-chat');
  }

  const dbPath = path.join(base, 'session-store.db');

  if (!fs.existsSync(dbPath)) {
    throw new Error(
      `Could not find Copilot session-store.db at expected path:\n${dbPath}\n\n` +
      `This likely means either:\n` +
      `  - You haven't used Copilot Chat's agent-mode sessions yet\n` +
      `  - GitHub has changed the storage location/format in a newer version\n` +
      `  - You're on a platform whose path isn't verified yet (Linux path is a best guess)`
    );
  }

  return dbPath;
}

function mergeWalIntoDb(dbBuffer, walBuffer) {
  const WAL_HEADER_SIZE = 32;
  const FRAME_HEADER_SIZE = 24;

  if (!walBuffer || walBuffer.length < WAL_HEADER_SIZE) return dbBuffer;

  const magic = walBuffer.readUInt32BE(0);
  const validMagic = magic === 0x377f0682 || magic === 0x377f0683;
  if (!validMagic) return dbBuffer;

  let pageSize = walBuffer.readUInt32BE(8);
  if (pageSize === 1) pageSize = 65536;

  const headerSalt1 = walBuffer.readUInt32BE(16);
  const headerSalt2 = walBuffer.readUInt32BE(20);
  const frameSize = FRAME_HEADER_SIZE + pageSize;

  const pages = new Map();
  let lastCommittedDbSizeInPages = null;

  let offset = WAL_HEADER_SIZE;
  while (offset + frameSize <= walBuffer.length) {
    const pageNumber = walBuffer.readUInt32BE(offset);
    const dbSizeAfterCommit = walBuffer.readUInt32BE(offset + 4);
    const salt1 = walBuffer.readUInt32BE(offset + 8);
    const salt2 = walBuffer.readUInt32BE(offset + 12);
    const pageData = walBuffer.subarray(offset + FRAME_HEADER_SIZE, offset + frameSize);

    if (salt1 === headerSalt1 && salt2 === headerSalt2) {
      pages.set(pageNumber, Buffer.from(pageData));
      if (dbSizeAfterCommit !== 0) lastCommittedDbSizeInPages = dbSizeAfterCommit;
    }

    offset += frameSize;
  }

  if (pages.size === 0 || lastCommittedDbSizeInPages === null) return dbBuffer;

  const finalSize = lastCommittedDbSizeInPages * pageSize;
  const merged = Buffer.alloc(finalSize);
  dbBuffer.copy(merged, 0, 0, Math.min(dbBuffer.length, finalSize));

  for (const [pageNumber, data] of pages.entries()) {
    if (pageNumber < 1) continue;
    const pageOffset = (pageNumber - 1) * pageSize;
    if (pageOffset + pageSize <= finalSize) data.copy(merged, pageOffset);
  }

  return merged;
}

function readMergedDbBuffer(dbPath) {
  const dbBuffer = fs.readFileSync(dbPath);
  const walPath = dbPath + '-wal';
  if (!fs.existsSync(walPath)) return dbBuffer;

  try {
    const walBuffer = fs.readFileSync(walPath);
    return mergeWalIntoDb(dbBuffer, walBuffer);
  } catch (err) {
    console.warn('WAL merge failed, falling back to unmerged db file:', err.message);
    return dbBuffer;
  }
}

function resultToObjects(result) {
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

async function readAllSessions() {
  const dbPath = findSessionStorePath();
  const mergedBuffer = readMergedDbBuffer(dbPath);

  const SQL = await initSqlJs({
    locateFile: file => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file)
  });

  const db = new SQL.Database(mergedBuffer);

  let sessions, turns;

  try {
    sessions = resultToObjects(db.exec(`SELECT * FROM sessions`));
  } catch (err) {
    db.close();
    throw new Error(`Failed to read "sessions" table - schema may have changed. Original error: ${err.message}`);
  }

  try {
    turns = resultToObjects(db.exec(`SELECT * FROM turns ORDER BY session_id, timestamp ASC`));
  } catch (err) {
    db.close();
    throw new Error(`Failed to read "turns" table - schema may have changed. Original error: ${err.message}`);
  }

  db.close();

  const turnsBySession = {};
  for (const t of turns) {
    const sid = t.session_id;
    if (!turnsBySession[sid]) turnsBySession[sid] = [];
    turnsBySession[sid].push({
      id: t.id,
      turnIndex: t.turn_index,
      userMessage: t.user_message ?? '',
      assistantResponse: t.assistant_response,
      timestamp: t.timestamp ? new Date(t.timestamp).getTime() : null
    });
  }

  return sessions.map(s => ({
    id: s.id,
    cwd: s.cwd ?? 'unknown',
    summary: s.summary ?? '(no summary)',
    agentName: s.agent_name ?? 'unknown',
    hostType: s.host_type ?? 'unknown',
    turns: turnsBySession[s.id] || []
  }));
}

module.exports = { readAllSessions, findSessionStorePath };
