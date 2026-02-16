import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseKey;

let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

class SupabaseManager {
  private client: SupabaseClient | null;

  constructor() {
    this.client = supabase;
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not initialized. Please check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.');
    }
    return this.client;
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }
    
    try {
      const { data, error } = await this.client.from('jobs').select('id').limit(1);
      return !error;
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
  }
}

export const supabaseManager = new SupabaseManager();