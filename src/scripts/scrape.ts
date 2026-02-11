import axios from 'axios';
import cheerio from 'cheerio';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'jobs.db');
const db = new Database(dbPath);

// Create jobs table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    company TEXT,
    location TEXT,
    salary TEXT,
    type TEXT,
    description TEXT,
    url TEXT UNIQUE,
    source TEXT,
    posted_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Sample job sources (public job boards)
const jobSources = [
  {
    name: 'YC Jobs',
    url: 'https://www.ycombinator.com/jobs',
    scraper: scrapeYCJobs
  },
  // Add more sources here
];

async function scrapeYCJobs() {
  console.log('Scraping YC Jobs...');
  
  try {
    const response = await axios.get('https://www.ycombinator.com/jobs');
    const $ = cheerio.load(response.data);
    const jobs = [];
    
    $('.job-listings .job-row').each((index, element) => {
      const title = $(element).find('.job-title').text().trim();
      const company = $(element).find('.company-name').text().trim();
      const location = $(element).find('.job-location').text().trim();
      const url = 'https://www.ycombinator.com' + $(element).attr('href');
      
      if (title && company) {
        jobs.push({
          title,
          company,
          location: location || 'Remote',
          salary: 'Not specified',
          type: 'Full-time',
          description: '',
          url,
          source: 'YC Jobs',
          posted_date: new Date().toISOString()
        });
      }
    });
    
    console.log(`Found ${jobs.length} jobs from YC Jobs`);
    return jobs;
  } catch (error) {
    console.error('Error scraping YC Jobs:', error);
    return [];
  }
}

async function scrapeAllSources() {
  console.log('Starting job scraping process...');
  
  for (const source of jobSources) {
    try {
      const jobs = await source.scraper();
      
      // Save jobs to database
      const stmt = db.prepare(`
        INSERT OR IGNORE INTO jobs 
        (title, company, location, salary, type, description, url, source, posted_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const job of jobs) {
        stmt.run(
          job.title,
          job.company,
          job.location,
          job.salary,
          job.type,
          job.description,
          job.url,
          job.source,
          job.posted_date
        );
      }
      
      console.log(`Saved ${jobs.length} jobs from ${source.name}`);
    } catch (error) {
      console.error(`Error processing ${source.name}:`, error);
    }
  }
  
  // Show total jobs in database
  const count = db.prepare('SELECT COUNT(*) as total FROM jobs').get();
  console.log(`Total jobs in database: ${count.total}`);
  
  db.close();
  console.log('Scraping completed!');
}

// Run the scraper
if (require.main === module) {
  scrapeAllSources();
}

export { scrapeAllSources };