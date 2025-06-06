export interface JobPosting {
  title: string;
  url: string;
  category: string;
  company: string;
  location?: string;
  department?: string;
  isNew?: boolean;
}

export interface JobDetails {
  description: string;
  requirements: string[];
  location: string;
  department: string;
  salary?: string;
  remote?: boolean;
}

export interface JobSiteConfig {
  name: string;
  url: string;
  selectors: {
    jobList: string;
    jobTitle: string;
    jobUrl: string;
    location?: string;
    department?: string;
  };
  categoryKeywords: Record<string, string[]>;
  urlPrefix?: string;
}

export interface MonitorConfig {
  preferredMethod: 'stagehand' | 'playwright' | 'manual';
  retries: number;
  fallbackEnabled: boolean;
  jobSites: JobSiteConfig[];
  emailConfig: {
    service: string;
    user: string;
    pass: string;
    recipient: string;
  };
}

export type CategoryType = 'AI & Research' | 'Infrastructure' | 'Software Engineering' | 'Management' | 'Other';
