// Database connection handler
import supabaseConfig from '../config/supabaseConfig.js';

class DatabaseManager {
  constructor() {
    this.useSupabase = supabaseConfig.isEnabled;
  }

  isUsingSupabase() {
    return this.useSupabase;
  }

  isUsingSqlite() {
    return !this.useSupabase;
  }

  // Method to initialize database connection
  async initialize() {
    if (this.useSupabase) {
      // Initialize Supabase connection
      console.log('Using Supabase database');
      // Add Supabase initialization code here if needed
    } else {
      // Initialize SQLite connection
      console.log('Using SQLite database');
      // Add SQLite initialization code here if needed
    }
  }

  // Generic method to execute queries
  async executeQuery(query, params = []) {
    if (this.useSupabase) {
      // Use Supabase client for queries
      console.log('Executing Supabase query:', query);
      // Add Supabase query execution code here
      return [];
    } else {
      // Use SQLite for queries
      console.log('Executing SQLite query:', query);
      // Add SQLite query execution code here
      return [];
    }
  }
}

export const dbManager = new DatabaseManager();