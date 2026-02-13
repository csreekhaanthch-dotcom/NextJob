import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const isRender = Boolean(process.env.RENDER);
    const dbPath = isRender
      ? path.join('/tmp', 'jobs.db')
      : path.join(process.cwd(), 'data', 'jobs.db');

    if (!isRender) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }

    this.db = new Database(dbPath);

    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');

    // Set busy timeout
    this.db.pragma('busy_timeout = 30000');

    // Enable foreign key constraints
    this.db.pragma('foreign_keys = ON');

    // Optimize for read-heavy workload
    this.db.pragma('cache_size = 10000');
    this.db.pragma('temp_store = MEMORY');
  }

  getDB(): Database.Database {
    return this.db;
  }

  prepare(statement: string): Database.Statement {
    return this.db.prepare(statement);
  }

  transaction(fn: () => void): Database.Transaction {
    return this.db.transaction(fn);
  }

  close() {
    this.db.close();
  }
}

export const dbManager = new DatabaseManager();