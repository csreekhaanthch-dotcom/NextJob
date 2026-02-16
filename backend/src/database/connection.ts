import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { supabaseManager } from './supabaseConnection';

class DatabaseManager {
  private db: Database.Database | null;
  private isSqlite: boolean;

  constructor() {
    // Check if Supabase is configured and available
    const useSupabase = supabaseManager.isConfigured();
    
    if (useSupabase) {
      this.db = null;
      this.isSqlite = false;
      console.log('✅ Using Supabase database');
    } else {
      // Fallback to SQLite if Supabase is not configured
      this.isSqlite = true;
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
      
      console.log('ℹ️  Using SQLite database (fallback)');
    }
  }

  getDB(): Database.Database {
    if (this.isSqlite) {
      if (!this.db) {
        throw new Error('SQLite database not initialized');
      }
      return this.db;
    } else {
      throw new Error('Cannot use SQLite methods when Supabase is configured. Use supabaseManager instead.');
    }
  }

  getSupabaseClient() {
    return supabaseManager.getClient();
  }

  isUsingSqlite(): boolean {
    return this.isSqlite;
  }

  isUsingSupabase(): boolean {
    return !this.isSqlite;
  }

  prepare(statement: string): Database.Statement {
    if (this.isSqlite) {
      if (!this.db) {
        throw new Error('SQLite database not initialized');
      }
      return this.db.prepare(statement);
    } else {
      throw new Error('Cannot use SQLite methods when Supabase is configured. Use supabaseManager instead.');
    }
  }

  transaction<T>(fn: () => T): T {
    if (this.isSqlite) {
      if (!this.db) {
        throw new Error('SQLite database not initialized');
      }
      return this.db.transaction(fn)();
    } else {
      throw new Error('Cannot use SQLite methods when Supabase is configured. Use supabaseManager instead.');
    }
  }

  close(): void {
    if (this.isSqlite && this.db) {
      this.db.close();
    }
  }
}

export const dbManager = new DatabaseManager();
