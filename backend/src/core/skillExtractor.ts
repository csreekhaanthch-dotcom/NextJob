class SkillExtractor {
  // Curated list of technical skills
  private technicalSkills: Set<string> = new Set([
    // Programming Languages
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'sass', 'less',
    
    // Frameworks & Libraries
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
    'ruby on rails', 'next.js', 'nuxt.js', 'gatsby', 'jquery', 'bootstrap', 'tailwind',
    'vue.js', 'angularjs', 'svelte', 'ember.js',
    
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'firebase', 'sqlite',
    'oracle', 'mssql', 'cassandra', 'dynamodb', 'neo4j', 'couchdb', 'amazon redshift',
    
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
    'git', 'github', 'gitlab', 'bitbucket', 'ci/cd', 'nginx', 'apache', 'heroku',
    'digitalocean', 'cloudflare', 'jenkins', 'circleci', 'travis ci',
    
    // Data Science & ML
    'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'matplotlib',
    'seaborn', 'tableau', 'power bi', 'spark', 'hadoop', 'airflow', 'databricks',
    'jupyter', 'r studio', 'sas', 'spss',
    
    // Mobile Development
    'react native', 'flutter', 'swiftui', 'android', 'ios', 'xamarin', 'ionic',
    'cordova', 'phonegap', 'native android', 'native ios',
    
    // Testing
    'jest', 'mocha', 'chai', 'cypress', 'selenium', 'junit', 'pytest', 'karma',
    'jasmine', 'enzyme', 'puppeteer', 'playwright',
    
    // Other Technical Skills
    'graphql', 'rest', 'api', 'microservices', 'serverless', 'websocket', 'webassembly',
    'blockchain', 'cryptocurrency', 'ai', 'machine learning', 'deep learning', 'nlp',
    'computer vision', 'cybersecurity', 'penetration testing', 'encryption',
    'agile', 'scrum', 'kanban', 'waterfall', 'jira', 'confluence', 'trello'
  ]);

  // Soft skills
  private softSkills: Set<string> = new Set([
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
    'creativity', 'adaptability', 'time management', 'project management', 'negotiation',
    'conflict resolution', 'emotional intelligence', 'decision making', 'analytical skills',
    'interpersonal skills', 'customer service', 'sales', 'marketing', 'strategic planning',
    'collaboration', 'mentorship', 'coaching', 'public speaking', 'presentation',
    'research', 'documentation', 'training', 'facilitation'
  ]);

  /**
   * Extract skills from text
   */
  extractSkills(text: string): { technical: string[], soft: string[] } {
    const normalizedText = text.toLowerCase();
    const technical: string[] = [];
    const soft: string[] = [];

    // Extract technical skills
    for (const skill of this.technicalSkills) {
      if (normalizedText.includes(skill)) {
        technical.push(skill);
      }
    }

    // Extract soft skills
    for (const skill of this.softSkills) {
      if (normalizedText.includes(skill)) {
        soft.push(skill);
      }
    }

    return { technical, soft };
  }

  /**
   * Get all skills as a single array
   */
  getAllSkills(): string[] {
    return [...this.technicalSkills, ...this.softSkills];
  }
}

export const skillExtractor = new SkillExtractor();