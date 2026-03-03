#!/usr/bin/env node
/**
 * Complete Setup Script for NextJob
 * Initializes database and runs initial scraping
 */

const { initializeSchema, getJobCount, closeConnection, upsertJobs } = require('../src/database/connection');
const greenhouseModule = require('../src/scrapers/greenhouse');
const leverModule = require('../src/scrapers/lever');
const jobScraper = require('../scraper');

const greenhouseScraper = greenhouseModule.scraper || greenhouseModule.GreenhouseScraper;
const leverScraper = leverModule.scraper || leverModule.LeverScraper;

const PRIORITY = parseInt(process.env.SCRAPER_PRIORITY || '2', 10);

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║           NextJob Complete Setup                          ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function setup() {
  try {
    // Step 1: Initialize database
    console.log('📦 Step 1: Initializing database...');
    initializeSchema();
    console.log('   ✅ Database initialized\n');

    // Step 2: Check current job count
    const initialCount = getJobCount();
    console.log(`📊 Step 2: Current job count: ${initialCount}\n`);

    // Step 3: Scrape Greenhouse companies
    console.log('🌱 Step 3: Scraping Greenhouse companies...');
    console.log(`   Fetching from priority ${PRIORITY} companies...`);
    
    try {
      const greenhouseJobs = await greenhouseScraper.fetchAllJobs({ priority: PRIORITY });
      console.log(`   Fetched ${greenhouseJobs.length} jobs from Greenhouse`);
      
      const greenhouseResult = upsertJobs(greenhouseJobs);
      console.log(`   Added: ${greenhouseResult.added}, Updated: ${greenhouseResult.updated}`);
    } catch (error) {
      console.error(`   ❌ Greenhouse error: ${error.message}`);
    }

    // Step 4: Scrape Lever companies
    console.log('\n🔧 Step 4: Scraping Lever companies...');
    
    try {
      const leverJobs = await leverScraper.fetchAllJobs({ priority: PRIORITY });
      console.log(`   Fetched ${leverJobs.length} jobs from Lever`);
      
      const leverResult = upsertJobs(leverJobs);
      console.log(`   Added: ${leverResult.added}, Updated: ${leverResult.updated}`);
    } catch (error) {
      console.error(`   ❌ Lever error: ${error.message}`);
    }

    // Step 5: Scrape job boards
    console.log('\n📡 Step 5: Scraping job boards...');
    
    try {
      const jobBoardJobs = await jobScraper.fetchAllJobs({
        sources: ['remotive', 'arbeitnow', 'remoteok'],
        useATS: false,
      });
      console.log(`   Fetched ${jobBoardJobs.length} jobs from job boards`);
      
      const jobBoardResult = upsertJobs(jobBoardJobs);
      console.log(`   Added: ${jobBoardResult.added}, Updated: ${jobBoardResult.updated}`);
    } catch (error) {
      console.error(`   ❌ Job boards error: ${error.message}`);
    }

    // Step 6: Final stats
    const finalCount = getJobCount();
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    Setup Complete                         ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`  Initial jobs: ${initialCount}`);
    console.log(`  Final jobs: ${finalCount}`);
    console.log(`  New jobs added: ${finalCount - initialCount}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🚀 Next steps:');
    console.log('  1. Start the server: npm start');
    console.log('  2. Or run the scheduler: npm run scheduler');
    console.log('  3. API available at: http://localhost:3001');
    console.log('');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    closeConnection();
  }
}

setup();
