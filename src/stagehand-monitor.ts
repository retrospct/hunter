import { Stagehand } from "@browserbasehq/stagehand";
import * as fs from 'fs/promises';
import * as nodemailer from 'nodemailer';
import { defaultCategoryKeywords, jobSites } from './job-sites.config';
import { JobPosting, JobSiteConfig } from './types';

class MultiSiteJobMonitorStagehand {
  private stagehand: Stagehand;
  private previousJobs: Map<string, Set<string>> = new Map();
  private jobsDirectory = './jobs-data';
  private enabledSites: string[];

  constructor(enabledSites?: string[]) {
    this.validateEnvironment();
    this.enabledSites = enabledSites || jobSites.map(site => site.name);
    this.stagehand = new Stagehand({
      apiKey: process.env.BROWSERBASE_API_KEY!,
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      env: "BROWSERBASE", // Use Browserbase cloud browsers
    });
  }

  private validateEnvironment(): void {
    const required = [
      'BROWSERBASE_API_KEY',
      'BROWSERBASE_PROJECT_ID',
      'EMAIL_USER',
      'EMAIL_PASS',
      'NOTIFICATION_EMAIL'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  async init(): Promise<void> {
    await this.stagehand.init();
    
    // Create jobs directory if it doesn't exist
    try {
      await fs.mkdir(this.jobsDirectory, { recursive: true });
    } catch {
      // Directory already exists
    }
    
    // Load previous jobs for each enabled site
    for (const siteName of this.enabledSites) {
      try {
        const filePath = `${this.jobsDirectory}/${siteName.toLowerCase()}-jobs-stagehand.json`;
        const data = await fs.readFile(filePath, 'utf-8');
        const jobs = JSON.parse(data) as string[];
        this.previousJobs.set(siteName, new Set(jobs));
      } catch {
        console.log(`Starting fresh job monitoring for ${siteName}...`);
        this.previousJobs.set(siteName, new Set());
      }
    }
  }

  async scrapeJobsForSite(siteConfig: JobSiteConfig): Promise<JobPosting[]> {
    const page = this.stagehand.page;
    
    console.log(`🔍 Scraping jobs from ${siteConfig.name}...`);
    
    try {
      await page.goto(siteConfig.url, {
        waitUntil: 'networkidle'
      });

      // Use Stagehand's AI-powered extraction with Zod schema
      const z = require('zod').z;
      
      const jobsSchema = z.object({
        jobs: z.array(
          z.object({
            title: z.string().describe("the job title"),
            url: z.string().describe("the URL link to the job posting"),
            location: z.string().optional().describe("the job location if visible"),
            department: z.string().optional().describe("the department or team if visible")
          })
        )
      });

      const jobs = await this.stagehand.page.extract({
        instruction: `Extract ALL job postings from this ${siteConfig.name} careers page. For each job, get the title, the link URL, and any visible location or department information.`,
        schema: jobsSchema
      });

      const previousJobsSet = this.previousJobs.get(siteConfig.name) || new Set();

      // Process and categorize the extracted jobs
      const processedJobs: JobPosting[] = jobs.jobs.map((job: any) => {
        let jobUrl = job.url;
        
        // Handle relative URLs
        if (!jobUrl.startsWith('http')) {
          if (siteConfig.urlPrefix) {
            jobUrl = `${siteConfig.urlPrefix}${jobUrl.startsWith('/') ? '' : '/'}${jobUrl}`;
          } else {
            const baseUrl = new URL(siteConfig.url);
            jobUrl = `${baseUrl.origin}${jobUrl.startsWith('/') ? '' : '/'}${jobUrl}`;
          }
        }

        return {
          title: job.title,
          url: jobUrl,
          category: this.categorizeJob(job.title, siteConfig.categoryKeywords),
          company: siteConfig.name,
          location: job.location,
          department: job.department,
          isNew: !previousJobsSet.has(job.title)
        };
      });

      console.log(`✅ Found ${processedJobs.length} jobs at ${siteConfig.name} (${processedJobs.filter(j => j.isNew).length} new)`);
      return processedJobs;

    } catch (error) {
      console.error(`❌ Error scraping ${siteConfig.name}:`, error);
      return [];
    }
  }

  async scrapeAllJobs(): Promise<JobPosting[]> {
    const allJobs: JobPosting[] = [];
    
    for (const siteName of this.enabledSites) {
      const siteConfig = jobSites.find(site => site.name === siteName);
      if (!siteConfig) {
        console.warn(`⚠️ No configuration found for site: ${siteName}`);
        continue;
      }
      
      const siteJobs = await this.scrapeJobsForSite(siteConfig);
      allJobs.push(...siteJobs);
      
      // Small delay between sites to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return allJobs;
  }

  private categorizeJob(title: string, siteKeywords?: Record<string, string[]>): string {
    const lowerTitle = title.toLowerCase();
    const keywords = siteKeywords || defaultCategoryKeywords;
    
    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      if (categoryKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    
    return 'Other';
  }

  async checkForNewJobs(): Promise<JobPosting[]> {
    const currentJobs = await this.scrapeAllJobs();
    const newJobs = currentJobs.filter(job => job.isNew);
    
    if (newJobs.length > 0) {
      // Update stored jobs for each site
      const jobsBySite = new Map<string, string[]>();
      
      for (const job of currentJobs) {
        if (!jobsBySite.has(job.company)) {
          jobsBySite.set(job.company, []);
        }
        jobsBySite.get(job.company)!.push(job.title);
      }
      
      for (const [siteName, jobTitles] of jobsBySite) {
        const filePath = `${this.jobsDirectory}/${siteName.toLowerCase()}-jobs-stagehand.json`;
        await fs.writeFile(filePath, JSON.stringify(jobTitles, null, 2));
        this.previousJobs.set(siteName, new Set(jobTitles));
      }
    }
    
    return newJobs;
  }

  async getJobDetails(jobUrl: string): Promise<string> {
    try {
      await this.stagehand.page.goto(jobUrl, { waitUntil: 'networkidle' });
      
      const z = require('zod').z;
      
      const jobDetailsSchema = z.object({
        description: z.string().describe("the job description and main content"),
        requirements: z.string().describe("the job requirements and qualifications"),
        location: z.string().describe("the job location"),
        department: z.string().optional().describe("the department or team"),
        salary: z.string().optional().describe("salary information if available")
      });

      const details = await this.stagehand.page.extract({
        instruction: "Extract the job description, requirements, location, and any other relevant details from this job posting page.",
        schema: jobDetailsSchema
      });

      return `Location: ${details.location}\n\nDescription:\n${details.description}\n\nRequirements:\n${details.requirements}`;
    } catch (error) {
      console.warn(`Could not extract details from ${jobUrl}:`, error);
      return "Details could not be extracted";
    }
  }

  async sendDetailedNotification(newJobs: JobPosting[]): Promise<void> {
    if (newJobs.length === 0) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Group jobs by company and then by category
    const jobsByCompany = newJobs.reduce((acc, job) => {
      if (!acc[job.company]) acc[job.company] = {};
      if (!acc[job.company][job.category]) acc[job.company][job.category] = [];
      acc[job.company][job.category].push(job);
      return acc;
    }, {} as Record<string, Record<string, JobPosting[]>>);

    let emailBody = `🚀 Found ${newJobs.length} new job posting(s) across ${Object.keys(jobsByCompany).length} companies:\n\n`;
    
    for (const [company, categorizedJobs] of Object.entries(jobsByCompany)) {
      const companyJobCount = Object.values(categorizedJobs).flat().length;
      emailBody += `🏢 ${company} (${companyJobCount} new jobs):\n`;
      
      for (const [category, jobs] of Object.entries(categorizedJobs)) {
        emailBody += `\n  📁 ${category}:\n`;
        for (const job of jobs) {
          emailBody += `    • ${job.title}\n`;
          if (job.location) emailBody += `      📍 ${job.location}\n`;
          if (job.department) emailBody += `      🏷️ ${job.department}\n`;
          emailBody += `      🔗 ${job.url}\n`;
          
          // Optionally get detailed job info (slower but more informative)
          if (process.env.FETCH_JOB_DETAILS === 'true') {
            try {
              const details = await this.getJobDetails(job.url);
              emailBody += `      📝 ${details.substring(0, 200)}...\n`;
            } catch (error) {
              console.log(`Could not fetch details for ${job.title}`);
            }
          }
          emailBody += '\n';
        }
      }
      emailBody += '\n';
    }

    const companies = Object.keys(jobsByCompany).join(', ');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `🚀 ${newJobs.length} New Job Posting(s) at ${companies} - ${new Date().toLocaleDateString()}`,
      text: emailBody
    });

    console.log(`✅ Sent notification for ${newJobs.length} new jobs across ${Object.keys(jobsByCompany).length} companies`);
  }

  async run(): Promise<void> {
    try {
      await this.init();
      console.log(`🚀 Monitoring ${this.enabledSites.length} job sites: ${this.enabledSites.join(', ')}`);
      
      const newJobs = await this.checkForNewJobs();
      
      if (newJobs.length > 0) {
        console.log(`🎯 Found ${newJobs.length} new job(s):`);
        newJobs.forEach(job => console.log(`  - ${job.company}: ${job.title} (${job.category})`));
        await this.sendDetailedNotification(newJobs);
      } else {
        console.log('✨ No new jobs found across all monitored sites');
      }
    } finally {
      await this.stagehand.close();
    }
  }
}

// Usage
async function main() {
  // Monitor all sites by default, or specify specific sites
  const enabledSites = process.env.ENABLED_SITES?.split(',') || undefined;
  const monitor = new MultiSiteJobMonitorStagehand(enabledSites);
  await monitor.run();
}

// Example usage for specific sites
async function monitorSpecificSites() {
  const monitor = new MultiSiteJobMonitorStagehand(['xAI', 'OpenAI', 'Anthropic']);
  await monitor.run();
}

if (require.main === module) {
  main().catch(console.error);
}

export { monitorSpecificSites, MultiSiteJobMonitorStagehand };
