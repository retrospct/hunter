import { readFile, writeFile } from 'fs/promises';
import nodemailer from 'nodemailer';
import { Browser, chromium, Page } from 'playwright';

interface JobPosting {
  title: string;
  url: string;
  category: 'ai-research' | 'infrastructure' | 'software' | 'other';
}

class XAIJobMonitor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private previousJobs: Set<string> = new Set();
  private readonly jobsFilePath = './xai-jobs.json';

  async init(): Promise<void> {
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    this.page = await context.newPage();

    try {
      const data = await readFile(this.jobsFilePath, 'utf-8');
      const jobs = JSON.parse(data) as string[];
      this.previousJobs = new Set(jobs);
    } catch {
      // File doesn't exist yet, start fresh
      console.log('Starting fresh job monitoring...');
    }
  }

  async scrapeJobs(): Promise<JobPosting[]> {
    if (!this.page) {
      throw new Error('Browser page not initialized. Call init() first.');
    }

    try {
      await this.page.goto('https://job-boards.greenhouse.io/xai', {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for job listings to load
      await this.page.waitForSelector('table tr', { timeout: 15000 });

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
          .filter((job): job is { title: string; url: string } => job !== null);
      });

      return jobs.map(job => ({
        ...job,
        category: this.categorizeJob(job.title)
      }));
    } catch (error) {
      console.error('Error scraping jobs:', error);
      throw error;
    }
  }

  private categorizeJob(title: string): 'ai-research' | 'infrastructure' | 'software' | 'other' {
    const lowerTitle = title.toLowerCase();
    
    const aiKeywords = ['ai engineer', 'researcher', 'machine learning', 'ml engineer', 'cuda', 'gpu'];
    const infraKeywords = ['datacenter', 'data center', 'network', 'operations', 'infrastructure', 'facilities', 'fiber'];
    const softwareKeywords = ['software engineer', 'frontend', 'backend', 'full stack', 'fullstack'];
    
    if (aiKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'ai-research';
    }
    if (infraKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'infrastructure';
    }
    if (softwareKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'software';
    }
    return 'other';
  }

  async checkForNewJobs(): Promise<JobPosting[]> {
    const currentJobs = await this.scrapeJobs();
    const newJobs = currentJobs.filter(job => !this.previousJobs.has(job.title));
    
    if (newJobs.length > 0) {
      // Update stored jobs
      const allJobTitles = currentJobs.map(job => job.title);
      await writeFile(this.jobsFilePath, JSON.stringify(allJobTitles, null, 2));
      this.previousJobs = new Set(allJobTitles);
      
      console.log(`Total jobs: ${currentJobs.length}, New jobs: ${newJobs.length}`);
    }
    
    return newJobs;
  }

  async sendNotification(newJobs: JobPosting[]): Promise<void> {
    if (newJobs.length === 0) return;

    // Configure your email settings
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!
      }
    });

    const jobsByCategory = newJobs.reduce((acc, job) => {
      if (!acc[job.category]) acc[job.category] = [];
      acc[job.category].push(job);
      return acc;
    }, {} as Record<string, JobPosting[]>);

    let emailBody = `🚀 Found ${newJobs.length} new job posting(s) at xAI:\n\n`;
    
    Object.entries(jobsByCategory).forEach(([category, jobs]) => {
      const categoryName = category.replace('-', ' & ').toUpperCase();
      emailBody += `📁 ${categoryName}:\n`;
      jobs.forEach(job => {
        emailBody += `• ${job.title}\n  🔗 ${job.url}\n\n`;
      });
    });

    emailBody += `\n📅 Checked on: ${new Date().toLocaleString()}\n`;
    emailBody += `🤖 Automated by Playwright Job Monitor`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER!,
        to: process.env.NOTIFICATION_EMAIL!,
        subject: `🚀 ${newJobs.length} New xAI Job Posting(s) - ${new Date().toLocaleDateString()}`,
        text: emailBody
      });

      console.log(`✅ Sent notification for ${newJobs.length} new jobs`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  async run(): Promise<void> {
    try {
      await this.init();
      const newJobs = await this.checkForNewJobs();
      
      if (newJobs.length > 0) {
        console.log(`🎯 Found ${newJobs.length} new job(s):`);
        newJobs.forEach(job => console.log(`  - ${job.title} (${job.category})`));
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
async function main(): Promise<void> {
  const monitor = new XAIJobMonitor();
  let retries = 3;
  
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
        process.exit(1);
      }
    }
  }
}

// For daily execution via cron or scheduled functions
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { XAIJobMonitor };
