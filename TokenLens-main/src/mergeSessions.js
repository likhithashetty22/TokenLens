function mergeSessions(dbSessions = [], liveSessions = []) {
  const tagged = dbSessions.map(s => ({ ...s, source: s.source ?? 'db' }));
  return [...tagged, ...liveSessions];
}

module.exports = { mergeSessions };
