import { XAIJobMonitor } from './playwright-manual';
import { XAIJobMonitorPlaywright } from './playwright-monitor';
import { XAIJobMonitorStagehand } from './stagehand-monitor';

interface MonitorConfig {
  preferredMethod: 'stagehand' | 'playwright' | 'manual';
  retries: number;
  fallbackEnabled: boolean;
}

class JobMonitorManager {
  private config: MonitorConfig;

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      preferredMethod: 'stagehand',
      retries: 3,
      fallbackEnabled: true,
      ...config
    };
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

  async runMonitor(method: 'stagehand' | 'playwright' | 'manual'): Promise<boolean> {
    try {
      switch (method) {
        case 'stagehand':
          const stagehandMonitor = new XAIJobMonitorStagehand();
          await stagehandMonitor.run();
          return true;
        
        case 'playwright':
          const playwrightMonitor = new XAIJobMonitorPlaywright();
          await playwrightMonitor.run();
          return true;
        
        case 'manual':
          const manualMonitor = new XAIJobMonitor();
          await manualMonitor.run();
          return true;
        
        default:
          throw new Error(`Unknown monitor method: ${method}`);
      }
    } catch (error) {
      console.error(`❌ ${method} monitor failed:`, error);
      return false;
    }
  }

  async run(): Promise<void> {
    try {
      this.validateEnvironment();
      console.log(`🚀 Starting job monitoring with preferred method: ${this.config.preferredMethod}`);
      
      const methods: Array<'stagehand' | 'playwright' | 'manual'> = [
        this.config.preferredMethod,
        ...(this.config.fallbackEnabled ? 
          (['stagehand', 'playwright', 'manual'] as const).filter(m => m !== this.config.preferredMethod) : 
          [])
      ];

      for (const method of methods) {
        console.log(`🔄 Trying ${method} monitor...`);
        
        let success = false;
        let retries = this.config.retries;
        
        while (retries > 0 && !success) {
          success = await this.runMonitor(method);
          
          if (!success) {
            retries--;
            if (retries > 0) {
              console.log(`🔄 Retrying ${method}... (${retries} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          }
        }
        
        if (success) {
          console.log(`✅ ${method} monitor completed successfully`);
          return;
        } else {
          console.log(`❌ ${method} monitor failed after all retries`);
        }
      }
      
      throw new Error('All monitoring methods failed');
    } catch (error) {
      console.error('❌ Job monitoring failed:', error);
      process.exit(1);
    }
  }
}

// Command line usage
async function main(): Promise<void> {
  const preferredMethod = (process.argv[2] as 'stagehand' | 'playwright' | 'manual') || 'stagehand';
  const fallbackEnabled = process.argv[3] !== '--no-fallback';
  
  const manager = new JobMonitorManager({
    preferredMethod,
    fallbackEnabled,
    retries: 3
  });
  
  await manager.run();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { JobMonitorManager };
