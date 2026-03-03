/**
 * Company Configuration for Job Scraping
 * Organized by ATS (Applicant Tracking System) type
 */

module.exports = {
  // Greenhouse ATS - Official Public API (80+ companies)
  greenhouse: [
    // Priority 1 - Major tech companies
    { name: 'Stripe', board: 'stripe', enabled: true, priority: 1 },
    { name: 'Airbnb', board: 'airbnb', enabled: true, priority: 1 },
    // Note: Uber uses a different board name - may need custom handling
    { name: 'Uber', board: 'uber', enabled: false, priority: 1, note: 'Board not accessible' },
    { name: 'Dropbox', board: 'dropbox', enabled: true, priority: 1 },
    { name: 'Lyft', board: 'lyft', enabled: true, priority: 1 },
    // Note: Square is now Block - board may have changed
    { name: 'Square', board: 'square', enabled: false, priority: 1, note: 'Now Block - board changed' },
    { name: 'Twilio', board: 'twilio', enabled: true, priority: 1 },
    { name: 'Coinbase', board: 'coinbase', enabled: true, priority: 1 },
    { name: 'Robinhood', board: 'robinhood', enabled: true, priority: 1 },
    { name: 'Figma', board: 'figma', enabled: true, priority: 1 },
    // Note: Notion board may have changed
    { name: 'Notion', board: 'notion', enabled: false, priority: 1, note: 'Board not accessible' },
    { name: 'Discord', board: 'discord', enabled: true, priority: 1 },
    { name: 'Reddit', board: 'reddit', enabled: true, priority: 1 },
    { name: 'Pinterest', board: 'pinterest', enabled: true, priority: 1 },
    // Note: Snap board may have changed
    { name: 'Snap', board: 'snap', enabled: false, priority: 1, note: 'Board not accessible' },
    { name: 'Instacart', board: 'instacart', enabled: true, priority: 1 },
    // Note: DoorDash board may have changed
    { name: 'DoorDash', board: 'doordash', enabled: false, priority: 1, note: 'Board not accessible' },
    // Note: Plaid board may have changed
    { name: 'Plaid', board: 'plaid', enabled: false, priority: 1, note: 'Board not accessible' },
    // Note: Snowflake board may have changed
    { name: 'Snowflake', board: 'snowflake', enabled: false, priority: 1, note: 'Board not accessible' },
    { name: 'Databricks', board: 'databricks', enabled: true, priority: 1 },
    { name: 'CrowdStrike', board: 'crowdstrike', enabled: true, priority: 1 },
    { name: 'HashiCorp', board: 'hashicorp', enabled: true, priority: 1 },
    { name: 'MongoDB', board: 'mongodb', enabled: true, priority: 1 },
    { name: 'Elastic', board: 'elastic', enabled: true, priority: 1 },
    { name: 'Datadog', board: 'datadog', enabled: true, priority: 1 },
    { name: 'Grafana Labs', board: 'grafana-labs', enabled: true, priority: 1 },
    { name: 'ClickHouse', board: 'clickhouse', enabled: true, priority: 1 },
    { name: 'Supabase', board: 'supabase', enabled: true, priority: 1 },
    { name: 'Vercel', board: 'vercel', enabled: true, priority: 1 },
    { name: 'Netlify', board: 'netlify', enabled: true, priority: 1 },
    { name: 'Cloudflare', board: 'cloudflare-workers', enabled: true, priority: 1 },
    { name: 'Fly.io', board: 'flyio', enabled: true, priority: 1 },
    { name: 'Render', board: 'render', enabled: true, priority: 1 },
    { name: 'Railway', board: 'railway', enabled: true, priority: 1 },
    { name: 'PlanetScale', board: 'planetscale', enabled: true, priority: 1 },
    { name: 'ngrok', board: 'ngrok', enabled: true, priority: 1 },
    { name: 'Postman', board: 'postman', enabled: true, priority: 1 },
    { name: 'GitLab', board: 'gitlab', enabled: true, priority: 1 },
    { name: 'Sentry', board: 'sentry', enabled: true, priority: 1 },
    { name: 'Linear', board: 'linear', enabled: true, priority: 1 },
    { name: 'Height', board: 'height', enabled: true, priority: 1 },
    { name: 'Raycast', board: 'raycast', enabled: true, priority: 1 },
    { name: 'Warp', board: 'warp', enabled: true, priority: 1 },

    // Priority 2 - Popular SaaS and tools
    { name: 'Canva', board: 'canva', enabled: true, priority: 2 },
    { name: 'Pitch', board: 'pitch', enabled: true, priority: 2 },
    { name: 'Mural', board: 'mural', enabled: true, priority: 2 },
    { name: 'Miro', board: 'miro', enabled: true, priority: 2 },
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
    { name: 'dbt Labs', board: 'dbt-labs', enabled: true, priority: 2 },
    { name: 'Fivetran', board: 'fivetran', enabled: true, priority: 2 },
    { name: 'Segment', board: 'segment', enabled: true, priority: 2 },
    { name: 'Amplitude', board: 'amplitude', enabled: true, priority: 2 },
    { name: 'Mixpanel', board: 'mixpanel', enabled: true, priority: 2 },
    { name: 'PostHog', board: 'posthog', enabled: true, priority: 2 },
    { name: 'Customer.io', board: 'customerio', enabled: true, priority: 2 },
    { name: 'Iterable', board: 'iterable', enabled: true, priority: 2 },
    { name: 'Braze', board: 'braze', enabled: true, priority: 2 },
    { name: 'Klaviyo', board: 'klaviyo', enabled: true, priority: 2 },
    { name: 'Attio', board: 'attio', enabled: true, priority: 2 },
    { name: 'Apollo', board: 'apollo', enabled: true, priority: 2 },
    { name: 'Loom', board: 'loom', enabled: true, priority: 2 },
    { name: 'Descript', board: 'descript', enabled: true, priority: 2 },
    { name: 'Riverside', board: 'riverside', enabled: true, priority: 2 },
    { name: 'Otter.ai', board: 'otter-ai', enabled: true, priority: 2 },
    { name: 'Grammarly', board: 'grammarly', enabled: true, priority: 2 },

    // Priority 2 - AI/ML companies
    { name: 'Copy.ai', board: 'copy-ai', enabled: true, priority: 2 },
    { name: 'Jasper', board: 'jasper', enabled: true, priority: 2 },
    { name: 'Anthropic', board: 'anthropic', enabled: true, priority: 2 },
    { name: 'Stability AI', board: 'stability-ai', enabled: true, priority: 2 },
    { name: 'Replicate', board: 'replicate', enabled: true, priority: 2 },
    { name: 'Hugging Face', board: 'hugging-face', enabled: true, priority: 2 },
    { name: 'Weights & Biases', board: 'weights-and-biases', enabled: true, priority: 2 },
    { name: 'ClearML', board: 'clearml', enabled: true, priority: 2 },

    // Priority 2 - Data engineering companies
    { name: 'Dagster', board: 'dagster', enabled: true, priority: 2 },
    { name: 'Prefect', board: 'prefect', enabled: true, priority: 2 },
    { name: 'Temporal', board: 'temporal', enabled: true, priority: 2 },
    { name: 'Camunda', board: 'camunda', enabled: true, priority: 2 },
    { name: 'Confluent', board: 'confluent', enabled: true, priority: 2 },
    { name: 'Apache Kafka', board: 'apache-kafka', enabled: true, priority: 2 },
    { name: 'Pulsar', board: 'pulsar', enabled: true, priority: 2 },
    { name: 'Redpanda', board: 'redpanda', enabled: true, priority: 2 },
    { name: 'Materialize', board: 'materialize', enabled: true, priority: 2 },
    { name: 'RisingWave', board: 'risingwave', enabled: true, priority: 2 },
    { name: 'Starburst', board: 'starburst', enabled: true, priority: 2 },
    { name: 'Dremio', board: 'dremio', enabled: true, priority: 2 },
    { name: 'Trino', board: 'trino-presto', enabled: true, priority: 2 },
    { name: 'Monte Carlo', board: 'monte-carlo', enabled: true, priority: 2 },
    { name: 'Bigeye', board: 'bigeye', enabled: true, priority: 2 },
    { name: 'Metadata', board: 'metadata', enabled: true, priority: 2 },
    { name: 'Select Star', board: 'select-star', enabled: true, priority: 2 },
    { name: 'Secoda', board: 'secoda', enabled: true, priority: 2 },
    { name: 'Atlan', board: 'atlan', enabled: true, priority: 2 },
    { name: 'Collibra', board: 'collibra', enabled: true, priority: 2 },
    { name: 'Alation', board: 'alation', enabled: true, priority: 2 },
    { name: 'DataHub', board: 'datahub', enabled: true, priority: 2 },
    { name: 'Great Expectations', board: 'great-expectations', enabled: true, priority: 2 },
    { name: 'Soda', board: 'soda', enabled: true, priority: 2 },

    // Additional companies from existing config
    { name: 'Trello', board: 'trello', enabled: true, priority: 2 },
    { name: 'Atlassian', board: 'atlassian', enabled: true, priority: 2 },
    { name: 'DigitalOcean', board: 'digitalocean', enabled: true, priority: 2 },
    { name: 'Heroku', board: 'heroku', enabled: true, priority: 2 },
    { name: 'Box', board: 'box', enabled: true, priority: 2 },
    { name: 'Yammer', board: 'yammer', enabled: true, priority: 2 },
    { name: 'Eventbrite', board: 'eventbrite', enabled: true, priority: 2 },
    { name: 'Yelp', board: 'yelp', enabled: true, priority: 2 },
    { name: 'Grubhub', board: 'grubhub', enabled: true, priority: 2 },
    { name: 'Postmates', board: 'postmates', enabled: true, priority: 2 },
    { name: 'Deliveroo', board: 'deliveroo', enabled: true, priority: 2 },
    { name: 'Just Eat', board: 'justeat', enabled: true, priority: 2 },
    { name: 'HelloFresh', board: 'hellofresh', enabled: true, priority: 2 },
    { name: 'Blue Apron', board: 'blueapron', enabled: true, priority: 2 },
    { name: 'DraftKings', board: 'draftkings', enabled: true, priority: 2 },
    { name: 'FanDuel', board: 'fanduel', enabled: true, priority: 2 },
    { name: 'Basecamp', board: 'basecamp', enabled: true, priority: 2 },
    { name: '37signals', board: '37signals', enabled: true, priority: 2 },
    { name: 'Adyen', board: 'adyen', enabled: true, priority: 2 },
    { name: 'Venmo', board: 'venmo', enabled: true, priority: 2 },
    { name: 'Cash App', board: 'cashapp', enabled: true, priority: 2 },
    { name: 'Braintree', board: 'braintree', enabled: true, priority: 2 },
  ],

  // Lever ATS - Official Public API (20+ companies)
  lever: [
    // Priority 1 - Major companies
    { name: 'Netflix', board: 'netflix', enabled: true, priority: 1 },
    { name: 'Shopify', board: 'shopify', enabled: true, priority: 1 },
    { name: 'Flexport', board: 'flexport', enabled: true, priority: 1 },

    // Priority 2 - Additional companies
    { name: 'Foursquare', board: 'foursquare', enabled: true, priority: 2 },
    { name: 'Kaltura', board: 'kaltura', enabled: true, priority: 2 },
    { name: 'Udemy', board: 'udemy', enabled: true, priority: 2 },
    { name: 'Coursera', board: 'coursera', enabled: true, priority: 2 },
    { name: 'Wix', board: 'wix', enabled: true, priority: 2 },
    { name: 'WeWork', board: 'wework', enabled: true, priority: 2 },
    { name: 'Automattic', board: 'automattic', enabled: true, priority: 2 },
    { name: 'Acquia', board: 'acquia', enabled: true, priority: 2 },
    { name: 'Digit', board: 'digit', enabled: true, priority: 2 },
    { name: 'Gusto', board: 'gusto', enabled: true, priority: 2 },
    { name: 'Looker', board: 'looker', enabled: true, priority: 2 },
    { name: 'Betterment', board: 'betterment', enabled: true, priority: 2 },
    { name: 'Wealthfront', board: 'wealthfront', enabled: true, priority: 2 },
    { name: 'SoFi', board: 'sofi', enabled: true, priority: 2 },
    { name: 'Chime', board: 'chime', enabled: true, priority: 2 },
    { name: 'Hims & Hers', board: 'hims', enabled: true, priority: 2 },
    { name: 'Ro', board: 'ro', enabled: true, priority: 2 },
    { name: 'Forward', board: 'forward', enabled: true, priority: 2 },
    { name: 'Carbon Health', board: 'carbonhealth', enabled: true, priority: 2 },
    { name: 'HubSpot', board: 'hubspot', enabled: true, priority: 2 },
  ],

  // Workday ATS - Requires Headless Browser (15+ companies)
  // CAUTION: Difficult to scrape, strong anti-bot measures
  workday: [
    { name: 'Microsoft', url: 'https://careers.microsoft.com', enabled: false, priority: 3 },
    { name: 'Amazon', url: 'https://www.amazon.jobs', enabled: false, priority: 3 },
    { name: 'Adobe', url: 'https://www.adobe.com/careers', enabled: false, priority: 3 },
    { name: 'IBM', url: 'https://www.ibm.com/careers', enabled: false, priority: 3 },
    { name: 'Oracle', url: 'https://www.oracle.com/careers', enabled: false, priority: 3 },
    { name: 'Salesforce', url: 'https://www.salesforce.com/company/careers', enabled: false, priority: 3 },
    { name: 'VMware', url: 'https://careers.vmware.com', enabled: false, priority: 3 },
    { name: 'Zoom', url: 'https://careers.zoom.us', enabled: false, priority: 3 },
    { name: 'PayPal', url: 'https://www.paypal.com/us/webapps/mpp/jobs', enabled: false, priority: 3 },
    { name: 'HPE', url: 'https://careers.hpe.com', enabled: false, priority: 3 },
    { name: 'Dell', url: 'https://jobs.dell.com', enabled: false, priority: 3 },
    { name: 'Cisco', url: 'https://jobs.cisco.com', enabled: false, priority: 3 },
    { name: 'SAP', url: 'https://www.sap.com/about/careers.html', enabled: false, priority: 3 },
    { name: 'Intel', url: 'https://jobs.intel.com', enabled: false, priority: 3 },
    { name: 'AMD', url: 'https://jobs.amd.com', enabled: false, priority: 3 },
  ],

  // Custom Career Pages (20+ companies)
  // Varies by company - check robots.txt and ToS
  custom: [
    // Priority 3 - Major tech companies with custom career pages
    { name: 'Google', url: 'https://careers.google.com/jobs', enabled: true, priority: 3 },
    { name: 'Apple', url: 'https://jobs.apple.com', enabled: true, priority: 3 },
    { name: 'Meta', url: 'https://www.metacareers.com', enabled: true, priority: 3 },
    { name: 'Tesla', url: 'https://www.tesla.com/careers', enabled: true, priority: 3 },
    { name: 'NVIDIA', url: 'https://www.nvidia.com/en-us/about-nvidia/careers', enabled: true, priority: 3 },
    { name: 'Spotify', url: 'https://www.lifeatspotify.com/jobs', enabled: true, priority: 3 },
    { name: 'Microsoft', url: 'https://careers.microsoft.com', enabled: false, priority: 3, note: 'Workday ATS - disabled' },
    { name: 'Amazon', url: 'https://www.amazon.jobs', enabled: false, priority: 3, note: 'Workday ATS - disabled' },
    { name: 'Twitter/X', url: 'https://careers.twitter.com', enabled: false, priority: 3, note: 'Currently not hiring' },

    // Gaming companies
    { name: 'Epic Games', url: 'https://www.epicgames.com/site/careers', enabled: false, priority: 3 },
    { name: 'Blizzard', url: 'https://careers.blizzard.com', enabled: false, priority: 3 },
    { name: 'Activision', url: 'https://activision.com/careers', enabled: false, priority: 3 },
    { name: 'Ubisoft', url: 'https://www.ubisoft.com/en-US/company/careers', enabled: false, priority: 3 },
    { name: 'Electronic Arts', url: 'https://www.ea.com/careers', enabled: false, priority: 3 },
    { name: 'Nintendo', url: 'https://en.zn.nintendo.com/careers', enabled: false, priority: 3 },
    { name: 'Sony', url: 'https://www.sony.com/en/SonyInfo/Careers', enabled: false, priority: 3 },

    // Asian tech companies
    { name: 'ByteDance', url: 'https://careers.bytedance.com', enabled: false, priority: 3 },
    { name: 'Alibaba', url: 'https://jobs.alibaba.com', enabled: false, priority: 3 },
    { name: 'Tencent', url: 'https://careers.tencent.com', enabled: false, priority: 3 },
    { name: 'Baidu', url: 'https://talent.baidu.com', enabled: false, priority: 3 },
    { name: 'Samsung', url: 'https://www.samsung.com/us/careers', enabled: false, priority: 3 },
    { name: 'LG', url: 'https://www.lg.com/global/corporate/careers', enabled: false, priority: 3 },

    // Other major companies
    { name: 'Adobe', url: 'https://www.adobe.com/careers', enabled: false, priority: 3, note: 'Workday ATS - disabled' },
    { name: 'Salesforce', url: 'https://www.salesforce.com/company/careers', enabled: false, priority: 3, note: 'Workday ATS - disabled' },
  ],

  // Official API Required (Do NOT scrape)
  apiRequired: [
    { name: 'LinkedIn', api: 'https://api.linkedin.com/v2', enabled: false, note: 'Requires API partnership' },
    { name: 'Indeed', api: 'https://api.indeed.com/v3', enabled: false, note: 'Requires API partnership' },
    { name: 'Glassdoor', api: 'https://api.glassdoor.com/api', enabled: false, note: 'Requires API partnership' },
  ],

  // Additional companies by industry
  // Fintech
  fintech: [
    { name: 'Chime', board: 'chime', enabled: true, priority: 2 },
    { name: 'Betterment', board: 'betterment', enabled: true, priority: 2 },
    { name: 'Wealthfront', board: 'wealthfront', enabled: true, priority: 2 },
    { name: 'SoFi', board: 'sofi', enabled: true, priority: 2 },
    { name: 'Block', board: 'block', enabled: true, priority: 2 },
  ],

  // Healthcare Tech
  healthtech: [
    { name: 'Ro', board: 'ro', enabled: true, priority: 2 },
    { name: 'Hims & Hers', board: 'hims', enabled: true, priority: 2 },
    { name: 'Forward', board: 'forward', enabled: true, priority: 2 },
    { name: 'Carbon Health', board: 'carbonhealth', enabled: true, priority: 2 },
  ],

  // E-commerce
  ecommerce: [
    { name: 'Shopify', board: 'shopify', enabled: true, priority: 1 },
    { name: 'WooCommerce', board: 'woocommerce', enabled: true, priority: 2 },
    { name: 'BigCommerce', board: 'bigcommerce', enabled: true, priority: 2 },
    { name: 'Magento', board: 'magento', enabled: true, priority: 2 },
  ],

  // SaaS
  saas: [
    { name: 'Salesforce', url: 'https://www.salesforce.com/company/careers', enabled: false, priority: 3 },
    { name: 'HubSpot', board: 'hubspot', enabled: true, priority: 1 },
    { name: 'Zendesk', board: 'zendesk', enabled: true, priority: 1 },
    { name: 'Intercom', board: 'intercom', enabled: true, priority: 1 },
    { name: 'Mailchimp', board: 'mailchimp', enabled: true, priority: 1 },
  ],
};

// Helper functions
module.exports.getEnabledCompanies = function(type) {
  return this[type].filter(c => c.enabled);
};

module.exports.getCompaniesByPriority = function(type, maxPriority) {
  return this[type]
    .filter(c => c.enabled && c.priority <= maxPriority)
    .sort((a, b) => a.priority - b.priority);
};

module.exports.getAllEnabled = function() {
  const all = [];
  Object.keys(this).forEach(type => {
    if (typeof this[type] === 'object' && Array.isArray(this[type])) {
      all.push(...this.getEnabledCompanies(type));
    }
  });
  return all;
};
