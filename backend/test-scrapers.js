/**
 * Test Script for Job Scrapers
 * Run with: node test-scrapers.js
 */

require('dotenv').config();
const { greenhouseScraper, leverScraper } = require('./src/scrapers/greenhouse');
const { LeverScraper } = require('./src/scrapers/lever');

const jobScraper = require('./scraper');

async function testGreenhouseScraper() {
  console.log('\n=== Testing Greenhouse Scraper ===');

  try {
    // Test fetching all jobs (limited to 5 companies for testing)
    console.log('Fetching jobs from Greenhouse (priority 2)...');
    const jobs = await greenhouseScraper.fetchJobs({ priority: 2, limit: 10 });

    console.log(`✅ Found ${jobs.length} jobs from Greenhouse`);

    if (jobs.length > 0) {
      console.log('\nSample job:');
      const sample = jobs[0];
      console.log(`  Title: ${sample.title}`);
      console.log(`  Company: ${sample.company}`);
      console.log(`  Location: ${sample.location}`);
      console.log(`  URL: ${sample.url}`);
      console.log(`  Source: ${sample.source}`);
    }

    return jobs.length;
  } catch (error) {
    console.error('❌ Greenhouse scraper error:', error.message);
    return 0;
  }
}

async function testLeverScraper() {
  console.log('\n=== Testing Lever Scraper ===');

  try {
    // Test fetching all jobs
    console.log('Fetching jobs from Lever (priority 2)...');
    const jobs = await leverScraper.fetchJobs({ priority: 2, limit: 10 });

    console.log(`✅ Found ${jobs.length} jobs from Lever`);

    if (jobs.length > 0) {
      console.log('\nSample job:');
      const sample = jobs[0];
      console.log(`  Title: ${sample.title}`);
      console.log(`  Company: ${sample.company}`);
      console.log(`  Location: ${sample.location}`);
      console.log(`  URL: ${sample.url}`);
      console.log(`  Source: ${sample.source}`);
    }

    return jobs.length;
  } catch (error) {
    console.error('❌ Lever scraper error:', error.message);
    return 0;
  }
}

async function testSpecificCompany() {
  console.log('\n=== Testing Specific Company (Stripe) ===');

  try {
    const jobs = await greenhouseScraper.fetchJobs({
      company: 'Stripe',
      limit: 5,
    });

    console.log(`✅ Found ${jobs.length} jobs at Stripe`);

    if (jobs.length > 0) {
      console.log('\nSample Stripe job:');
      const sample = jobs[0];
      console.log(`  Title: ${sample.title}`);
      console.log(`  Location: ${sample.location}`);
      console.log(`  URL: ${sample.url}`);
    }

    return jobs.length;
  } catch (error) {
    console.error('❌ Error fetching Stripe jobs:', error.message);
    return 0;
  }
}

async function testMainScraper() {
  console.log('\n=== Testing Main Scraper Module ===');

  try {
    // Test with all sources (limited for testing)
    const jobs = await jobScraper.fetchAllJobs({
      query: 'software engineer',
      location: 'Remote',
      sources: ['greenhouse', 'lever'],
      useATS: true,
      priority: 2,
    });

    console.log(`✅ Found ${jobs.length} total jobs`);
    console.log('Sources used:', ['Greenhouse', 'Lever']);

    return jobs.length;
  } catch (error) {
    console.error('❌ Main scraper error:', error.message);
    return 0;
  }
}

async function testGetSources() {
  console.log('\n=== Testing getAvailableSources() ===');

  try {
    const sources = jobScraper.getAvailableSources();
    
    console.log('Available sources:');
    Object.entries(sources).forEach(([key, source]) => {
      const configured = source.configured ? '✅' : '❌';
      const companies = source.companies ? `(${source.companies} companies)` : '';
      console.log(`  ${configured} ${key}: ${source.name} ${companies}`);
    });

    return sources;
  } catch (error) {
    console.error('❌ Error getting sources:', error.message);
    return null;
  }
}

async function testGetATSSources() {
  console.log('\n=== Testing getATSSources() ===');

  try {
    const atsSources = jobScraper.getATSSources();
    
    Object.entries(atsSources).forEach(([key, ats]) => {
      console.log(`\n${ats.name}:`);
      console.log(`  Total companies: ${ats.total}`);
      
      if (ats.companies && ats.companies.length > 0) {
        console.log('  Sample companies:');
        ats.companies.slice(0, 5).forEach(company => {
          const enabled = company.enabled ? '✅' : '❌';
          console.log(`    ${enabled} ${company.name} (Priority: ${company.priority})`);
        });
        if (ats.companies.length > 5) {
          console.log(`    ... and ${ats.companies.length - 5} more`);
        }
      }
    });

    return atsSources;
  } catch (error) {
    console.error('❌ Error getting ATS sources:', error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         Job Scraper Test Suite                            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const results = {
    greenhouse: 0,
    lever: 0,
    specificCompany: 0,
    mainScraper: 0,
    sources: null,
    atsSources: null,
  };

  try {
    results.greenhouse = await testGreenhouseScraper();
    results.lever = await testLeverScraper();
    results.specificCompany = await testSpecificCompany();
    results.mainScraper = await testMainScraper();
    results.sources = await testGetSources();
    results.atsSources = await testGetATSSources();

    // Summary
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    Test Summary                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    console.log(`\nGreenhouse Scraper: ${results.greenhouse > 0 ? '✅ PASS' : '❌ FAIL'} (${results.greenhouse} jobs)`);
    console.log(`Lever Scraper: ${results.lever > 0 ? '✅ PASS' : '❌ FAIL'} (${results.lever} jobs)`);
    console.log(`Specific Company: ${results.specificCompany > 0 ? '✅ PASS' : '❌ FAIL'} (${results.specificCompany} jobs)`);
    console.log(`Main Scraper: ${results.mainScraper > 0 ? '✅ PASS' : '❌ FAIL'} (${results.mainScraper} jobs)`);
    console.log(`Sources API: ${results.sources ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`ATS Sources API: ${results.atsSources ? '✅ PASS' : '❌ FAIL'}`);

    const allPass = results.greenhouse > 0 && results.lever > 0 && results.mainScraper > 0;

    console.log('\n' + (allPass ? '✅ All tests passed!' : '⚠️  Some tests failed'));
    console.log('\nNote: Test results depend on network availability and company job postings.');
    console.log('If tests fail, check:');
    console.log('  1. Internet connection');
    console.log('  2. Company job pages are accessible');
    console.log('  3. Rate limits are not exceeded');
    console.log('  4. Environment variables are set (optional)');

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    console.error(error.stack);
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testGreenhouseScraper,
  testLeverScraper,
  testSpecificCompany,
  testMainScraper,
  testGetSources,
  testGetATSSources,
  runAllTests,
};
