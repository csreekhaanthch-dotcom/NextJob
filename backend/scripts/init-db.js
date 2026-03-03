#!/usr/bin/env node
/**
 * Database Initialization Script
 * Run this to set up the SQLite database
 */

const { initializeSchema, getConnection, closeConnection } = require('../src/database/connection');

console.log('═══════════════════════════════════════════════════');
console.log('  NextJob Database Initialization');
console.log('═══════════════════════════════════════════════════\n');

try {
  // Initialize schema
  initializeSchema();
  
  const db = getConnection();
  
  // Verify tables were created
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name IN ('jobs', 'scraping_stats', 'saved_jobs', 'job_applications', 'job_alerts')
  `).all();
  
  console.log('✅ Database tables created:');
  tables.forEach(t => console.log(`   - ${t.name}`));
  
  // Check FTS table
  const ftsTables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name LIKE 'jobs_fts%'
  `).all();
  
  if (ftsTables.length > 0) {
    console.log('\n✅ Full-text search index created:');
    ftsTables.forEach(t => console.log(`   - ${t.name}`));
  }
  
  // Show database stats
  const settings = db.prepare('SELECT key, value FROM app_settings').all();
  console.log('\n✅ Default settings:');
  settings.forEach(s => console.log(`   - ${s.key}: ${s.value}`));
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Database initialized successfully!');
  console.log('═══════════════════════════════════════════════════');
  
} catch (error) {
  console.error('\n❌ Database initialization failed:', error.message);
  process.exit(1);
} finally {
  closeConnection();
}
