import Database from 'better-sqlite3';
import path from 'path';

// Test database connection and functionality
try {
  const dbPath = path.join(process.cwd(), 'jobs.db');
  const db = new Database(dbPath);
  
  // Create a test table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Insert a test record
  const stmt = db.prepare('INSERT INTO test (name) VALUES (?)');
  const result = stmt.run('Database test');
  
  console.log('Database test successful!');
  console.log('Inserted record with ID:', result.lastInsertRowid);
  
  // Query the record back
  const row = db.prepare('SELECT * FROM test WHERE id = ?').get(result.lastInsertRowid);
  console.log('Retrieved record:', row);
  
  // Clean up test table
  db.exec('DROP TABLE IF EXISTS test');
  
  db.close();
} catch (error) {
  console.error('Database test failed:', error);
}