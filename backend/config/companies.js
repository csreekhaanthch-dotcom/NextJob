/**
 * Company Configuration for Job Scraping
 * Organized by ATS (Applicant Tracking System) type
 */

module.exports = {
  // Greenhouse ATS - Official Public API (60+ companies)
  greenhouse: [
    { name: 'Stripe', board: 'stripe', enabled: true, priority: 1 },
    { name: 'Airbnb', board: 'airbnb', enabled: true, priority: 1 },
    { name: 'Uber', board: 'uber', enabled: true, priority: 1 },
    { name: 'Dropbox', board: 'dropbox', enabled: true, priority: 1 },
    { name: 'Lyft', board: 'lyft', enabled: true, priority: 1 },
    { name: 'Square', board: 'square', enabled: true, priority: 1 },
    { name: 'Twilio', board: 'twilio', enabled: true, priority: 1 },
    { name: 'Coinbase', board: 'coinbase', enabled: true, priority: 1 },
    { name: 'Robinhood', board: 'robinhood', enabled: true, priority: 1 },
    { name: 'Figma', board: 'figma', enabled: true, priority: 1 },
    { name: 'Notion', board: 'notion', enabled: true, priority: 1 },
    { name: 'Discord', board: 'discord', enabled: true, priority: 1 },
    { name: 'Reddit', board: 'reddit', enabled: true, priority: 1 },
    { name: 'Pinterest', board: 'pinterest', enabled: true, priority: 1 },
    { name: 'Snap', board: 'snap', enabled: true, priority: 1 },
    { name: 'Instacart', board: 'instacart', enabled: true, priority: 1 },
    { name: 'DoorDash', board: 'doordash', enabled: true, priority: 1 },
    { name: 'Plaid', board: 'plaid', enabled: true, priority: 1 },
    { name: 'Snowflake', board: 'snowflake', enabled: true, priority: 1 },
    { name: 'Databricks', board: 'databricks', enabled: true, priority: 1 },
    { name: 'CrowdStrike', board: 'crowdstrike', enabled: true, priority: 1 },
    { name: 'Slack', board: 'slack', enabled: true, priority: 1 },
    { name: 'Asana', board: 'asana', enabled: true, priority: 1 },
    { name: 'Trello', board: 'trello', enabled: true, priority: 1 },
    { name: 'Atlassian', board: 'atlassian', enabled: true, priority: 1 },
    { name: 'GitLab', board: 'gitlab', enabled: true, priority: 1 },
    { name: 'DigitalOcean', board: 'digitalocean', enabled: true, priority: 1 },
    { name: 'Heroku', board: 'heroku', enabled: true, priority: 1 },
    { name: 'Box', board: 'box', enabled: true, priority: 1 },
    { name: 'Yammer', board: 'yammer', enabled: true, priority: 1 },
    { name: 'Eventbrite', board: 'eventbrite', enabled: true, priority: 1 },
    { name: 'Yelp', board: 'yelp', enabled: true, priority: 1 },
    { name: 'Grubhub', board: 'grubhub', enabled: true, priority: 1 },
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

  // Lever ATS - Official Public API (10+ companies)
  lever: [
    { name: 'Netflix', board: 'netflix', enabled: true, priority: 1 },
    { name: 'Shopify', board: 'shopify', enabled: true, priority: 1 },
    { name: 'Foursquare', board: 'foursquare', enabled: true, priority: 2 },
    { name: 'Kaltura', board: 'kaltura', enabled: true, priority: 2 },
    { name: 'Udemy', board: 'udemy', enabled: true, priority: 2 },
    { name: 'Coursera', board: 'coursera', enabled: true, priority: 2 },
    { name: 'Wix', board: 'wix', enabled: true, priority: 2 },
    { name: 'WeWork', board: 'wework', enabled: true, priority: 2 },
    { name: 'Automattic', board: 'automattic', enabled: true, priority: 2 },
    { name: 'Acquia', board: 'acquia', enabled: true, priority: 2 },
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
    { name: 'Google', url: 'https://careers.google.com/jobs', enabled: true, priority: 3 },
    { name: 'Apple', url: 'https://jobs.apple.com', enabled: true, priority: 3 },
    { name: 'Meta', url: 'https://www.metacareers.com', enabled: true, priority: 3 },
    { name: 'Tesla', url: 'https://www.tesla.com/careers', enabled: true, priority: 3 },
    { name: 'NVIDIA', url: 'https://www.nvidia.com/en-us/about-nvidia/careers', enabled: true, priority: 3 },
    { name: 'Twitter', url: 'https://careers.twitter.com', enabled: false, priority: 3 },
    { name: 'Spotify', url: 'https://www.lifeatspotify.com/jobs', enabled: true, priority: 3 },
    { name: 'ByteDance', url: 'https://careers.bytedance.com', enabled: false, priority: 3 },
    { name: 'Alibaba', url: 'https://jobs.alibaba.com', enabled: false, priority: 3 },
    { name: 'Tencent', url: 'https://careers.tencent.com', enabled: false, priority: 3 },
    { name: 'Baidu', url: 'https://talent.baidu.com', enabled: false, priority: 3 },
    { name: 'Samsung', url: 'https://www.samsung.com/us/careers', enabled: false, priority: 3 },
    { name: 'LG', url: 'https://www.lg.com/global/corporate/careers', enabled: false, priority: 3 },
    { name: 'Sony', url: 'https://www.sony.com/en/SonyInfo/Careers', enabled: false, priority: 3 },
    { name: 'Nintendo', url: 'https://en.zn.nintendo.com/careers', enabled: false, priority: 3 },
    { name: 'Epic Games', url: 'https://www.epicgames.com/site/careers', enabled: false, priority: 3 },
    { name: 'Blizzard', url: 'https://careers.blizzard.com', enabled: false, priority: 3 },
    { name: 'Activision', url: 'https://activision.com/careers', enabled: false, priority: 3 },
    { name: 'Ubisoft', url: 'https://www.ubisoft.com/en-US/company/careers', enabled: false, priority: 3 },
    { name: 'Electronic Arts', url: 'https://www.ea.com/careers', enabled: false, priority: 3 },
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
