import { JobSiteConfig } from './types';

export const jobSites: JobSiteConfig[] = [
  {
    name: 'xAI',
    url: 'https://job-boards.greenhouse.io/xai',
    selectors: {
      jobList: 'table tr',
      jobTitle: 'a',
      jobUrl: 'a',
      location: '.location, [data-qa="job-location"]',
      department: '.department, [data-qa="job-department"]'
    },
    categoryKeywords: {
      'AI & Research': ['ai engineer', 'researcher', 'machine learning', 'ml engineer', 'cuda', 'gpu', 'neural', 'deep learning'],
      'Infrastructure': ['datacenter', 'data center', 'network', 'operations', 'infrastructure', 'facilities', 'fiber', 'devops', 'sre'],
      'Software Engineering': ['software engineer', 'frontend', 'backend', 'full stack', 'fullstack', 'web developer', 'mobile developer'],
      'Management': ['manager', 'supervisor', 'lead', 'director', 'head of', 'vp', 'vice president'],
      'Security': ['security', 'cybersecurity', 'infosec', 'penetration', 'vulnerability'],
      'Data': ['data scientist', 'data engineer', 'analytics', 'business intelligence', 'data analyst'],
      'Product': ['product manager', 'product owner', 'product designer', 'ux', 'ui'],
      'Sales & Marketing': ['sales', 'marketing', 'business development', 'account manager', 'customer success']
    },
    urlPrefix: 'https://job-boards.greenhouse.io'
  },
  {
    name: 'OpenAI',
    url: 'https://openai.com/careers',
    selectors: {
      jobList: '[data-testid="job-posting"]',
      jobTitle: 'h3, .job-title',
      jobUrl: 'a',
      location: '.location',
      department: '.department'
    },
    categoryKeywords: {
      'AI & Research': ['research', 'scientist', 'ml', 'machine learning', 'ai', 'artificial intelligence', 'nlp', 'computer vision'],
      'Infrastructure': ['infrastructure', 'platform', 'devops', 'site reliability', 'cloud', 'kubernetes'],
      'Software Engineering': ['software', 'engineer', 'developer', 'frontend', 'backend', 'full stack'],
      'Management': ['manager', 'lead', 'director', 'head'],
      'Product': ['product', 'design', 'ux', 'ui'],
      'Operations': ['operations', 'program manager', 'project manager']
    }
  },
  {
    name: 'Anthropic',
    url: 'https://www.anthropic.com/careers',
    selectors: {
      jobList: '.job-listing, [data-job]',
      jobTitle: '.job-title, h3',
      jobUrl: 'a',
      location: '.location',
      department: '.team, .department'
    },
    categoryKeywords: {
      'AI & Research': ['research', 'scientist', 'ml', 'machine learning', 'ai safety', 'alignment', 'interpretability'],
      'Infrastructure': ['infrastructure', 'platform', 'systems', 'cloud'],
      'Software Engineering': ['software', 'engineer', 'developer', 'frontend', 'backend'],
      'Management': ['manager', 'lead', 'director'],
      'Operations': ['operations', 'people', 'finance', 'legal']
    }
  },
  {
    name: 'Meta AI',
    url: 'https://www.metacareers.com/jobs',
    selectors: {
      jobList: '[data-testid="job-posting"]',
      jobTitle: 'a[data-testid="job-title"]',
      jobUrl: 'a[data-testid="job-title"]',
      location: '[data-testid="job-location"]',
      department: '[data-testid="job-team"]'
    },
    categoryKeywords: {
      'AI & Research': ['ai', 'machine learning', 'research scientist', 'computer vision', 'nlp', 'robotics'],
      'Infrastructure': ['infrastructure', 'production engineering', 'network', 'data center'],
      'Software Engineering': ['software engineer', 'frontend', 'backend', 'mobile', 'ios', 'android'],
      'Management': ['engineering manager', 'technical lead', 'director'],
      'Product': ['product manager', 'product designer', 'ux researcher'],
      'Data': ['data scientist', 'data engineer', 'analytics']
    },
    urlPrefix: 'https://www.metacareers.com'
  }
];

export const defaultCategoryKeywords = {
  'AI & Research': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural', 'research', 'scientist', 'nlp', 'computer vision', 'robotics'],
  'Infrastructure': ['infrastructure', 'devops', 'sre', 'site reliability', 'platform', 'cloud', 'kubernetes', 'docker', 'aws', 'gcp', 'azure', 'network', 'datacenter'],
  'Software Engineering': ['software engineer', 'developer', 'programmer', 'frontend', 'backend', 'full stack', 'fullstack', 'web developer', 'mobile developer', 'ios', 'android'],
  'Management': ['manager', 'lead', 'director', 'head of', 'vp', 'vice president', 'supervisor', 'chief'],
  'Security': ['security', 'cybersecurity', 'infosec', 'penetration testing', 'vulnerability', 'compliance'],
  'Data': ['data scientist', 'data engineer', 'analytics', 'business intelligence', 'data analyst', 'statistician'],
  'Product': ['product manager', 'product owner', 'product designer', 'ux', 'ui', 'user experience', 'user interface'],
  'Sales & Marketing': ['sales', 'marketing', 'business development', 'account manager', 'customer success', 'growth'],
  'Operations': ['operations', 'program manager', 'project manager', 'coordinator', 'administrative']
};
