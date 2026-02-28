const Database = require("better-sqlite3");

const db = new Database("notes.db");

db.prepare(`
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT,
    content TEXT,
    color TEXT,
    font TEXT,
    align TEXT,
    date TEXT
)
`).run();

module.exports = db;