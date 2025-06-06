import { MultiSiteJobMonitorStagehand } from './stagehand-monitor';

export interface StagehandMonitorConfig {
  enabledSites?: string[];
  fetchJobDetails?: boolean;
  intervalMinutes?: number;
}

export class ConfigurableJobMonitor {
  private config: StagehandMonitorConfig;

  constructor(config: StagehandMonitorConfig = {}) {
    this.config = {
      enabledSites: config.enabledSites,
      fetchJobDetails: config.fetchJobDetails || false,
      intervalMinutes: config.intervalMinutes || 60
    };

    // Set environment variable for job details fetching
    if (this.config.fetchJobDetails) {
      process.env.FETCH_JOB_DETAILS = 'true';
    }
  }

  async runOnce(): Promise<void> {
    const monitor = new MultiSiteJobMonitorStagehand(this.config.enabledSites);
    await monitor.run();
  }

  async runContinuous(): Promise<void> {
    console.log(`🔄 Starting continuous monitoring every ${this.config.intervalMinutes} minutes`);
    
    while (true) {
      try {
        await this.runOnce();
      } catch (error) {
        console.error('❌ Error during monitoring cycle:', error);
      }
      
      const waitTime = this.config.intervalMinutes! * 60 * 1000;
      console.log(`⏰ Waiting ${this.config.intervalMinutes} minutes until next check...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Preset configurations for common use cases
export const presetConfigs = {
  // AI/ML focused companies
  aiCompanies: {
    enabledSites: ['xAI', 'OpenAI', 'Anthropic'],
    fetchJobDetails: true,
    intervalMinutes: 30
  },

  // Big Tech companies
  bigTech: {
    enabledSites: ['Meta AI', 'xAI'],
    fetchJobDetails: false,
    intervalMinutes: 60
  },

  // All available sites
  comprehensive: {
    enabledSites: undefined, // Monitor all configured sites
    fetchJobDetails: true,
    intervalMinutes: 60
  },

  // Quick monitoring without detailed extraction
  quick: {
    enabledSites: undefined,
    fetchJobDetails: false,
    intervalMinutes: 30
  }
};

// Usage examples
export async function runAICompaniesMonitor() {
  const monitor = new ConfigurableJobMonitor(presetConfigs.aiCompanies);
  await monitor.runOnce();
}

export async function runContinuousMonitoring() {
  const monitor = new ConfigurableJobMonitor(presetConfigs.comprehensive);
  await monitor.runContinuous();
}
