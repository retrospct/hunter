import { Stagehand } from "@browserbasehq/stagehand";
import fs from 'fs/promises';
import nodemailer from 'nodemailer';

interface JobPosting {
  title: string;
  url: string;
  category: string;
  isNew?: boolean;
}

class XAIJobMonitorStagehand {
  private stagehand: Stagehand;
  private previousJobs: Set<string> = new Set();
  private jobsFilePath = './xai-jobs-stagehand.json';

  constructor() {
    this.stagehand = new Stagehand({
      apiKey: process.env.BROWSERBASE_API_KEY!,
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      env: "BROWSERBASE", // Use Browserbase cloud browsers
    });
  }

  async init(): Promise<void> {
    await this.stagehand.init();
    
    try {
      const data = await fs.readFile(this.jobsFilePath, 'utf-8');
      const jobs = JSON.parse(data) as string[];
      this.previousJobs = new Set(jobs);
    } catch {
      console.log('Starting fresh job monitoring with Stagehand...');
    }
  }

  async scrapeJobs(): Promise<JobPosting[]> {
    const page = this.stagehand.page;
    
    await page.goto('https://job-boards.greenhouse.io/xai', {
      waitUntil: 'networkidle0'
    });

    // Use Stagehand's AI-powered extraction
    const jobs = await this.stagehand.extract({
      instruction: "Extract all job postings from this page. For each job, get the title and the link URL.",
      schema: {
        jobs: [
          {
            title: "string",
            url: "string"
          }
        ]
      }
    });

    // Process and categorize the extracted jobs
    const processedJobs: JobPosting[] = jobs.jobs.map((job: any) => ({
      title: job.title,
      url: job.url.startsWith('http') ? job.url : `https://job-boards.greenhouse.io${job.url}`,
      category: this.categorizeJob(job.title),
      isNew: !this.previousJobs.has(job.title)
    }));

    return processedJobs;
  }

  private categorizeJob(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('ai engineer') || lowerTitle.includes('researcher') || 
        lowerTitle.includes('machine learning') || lowerTitle.includes('ml engineer')) {
      return 'AI & Research';
    }
    if (lowerTitle.includes('datacenter') || lowerTitle.includes('network') || 
        lowerTitle.includes('operations') || lowerTitle.includes('infrastructure')) {
      return 'Infrastructure';
    }
    if (lowerTitle.includes('software engineer') || lowerTitle.includes('frontend') || 
        lowerTitle.includes('backend') || lowerTitle.includes('full stack')) {
      return 'Software Engineering';
    }
    return 'Other';
  }

  async checkForNewJobs(): Promise<JobPosting[]> {
    const currentJobs = await this.scrapeJobs();
    const newJobs = currentJobs.filter(job => job.isNew);
    
    if (newJobs.length > 0) {
      // Update stored jobs
      const allJobTitles = currentJobs.map(job => job.title);
      await fs.writeFile(this.jobsFilePath, JSON.stringify(allJobTitles, null, 2));
      this.previousJobs = new Set(allJobTitles);
    }
    
    return newJobs;
  }

  async getJobDetails(jobUrl: string): Promise<string> {
    await this.stagehand.page.goto(jobUrl, { waitUntil: 'networkidle0' });
    
    const details = await this.stagehand.extract({
      instruction: "Extract the job description, requirements, and any other relevant details from this job posting page.",
      schema: {
        description: "string",
        requirements: "string",
        location: "string"
      }
    });

    return `Location: ${details.location}\n\nDescription:\n${details.description}\n\nRequirements:\n${details.requirements}`;
  }

  async sendDetailedNotification(newJobs: JobPosting[]): Promise<void> {
    if (newJobs.length === 0) return;

    const transporter = nodemailer.createTransporter({
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

    let emailBody = `🚀 Found ${newJobs.length} new job posting(s) at xAI:\n\n`;
    
    for (const [category, jobs] of Object.entries(jobsByCategory)) {
      emailBody += `📁 ${category}:\n`;
      for (const job of jobs) {
        emailBody += `\n• ${job.title}\n`;
        emailBody += `  🔗 ${job.url}\n`;
        
        // Optionally get detailed job info (slower but more informative)
        if (process.env.FETCH_JOB_DETAILS === 'true') {
          try {
            const details = await this.getJobDetails(job.url);
            emailBody += `  📝 ${details.substring(0, 300)}...\n`;
          } catch (error) {
            console.log(`Could not fetch details for ${job.title}`);
          }
        }
      }
      emailBody += '\n';
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `🚀 ${newJobs.length} New xAI Job Posting(s) - ${new Date().toLocaleDateString()}`,
      text: emailBody
    });

    console.log(`✅ Sent notification for ${newJobs.length} new jobs`);
  }

  async run(): Promise<void> {
    try {
      await this.init();
      const newJobs = await this.checkForNewJobs();
      
      if (newJobs.length > 0) {
        console.log(`🎯 Found ${newJobs.length} new job(s):`);
        newJobs.forEach(job => console.log(`  - ${job.title} (${job.category})`));
        await this.sendDetailedNotification(newJobs);
      } else {
        console.log('✨ No new jobs found');
      }
    } finally {
      await this.stagehand.close();
    }
  }
}

// Usage
async function main() {
  const monitor = new XAIJobMonitorStagehand();
  await monitor.run();
}

if (require.main === module) {
  main().catch(console.error);
}

export { XAIJobMonitorStagehand };
