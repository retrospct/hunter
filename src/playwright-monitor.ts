import * as fs from 'fs/promises';
import * as nodemailer from 'nodemailer';
import { Browser, Page } from 'playwright-core';

interface JobPosting {
  title: string;
  url: string;
  category: string;
  isNew?: boolean;
}

interface JobDetails {
  description: string;
  requirements: string[];
  location: string;
  department: string;
}

class XAIJobMonitorPlaywright {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private previousJobs: Set<string> = new Set();
  private jobsFilePath = './xai-jobs-playwright.json';

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
    this.validateEnvironment();
    
    // Use Browserbase SDK
    const browserbase = new (require('@browserbasehq/sdk').Browserbase)({
      apiKey: process.env.BROWSERBASE_API_KEY!,
      projectId: process.env.BROWSERBASE_PROJECT_ID!
    });
    
    // Create a browser session
    const session = await browserbase.createSession();
    
    // Connect using playwright-core
    const { chromium } = require('playwright-core');
    this.browser = await chromium.connectOverCDP(session.connectUrl);
    
    const context = await this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    });
    
    this.page = await context.newPage();
    
    // Load previous jobs
    try {
      const data = await fs.readFile(this.jobsFilePath, 'utf-8');
      const jobs = JSON.parse(data) as string[];
      this.previousJobs = new Set(jobs);
    } catch {
      console.log('Starting fresh job monitoring with Playwright...');
    }
  }

  async scrapeJobs(): Promise<JobPosting[]> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.goto('https://job-boards.greenhouse.io/xai', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for the job listings to load
    await this.page.waitForSelector('table tr', { timeout: 10000 });

    const jobs = await this.page.evaluate(() => {
      const jobRows = Array.from(document.querySelectorAll('table tr'));
      return jobRows
        .map(row => {
          const link = row.querySelector('a');
          if (!link) return null;
          
          const title = link.textContent?.trim();
          const href = link.getAttribute('href');
          
          if (!title || !href || title === 'Job') return null; // Skip header row
          
          return {
            title: title,
            url: href.startsWith('http') ? href : `https://job-boards.greenhouse.io${href}`
          };
        })
        .filter(job => job !== null);
    });

    return jobs.map(job => ({
      ...job,
      category: this.categorizeJob(job.title),
      isNew: !this.previousJobs.has(job.title)
    })) as JobPosting[];
  }

  private categorizeJob(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    const categories = {
      'AI & Research': ['ai engineer', 'researcher', 'machine learning', 'ml engineer', 'cuda', 'gpu'],
      'Infrastructure': ['datacenter', 'network', 'operations', 'infrastructure', 'facilities', 'fiber'],
      'Software Engineering': ['software engineer', 'frontend', 'backend', 'full stack', 'fullstack'],
      'Management': ['manager', 'supervisor', 'lead', 'director']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerTitle.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }

  async getJobDetails(jobUrl: string): Promise<JobDetails> {
    if (!this.page) throw new Error('Page not initialized');

    await this.page.goto(jobUrl, { waitUntil: 'networkidle' });

    const details = await this.page.evaluate(() => {
      const description = document.querySelector('#content')?.textContent?.trim() || '';
      const location = document.querySelector('.location')?.textContent?.trim() || 
                     document.querySelector('[data-qa="job-location"]')?.textContent?.trim() || 'Not specified';
      const department = document.querySelector('.department')?.textContent?.trim() || 
                        document.querySelector('[data-qa="job-department"]')?.textContent?.trim() || 'Not specified';

      // Extract requirements (look for common patterns)
      const requirementElements = Array.from(document.querySelectorAll('li, p'))
        .filter(el => {
          const text = el.textContent?.toLowerCase() || '';
          return text.includes('require') || text.includes('must have') || text.includes('experience');
        })
        .map(el => el.textContent?.trim() || '')
        .filter(text => text.length > 0)
        .slice(0, 5); // Limit to top 5 requirements

      return {
        description: description.substring(0, 500), // First 500 chars
        requirements: requirementElements,
        location,
        department
      };
    });

    return details;
  }

  async checkForNewJobs(): Promise<JobPosting[]> {
    const currentJobs = await this.scrapeJobs();
    const newJobs = currentJobs.filter(job => job.isNew);
    
    if (newJobs.length > 0) {
      // Update stored jobs
      const allJobTitles = currentJobs.map(job => job.title);
      await fs.writeFile(this.jobsFilePath, JSON.stringify(allJobTitles, null, 2));
      this.previousJobs = new Set(allJobTitles);
      
      console.log(`📊 Total jobs: ${currentJobs.length}, New: ${newJobs.length}`);
    }
    
    return newJobs;
  }

  async sendEnhancedNotification(newJobs: JobPosting[]): Promise<void> {
    if (newJobs.length === 0) return;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Group jobs by category
    const jobsByCategory = newJobs.reduce((acc, job) => {
      if (!acc[job.category]) acc[job.category] = [];
      acc[job.category].push(job);
      return acc;
    }, {} as Record<string, JobPosting[]>);

    let emailBody = `🎯 xAI Job Alert - ${new Date().toLocaleDateString()}\n`;
    emailBody += `Found ${newJobs.length} new job posting(s):\n\n`;
    
    for (const [category, jobs] of Object.entries(jobsByCategory)) {
      emailBody += `📁 ${category} (${jobs.length}):\n`;
      
      for (const job of jobs) {
        emailBody += `\n🔹 ${job.title}\n`;
        emailBody += `   🔗 ${job.url}\n`;
        
        // Get detailed job info if enabled
        if (process.env.FETCH_JOB_DETAILS === 'true') {
          try {
            const details = await this.getJobDetails(job.url);
            emailBody += `   📍 ${details.location}\n`;
            emailBody += `   🏢 ${details.department}\n`;
            if (details.requirements.length > 0) {
              emailBody += `   ✅ Key Requirements: ${details.requirements.slice(0, 2).join(', ')}\n`;
            }
          } catch (error) {
            console.log(`⚠️  Could not fetch details for ${job.title}`);
          }
        }
      }
      emailBody += '\n';
    }

    emailBody += '\n🤖 Powered by Browserbase + Playwright\n';

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `🚀 ${newJobs.length} New xAI Job(s) - ${Object.keys(jobsByCategory).join(', ')}`,
      text: emailBody
    });

    console.log(`✅ Email sent for ${newJobs.length} new jobs`);
  }

  async run(): Promise<void> {
    try {
      await this.init();
      const newJobs = await this.checkForNewJobs();
      
      if (newJobs.length > 0) {
        console.log(`🎯 Found ${newJobs.length} new job(s):`);
        newJobs.forEach(job => console.log(`  - ${job.title} (${job.category})`));
        await this.sendEnhancedNotification(newJobs);
      } else {
        console.log('✨ No new jobs found');
      }
    } finally {
      await this.cleanup();
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Usage with error handling and retries
async function main() {
  const monitor = new XAIJobMonitorPlaywright();
  let retries = 3;
  
  while (retries > 0) {
    try {
      await monitor.run();
      break;
    } catch (error) {
      console.error(`❌ Error occurred:`, error);
      retries--;
      if (retries > 0) {
        console.log(`🔄 Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      }
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { XAIJobMonitorPlaywright };
