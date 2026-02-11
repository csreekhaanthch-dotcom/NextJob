import Database from 'better-sqlite3';
import path from 'path';

class DatabaseManager {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'jobs.db');
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

  getDB() {
    return this.db;
  }

  prepare(statement: string) {
    return this.db.prepare(statement);
  }

  transaction(fn: () => void) {
    return this.db.transaction(fn);
  }

  close() {
    this.db.close();
  }
}

export const dbManager = new DatabaseManager();