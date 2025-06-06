import * as fs from 'fs/promises';
import * as nodemailer from 'nodemailer';
import { Browser, Page } from 'playwright-core';
import { defaultCategoryKeywords, jobSites } from './job-sites.config';
import { JobDetails, JobPosting, JobSiteConfig, MonitorConfig } from './types';

export class GenericJobMonitor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private previousJobs: Map<string, Set<string>> = new Map();
  private jobsFilePath = './jobs-data.json';
  private config: MonitorConfig;

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      preferredMethod: 'playwright',
      retries: 3,
      fallbackEnabled: true,
      jobSites: jobSites,
      emailConfig: {
        service: 'gmail',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        recipient: process.env.NOTIFICATION_EMAIL || ''
      },
      ...config
    };
  }

  private validateEnvironment(): void {
    const required = [
      'EMAIL_USER',
      'EMAIL_PASS',
      'NOTIFICATION_EMAIL'
    ];

    // Add Browserbase requirements if using cloud monitors
    if (this.config.preferredMethod === 'playwright' || this.config.preferredMethod === 'stagehand') {
      required.push('BROWSERBASE_API_KEY', 'BROWSERBASE_PROJECT_ID');
    }

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  async init(): Promise<void> {
    this.validateEnvironment();
    
    if (this.config.preferredMethod === 'manual') {
      // Use local Playwright
      const { chromium } = require('playwright-core');
      this.browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } else {
      // Use Browserbase SDK
      const browserbase = new (require('@browserbasehq/sdk').Browserbase)({
        apiKey: process.env.BROWSERBASE_API_KEY!,
        projectId: process.env.BROWSERBASE_PROJECT_ID!
      });
      
      const session = await browserbase.createSession();
      const { chromium } = require('playwright-core');
      this.browser = await chromium.connectOverCDP(session.connectUrl);
    }
    
    const context = await this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    this.page = await context.newPage();
    
    // Load previous jobs
    try {
      const data = await fs.readFile(this.jobsFilePath, 'utf-8');
      const jobsData = JSON.parse(data) as Record<string, string[]>;
      this.previousJobs = new Map(
        Object.entries(jobsData).map(([company, jobs]) => [company, new Set(jobs)])
      );
    } catch {
      console.log('Starting fresh job monitoring...');
    }
  }

  private categorizeJob(title: string, company: string): string {
    const lowerTitle = title.toLowerCase();
    
    // Use company-specific keywords if available, otherwise use defaults
    const siteConfig = this.config.jobSites.find(site => site.name === company);
    const keywords = siteConfig?.categoryKeywords || defaultCategoryKeywords;

    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      if (categoryKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    
    return 'Other';
  }

  private async scrapeJobSite(siteConfig: JobSiteConfig): Promise<JobPosting[]> {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`🔍 Scraping ${siteConfig.name}...`);
    
    try {
      await this.page.goto(siteConfig.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for job listings to load
      await this.page.waitForSelector(siteConfig.selectors.jobList, { timeout: 15000 });

      const jobs = await this.page.evaluate((config) => {
        const jobElements = Array.from(document.querySelectorAll(config.selectors.jobList));
        return jobElements
          .map(element => {
            const titleElement = element.querySelector(config.selectors.jobTitle);
            const urlElement = element.querySelector(config.selectors.jobUrl);
            
            if (!titleElement || !urlElement) return null;
            
            const title = titleElement.textContent?.trim();
            const href = urlElement.getAttribute('href');
            
            if (!title || !href || title === 'Job') return null; // Skip header rows
            
            // Get location and department if available
            const locationElement = config.selectors.location ? 
              element.querySelector(config.selectors.location) : null;
            const departmentElement = config.selectors.department ? 
              element.querySelector(config.selectors.department) : null;
            
            return {
              title: title,
              rawUrl: href,
              location: locationElement?.textContent?.trim() || '',
              department: departmentElement?.textContent?.trim() || ''
            };
          })
          .filter(job => job !== null);
      }, siteConfig);

      // Process URLs and categorize jobs
      const previousCompanyJobs = this.previousJobs.get(siteConfig.name) || new Set();
      
      return jobs.map(job => ({
        title: job.title,
        url: job.rawUrl.startsWith('http') ? job.rawUrl : 
             `${siteConfig.urlPrefix || new URL(siteConfig.url).origin}${job.rawUrl}`,
        category: this.categorizeJob(job.title, siteConfig.name),
        company: siteConfig.name,
        location: job.location,
        department: job.department,
        isNew: !previousCompanyJobs.has(job.title)
      }));

    } catch (error) {
      console.error(`❌ Error scraping ${siteConfig.name}:`, error);
      return [];
    }
  }

  async scrapeAllSites(): Promise<JobPosting[]> {
    const allJobs: JobPosting[] = [];
    
    for (const siteConfig of this.config.jobSites) {
      try {
        const siteJobs = await this.scrapeJobSite(siteConfig);
        allJobs.push(...siteJobs);
        
        // Small delay between sites to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to scrape ${siteConfig.name}:`, error);
      }
    }
    
    return allJobs;
  }

  async checkForNewJobs(): Promise<JobPosting[]> {
    const currentJobs = await this.scrapeAllSites();
    const newJobs = currentJobs.filter(job => job.isNew);
    
    if (newJobs.length > 0) {
      // Update stored jobs by company
      const jobsByCompany: Record<string, string[]> = {};
      
      currentJobs.forEach(job => {
        if (!jobsByCompany[job.company]) {
          jobsByCompany[job.company] = [];
        }
        jobsByCompany[job.company].push(job.title);
      });
      
      await fs.writeFile(this.jobsFilePath, JSON.stringify(jobsByCompany, null, 2));
      
      // Update in-memory cache
      this.previousJobs.clear();
      Object.entries(jobsByCompany).forEach(([company, jobs]) => {
        this.previousJobs.set(company, new Set(jobs));
      });
      
      console.log(`📊 Total jobs: ${currentJobs.length}, New: ${newJobs.length}`);
    }
    
    return newJobs;
  }

  async getJobDetails(jobUrl: string): Promise<JobDetails> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.goto(jobUrl, { waitUntil: 'networkidle' });

    const details = await this.page.evaluate(() => {
      const description = document.querySelector('#content, .job-description, [data-testid="job-description"]')?.textContent?.trim() || '';
      const location = document.querySelector('.location, [data-qa="job-location"], [data-testid="job-location"]')?.textContent?.trim() || 'Not specified';
      const department = document.querySelector('.department, [data-qa="job-department"], [data-testid="job-team"]')?.textContent?.trim() || 'Not specified';
      const salary = document.querySelector('.salary, .compensation, [data-testid="salary"]')?.textContent?.trim() || '';

      // Extract requirements
      const requirementElements = Array.from(document.querySelectorAll('li, p'))
        .filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('require') || text.includes('must have') || text.includes('experience') || text.includes('skills');
        })
        .map(el => el.textContent?.trim() || '')
        .filter(text => text.length > 0)
        .slice(0, 5);

      // Check for remote work mentions
      const fullText = document.body.textContent?.toLowerCase() || '';
      const remote = fullText.includes('remote') || fullText.includes('work from home') || fullText.includes('distributed');

      return {
        description: description.substring(0, 500),
        requirements: requirementElements,
        location,
        department,
        salary,
        remote
      };
    });

    return details;
  }

  async sendNotification(newJobs: JobPosting[]): Promise<void> {
    if (newJobs.length === 0) return;

    const transporter = nodemailer.createTransport({
      service: this.config.emailConfig.service,
      auth: {
        user: this.config.emailConfig.user,
        pass: this.config.emailConfig.pass
      }
    });

    // Group jobs by company and category
    const jobsByCompany = newJobs.reduce((acc, job) => {
      if (!acc[job.company]) acc[job.company] = {};
      if (!acc[job.company][job.category]) acc[job.company][job.category] = [];
      acc[job.company][job.category].push(job);
      return acc;
    }, {} as Record<string, Record<string, JobPosting[]>>);

    let emailBody = `🎯 Job Alert - ${new Date().toLocaleDateString()}\n`;
    emailBody += `Found ${newJobs.length} new job posting(s) across ${Object.keys(jobsByCompany).length} companies:\n\n`;
    
    for (const [company, categories] of Object.entries(jobsByCompany)) {
      const companyJobCount = Object.values(categories).flat().length;
      emailBody += `🏢 ${company} (${companyJobCount} jobs):\n`;
      
      for (const [category, jobs] of Object.entries(categories)) {
        emailBody += `  📁 ${category} (${jobs.length}):\n`;
        
        for (const job of jobs) {
          emailBody += `    🔹 ${job.title}\n`;
          emailBody += `       🔗 ${job.url}\n`;
          if (job.location) emailBody += `       📍 ${job.location}\n`;
          if (job.department) emailBody += `       🏢 ${job.department}\n`;
          
          // Get detailed job info if enabled
          if (process.env.FETCH_JOB_DETAILS === 'true') {
            try {
              const details = await this.getJobDetails(job.url);
              if (details.remote) emailBody += `       🏠 Remote-friendly\n`;
              if (details.salary) emailBody += `       💰 ${details.salary}\n`;
              if (details.requirements.length > 0) {
                emailBody += `       ✅ Key Requirements: ${details.requirements.slice(0, 2).join(', ')}\n`;
              }
            } catch (error) {
              console.log(`⚠️  Could not fetch details for ${job.title}`);
            }
          }
          emailBody += '\n';
        }
      }
      emailBody += '\n';
    }

    emailBody += `\n🤖 Powered by Multi-Company Job Monitor\n`;
    emailBody += `📅 Monitoring: ${this.config.jobSites.map(site => site.name).join(', ')}\n`;

    const companyList = Object.keys(jobsByCompany).join(', ');
    const subject = `🚀 ${newJobs.length} New Job(s) at ${companyList} - ${new Date().toLocaleDateString()}`;

    await transporter.sendMail({
      from: this.config.emailConfig.user,
      to: this.config.emailConfig.recipient,
      subject: subject,
      text: emailBody
    });

    console.log(`✅ Email sent for ${newJobs.length} new jobs across ${Object.keys(jobsByCompany).length} companies`);
  }

  async run(): Promise<void> {
    try {
      await this.init();
      const newJobs = await this.checkForNewJobs();
      
      if (newJobs.length > 0) {
        console.log(`🎯 Found ${newJobs.length} new job(s):`);
        
        // Group by company for display
        const jobsByCompany = newJobs.reduce((acc, job) => {
          if (!acc[job.company]) acc[job.company] = [];
          acc[job.company].push(job);
          return acc;
        }, {} as Record<string, JobPosting[]>);

        Object.entries(jobsByCompany).forEach(([company, jobs]) => {
          console.log(`  🏢 ${company}:`);
          jobs.forEach(job => console.log(`    - ${job.title} (${job.category})`));
        });
        
        await this.sendNotification(newJobs);
      } else {
        console.log('✨ No new jobs found');
      }
    } catch (error) {
      console.error('❌ Error during job monitoring:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Usage with retry logic
export async function runMonitor(config?: Partial<MonitorConfig>): Promise<void> {
  const monitor = new GenericJobMonitor(config);
  let retries = config?.retries || 3;
  
  while (retries > 0) {
    try {
      await monitor.run();
      break;
    } catch (error) {
      console.error(`❌ Attempt failed:`, error);
      retries--;
      
      if (retries > 0) {
        console.log(`🔄 Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('❌ All retry attempts failed');
        throw error;
      }
    }
  }
}

// CLI usage
if (require.main === module) {
  const method = (process.argv[2] as 'stagehand' | 'playwright' | 'manual') || 'playwright';
  const sites = process.argv.slice(3).length > 0 ? 
    jobSites.filter(site => process.argv.slice(3).includes(site.name.toLowerCase())) :
    jobSites;

  runMonitor({
    preferredMethod: method,
    jobSites: sites
  }).catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
