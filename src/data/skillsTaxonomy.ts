export interface SkillCategory {
  name: string;
  icon: string;
  skills: string[];
}

export const skillsTaxonomy: SkillCategory[] = [
  { name: 'Programming Languages', icon: 'code', skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'] },
  { name: 'Frontend Development', icon: 'layout', skills: ['React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Redux', 'Webpack', 'Vite', 'Jest', 'Cypress'] },
  { name: 'Backend Development', icon: 'server', skills: ['Node.js', 'Express.js', 'NestJS', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Ruby on Rails', 'ASP.NET', 'GraphQL', 'REST API', 'Microservices'] },
  { name: 'Databases', icon: 'database', skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'DynamoDB', 'Elasticsearch', 'Firebase', 'Supabase'] },
  { name: 'Cloud Platforms', icon: 'cloud', skills: ['AWS', 'Azure', 'Google Cloud', 'GCP', 'AWS Lambda', 'EC2', 'S3', 'Terraform', 'Serverless'] },
  { name: 'DevOps & Infrastructure', icon: 'git-branch', skills: ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'CI/CD', 'Ansible', 'Terraform', 'Prometheus', 'Grafana', 'Linux', 'Nginx'] },
  { name: 'Data Science & ML', icon: 'brain', skills: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'NLP', 'Computer Vision', 'LLM'] },
  { name: 'Mobile Development', icon: 'smartphone', skills: ['React Native', 'Flutter', 'iOS Development', 'Android Development', 'Swift UI', 'Jetpack Compose', 'PWA'] },
  { name: 'Security', icon: 'shield', skills: ['Cybersecurity', 'Penetration Testing', 'OWASP', 'OAuth', 'JWT', 'SSL/TLS', 'Zero Trust', 'CISSP'] },
  { name: 'Testing & QA', icon: 'check-circle', skills: ['Test Automation', 'Selenium', 'Cypress', 'Playwright', 'Jest', 'TDD', 'BDD', 'API Testing', 'Postman'] }
];

export const allSkills = skillsTaxonomy.flatMap(c => c.skills.map(s => ({ skill: s, category: c.name })));

export function searchSkills(query: string, limit = 10) {
  if (!query.trim()) return [];
  return allSkills.filter(i => i.skill.toLowerCase().includes(query.toLowerCase())).slice(0, limit);
}

export const popularSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'Git', 'Machine Learning', 'Java', 'Go', 'PostgreSQL', 'MongoDB'];

export const JOB_TYPES = [{ value: 'full-time', label: 'Full-time' }, { value: 'part-time', label: 'Part-time' }, { value: 'contract', label: 'Contract' }, { value: 'freelance', label: 'Freelance' }, { value: 'internship', label: 'Internship' }] as const;

export const EXPERIENCE_LEVELS = [{ value: 'entry', label: 'Entry Level (0-2 years)' }, { value: 'mid', label: 'Mid Level (2-5 years)' }, { value: 'senior', label: 'Senior Level (5-8 years)' }, { value: 'lead', label: 'Lead/Principal (8+ years)' }, { value: 'executive', label: 'Executive (10+ years)' }] as const;

export const DATE_POSTED_OPTIONS = [{ value: '24h', label: 'Last 24 hours' }, { value: '3d', label: 'Last 3 days' }, { value: '7d', label: 'Last 7 days' }, { value: '14d', label: 'Last 14 days' }, { value: '30d', label: 'Last 30 days' }, { value: 'all', label: 'Any time' }] as const;

export const SALARY_RANGES = [{ value: '0-50', label: 'Under $50K' }, { value: '50-75', label: '$50K - $75K' }, { value: '75-100', label: '$75K - $100K' }, { value: '100-125', label: '$100K - $125K' }, { value: '125-150', label: '$125K - $150K' }, { value: '150-200', label: '$150K - $200K' }, { value: '200+', label: '$200K+' }] as const;

export const WORK_SETTINGS = [{ value: 'remote', label: 'Fully Remote' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'on-site', label: 'On-site' }] as const;

export const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Education', 'Manufacturing', 'Retail', 'Consulting', 'Government', 'Non-profit'] as const;
