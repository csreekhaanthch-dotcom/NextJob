// Simple test to verify Supabase integration
const { supabaseManager } = require('./dist/database/supabaseConnection');
const { dbManager } = require('./dist/database/connection');

console.log('Testing Supabase integration...');

// Check if Supabase is configured
console.log('Supabase configured:', supabaseManager.isConfigured());
console.log('Using Supabase:', dbManager.isUsingSupabase());
console.log('Using SQLite:', dbManager.isUsingSqlite());

if (supabaseManager.isConfigured()) {
  console.log('✅ Supabase is properly configured');
  
  // Test connection
  supabaseManager.testConnection()
    .then(connected => {
      console.log('✅ Supabase connection test:', connected ? 'PASSED' : 'FAILED');
      process.exit(connected ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Supabase connection test failed:', error.message);
      process.exit(1);
    });
} else {
  console.log('ℹ️  Supabase not configured, using SQLite fallback');
  process.exit(0);
}