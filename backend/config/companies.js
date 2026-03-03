/**
 * Company Configuration for Job Scraping
 * Organized by ATS (Applicant Tracking System) type
 * Only includes companies with valid, working board URLs
 */

module.exports = {
  // Greenhouse ATS - Official Public API
  // Verified working boards - companies that return valid data
  greenhouse: [
    // Priority 1 - Major tech companies (verified working)
    { name: 'Stripe', board: 'stripe', enabled: true, priority: 1 },
    { name: 'Airbnb', board: 'airbnb', enabled: true, priority: 1 },
    { name: 'Dropbox', board: 'dropbox', enabled: true, priority: 1 },
    { name: 'Lyft', board: 'lyft', enabled: true, priority: 1 },
    { name: 'Twilio', board: 'twilio', enabled: true, priority: 1 },
    { name: 'Coinbase', board: 'coinbase', enabled: true, priority: 1 },
    { name: 'Robinhood', board: 'robinhood', enabled: true, priority: 1 },
    { name: 'Figma', board: 'figma', enabled: true, priority: 1 },
    { name: 'Discord', board: 'discord', enabled: true, priority: 1 },
    { name: 'Reddit', board: 'reddit', enabled: true, priority: 1 },
    { name: 'Pinterest', board: 'pinterest', enabled: true, priority: 1 },
    { name: 'Instacart', board: 'instacart', enabled: true, priority: 1 },
    { name: 'Databricks', board: 'databricks', enabled: true, priority: 1 },
    { name: 'CrowdStrike', board: 'crowdstrike', enabled: true, priority: 1 },
    { name: 'HashiCorp', board: 'hashicorp', enabled: true, priority: 1 },
    { name: 'MongoDB', board: 'mongodb', enabled: true, priority: 1 },
    { name: 'Elastic', board: 'elastic', enabled: true, priority: 1 },
    { name: 'Datadog', board: 'datadog', enabled: true, priority: 1 },
    { name: 'ClickHouse', board: 'clickhouse', enabled: true, priority: 1 },
    { name: 'Vercel', board: 'vercel', enabled: true, priority: 1 },
    { name: 'Netlify', board: 'netlify', enabled: true, priority: 1 },
    { name: 'Postman', board: 'postman', enabled: true, priority: 1 },
    { name: 'GitLab', board: 'gitlab', enabled: true, priority: 1 },
    { name: 'Warp', board: 'warp', enabled: true, priority: 1 },
    { name: 'PlanetScale', board: 'planetscale', enabled: true, priority: 1 },

    // Priority 2 - Popular SaaS and tools (verified working)
    { name: 'Airtable', board: 'airtable', enabled: true, priority: 2 },
    { name: 'Asana', board: 'asana', enabled: true, priority: 2 },
    { name: 'Monday', board: 'monday', enabled: true, priority: 2 },
    { name: 'Coda', board: 'coda', enabled: true, priority: 2 },
    { name: 'Slack', board: 'slack', enabled: true, priority: 2 },
    { name: 'Zoom', board: 'zoom', enabled: true, priority: 2 },
    { name: 'Webflow', board: 'webflow', enabled: true, priority: 2 },
    { name: 'Framer', board: 'framer', enabled: true, priority: 2 },
    { name: 'Retool', board: 'retool', enabled: true, priority: 2 },
    { name: 'Metabase', board: 'metabase', enabled: true, priority: 2 },
    { name: 'Fivetran', board: 'fivetran', enabled: true, priority: 2 },
    { name: 'Amplitude', board: 'amplitude', enabled: true, priority: 2 },
    { name: 'Mixpanel', board: 'mixpanel', enabled: true, priority: 2 },
    { name: 'Braze', board: 'braze', enabled: true, priority: 2 },
    { name: 'Klaviyo', board: 'klaviyo', enabled: true, priority: 2 },
    { name: 'Apollo', board: 'apollo', enabled: true, priority: 2 },
    { name: 'Descript', board: 'descript', enabled: true, priority: 2 },
    { name: 'Grammarly', board: 'grammarly', enabled: true, priority: 2 },
    { name: 'Customer.io', board: 'customerio', enabled: true, priority: 2 },
    { name: 'Iterable', board: 'iterable', enabled: true, priority: 2 },

    // Priority 2 - AI/ML companies (verified working)
    { name: 'Anthropic', board: 'anthropic', enabled: true, priority: 2 },
    { name: 'Hugging Face', board: 'hugging-face', enabled: true, priority: 2 },
    { name: 'Weights & Biases', board: 'weights-and-biases', enabled: true, priority: 2 },

    // Priority 2 - Data engineering companies (verified working)
    { name: 'Dagster', board: 'dagster', enabled: true, priority: 2 },
    { name: 'Prefect', board: 'prefect', enabled: true, priority: 2 },
    { name: 'Temporal', board: 'temporal', enabled: true, priority: 2 },
    { name: 'Confluent', board: 'confluent', enabled: true, priority: 2 },
    { name: 'Materialize', board: 'materialize', enabled: true, priority: 2 },

    // Additional verified companies
    { name: 'Trello', board: 'trello', enabled: true, priority: 2 },
    { name: 'Atlassian', board: 'atlassian', enabled: true, priority: 2 },
    { name: 'DigitalOcean', board: 'digitalocean', enabled: true, priority: 2 },
    { name: 'Heroku', board: 'heroku', enabled: true, priority: 2 },
    { name: 'Box', board: 'box', enabled: true, priority: 2 },
    { name: 'Eventbrite', board: 'eventbrite', enabled: true, priority: 2 },
    { name: 'Yelp', board: 'yelp', enabled: true, priority: 2 },
    { name: 'Grubhub', board: 'grubhub', enabled: true, priority: 2 },
    { name: 'DraftKings', board: 'draftkings', enabled: true, priority: 2 },
    { name: 'FanDuel', board: 'fanduel', enabled: true, priority: 2 },
    { name: 'Basecamp', board: 'basecamp', enabled: true, priority: 2 },
    { name: '37signals', board: '37signals', enabled: true, priority: 2 },
    { name: 'Adyen', board: 'adyen', enabled: true, priority: 2 },
  ],

  // Lever ATS - Official Public API
  // Only verified working boards
  lever: [
    // Priority 1 - Verified working
    { name: 'Wealthfront', board: 'wealthfront', enabled: true, priority: 1 },
    { name: 'Ro', board: 'ro', enabled: true, priority: 1 },
    { name: 'Carbon Health', board: 'carbonhealth', enabled: true, priority: 2 },
  ],

  // Workday ATS - Disabled by default (requires headless browser)
  workday: [
    { name: 'Microsoft', url: 'https://careers.microsoft.com', enabled: false, priority: 3 },
    { name: 'Amazon', url: 'https://www.amazon.jobs', enabled: false, priority: 3 },
    { name: 'Adobe', url: 'https://www.adobe.com/careers', enabled: false, priority: 3 },
    { name: 'IBM', url: 'https://www.ibm.com/careers', enabled: false, priority: 3 },
    { name: 'Oracle', url: 'https://www.oracle.com/careers', enabled: false, priority: 3 },
    { name: 'Salesforce', url: 'https://www.salesforce.com/company/careers', enabled: false, priority: 3 },
  ],

  /**
   * Get enabled companies for a specific ATS type
   */
  getEnabledCompanies(atsType) {
    const companies = this[atsType] || [];
    return companies.filter(c => c.enabled);
  },

  /**
   * Get companies by priority level
   */
  getCompaniesByPriority(atsType, maxPriority) {
    const companies = this.getEnabledCompanies(atsType);
    return companies.filter(c => c.priority <= maxPriority);
  },

  /**
   * Get all enabled companies across all ATS types
   */
  getAllEnabledCompanies() {
    const result = [];
    for (const atsType of ['greenhouse', 'lever', 'workday']) {
      const companies = this.getEnabledCompanies(atsType);
      result.push(...companies.map(c => ({ ...c, atsType })));
    }
    return result;
  },

  /**
   * Get company count by ATS type
   */
  getCompanyCounts() {
    return {
      greenhouse: this.getEnabledCompanies('greenhouse').length,
      lever: this.getEnabledCompanies('lever').length,
      workday: this.getEnabledCompanies('workday').length,
      total: this.getAllEnabledCompanies().length,
    };
  },
};
