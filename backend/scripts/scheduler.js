#!/usr/bin/env node
/**
 * Job Scraping Scheduler
 * Periodically fetches jobs from all sources and stores them in the database
 */

require('dotenv').config();
const cron = require('node-cron');
const { 
  initializeSchema, 
  upsertJobs, 
  deleteExpiredJobs, 
  recordScrapingStats,
  closeConnection 
} = require('../src/database/connection');
const greenhouseModule = require('../src/scrapers/greenhouse');
const leverModule = require('../src/scrapers/lever');
const jobScraper = require('../scraper');

const greenhouseScraper = greenhouseModule.scraper;
const leverScraper = leverModule.scraper;

const SCHEDULE = process.env.SCRAPER_SCHEDULE || '0 */6 * * *'; // Every 6 hours by default
const PRIORITY = parseInt(process.env.SCRAPER_PRIORITY || '2', 10);
const ENABLE_SCHEDULER = process.env.ENABLE_SCHEDULER !== 'false';

console.log('═══════════════════════════════════════════════════');
console.log('  NextJob Scraping Scheduler');
console.log('═══════════════════════════════════════════════════\n');

if (!ENABLE_SCHEDULER) {
  console.log('⏸️  Scheduler is disabled (set ENABLE_SCHEDULER=true to enable)');
  process.exit(0);
}

// Initialize database
initializeSchema();

/**
 * Run scraping for all sources
 */
async function runScraping() {
  const startTime = new Date();
  console.log(`\n[${startTime.toISOString()}] Starting job scraping...`);
  
  const stats = {
    greenhouse: { fetched: 0, added: 0, updated: 0, failed: 0 },
    lever: { fetched: 0, added: 0, updated: 0, failed: 0 },
    jobBoards: { fetched: 0, added: 0, updated: 0, failed: 0 },
  };
  
  try {
    // Clean up expired jobs first
    const deleted = deleteExpiredJobs();
    console.log(`🗑️  Deleted ${deleted} expired jobs`);
    
    // Scrape Greenhouse
    console.log('\n📡 Scraping Greenhouse...');
    try {
      const greenhouseJobs = await greenhouseScraper.fetchAllJobs({ priority: PRIORITY });
      console.log(`   Fetched ${greenhouseJobs.length} jobs from Greenhouse`);
      stats.greenhouse.fetched = greenhouseJobs.length;
      
      const result = upsertJobs(greenhouseJobs);
      stats.greenhouse.added = result.added;
      stats.greenhouse.updated = result.updated;
      console.log(`   Added: ${result.added}, Updated: ${result.updated}`);
      
      recordScrapingStats({
        source: 'greenhouse',
        jobs_fetched: greenhouseJobs.length,
        jobs_added: result.added,
        jobs_updated: result.updated,
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('   ❌ Greenhouse error:', error.message);
      stats.greenhouse.failed = 1;
      recordScrapingStats({
        source: 'greenhouse',
        jobs_fetched: 0,
        jobs_added: 0,
        jobs_updated: 0,
        jobs_failed: 1,
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        error_message: error.message,
      });
    }
    
    // Scrape Lever
    console.log('\n📡 Scraping Lever...');
    try {
      const leverJobs = await leverScraper.fetchAllJobs({ priority: PRIORITY });
      console.log(`   Fetched ${leverJobs.length} jobs from Lever`);
      stats.lever.fetched = leverJobs.length;
      
      const result = upsertJobs(leverJobs);
      stats.lever.added = result.added;
      stats.lever.updated = result.updated;
      console.log(`   Added: ${result.added}, Updated: ${result.updated}`);
      
      recordScrapingStats({
        source: 'lever',
        jobs_fetched: leverJobs.length,
        jobs_added: result.added,
        jobs_updated: result.updated,
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('   ❌ Lever error:', error.message);
      stats.lever.failed = 1;
      recordScrapingStats({
        source: 'lever',
        jobs_fetched: 0,
        jobs_added: 0,
        jobs_updated: 0,
        jobs_failed: 1,
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        error_message: error.message,
      });
    }
    
    // Scrape job boards
    console.log('\n📡 Scraping Job Boards...');
    try {
      const jobBoardJobs = await jobScraper.fetchAllJobs({
        sources: ['remotive', 'arbeitnow', 'remoteok', 'usajobs'],
        useATS: false,
      });
      console.log(`   Fetched ${jobBoardJobs.length} jobs from job boards`);
      stats.jobBoards.fetched = jobBoardJobs.length;
      
      const result = upsertJobs(jobBoardJobs);
      stats.jobBoards.added = result.added;
      stats.jobBoards.updated = result.updated;
      console.log(`   Added: ${result.added}, Updated: ${result.updated}`);
      
      recordScrapingStats({
        source: 'job_boards',
        jobs_fetched: jobBoardJobs.length,
        jobs_added: result.added,
        jobs_updated: result.updated,
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('   ❌ Job boards error:', error.message);
      stats.jobBoards.failed = 1;
      recordScrapingStats({
        source: 'job_boards',
        jobs_fetched: 0,
        jobs_added: 0,
        jobs_updated: 0,
        jobs_failed: 1,
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
        error_message: error.message,
      });
    }
    
    const duration = (new Date() - startTime) / 1000;
    const totalAdded = stats.greenhouse.added + stats.lever.added + stats.jobBoards.added;
    const totalUpdated = stats.greenhouse.updated + stats.lever.updated + stats.jobBoards.updated;
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  Scraping Complete');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Duration: ${duration.toFixed(1)}s`);
    console.log(`  Total Added: ${totalAdded}`);
    console.log(`  Total Updated: ${totalUpdated}`);
    console.log('═══════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Scraping failed:', error.message);
  }
}

// Run once immediately if RUN_NOW is set
if (process.env.RUN_NOW === 'true') {
  console.log('🚀 Running scraping immediately...\n');
  runScraping().then(() => {
    closeConnection();
    process.exit(0);
  }).catch(error => {
    console.error('Fatal error:', error);
    closeConnection();
    process.exit(1);
  });
} else {
  // Schedule regular runs
  console.log(`📅 Schedule: ${SCHEDULE} (cron format)`);
  console.log(`🎯 Priority: ${PRIORITY}`);
  console.log('⏳ Waiting for next scheduled run...\n');
  
  cron.schedule(SCHEDULE, runScraping);
  
  // Also run once on startup
  console.log('🚀 Running initial scraping...\n');
  runScraping();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down scheduler...');
  closeConnection();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down scheduler...');
  closeConnection();
  process.exit(0);
});
