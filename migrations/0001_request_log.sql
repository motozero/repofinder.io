-- Add allowlisted page and interaction request telemetry to an existing
-- RepoFinder D1 database. This migration is safe to run more than once.
CREATE TABLE IF NOT EXISTS request_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  method TEXT NOT NULL,
  visitor_id TEXT,
  repo TEXT,
  session_id TEXT,
  request_context TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_request_log_created ON request_log(created_at);
CREATE INDEX IF NOT EXISTS idx_request_log_event ON request_log(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_request_log_session ON request_log(session_id);
