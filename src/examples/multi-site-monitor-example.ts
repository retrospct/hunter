import { ConfigurableJobMonitor, presetConfigs } from '../stagehand-config';
import { MultiSiteJobMonitorStagehand } from '../stagehand-monitor';

async function exampleBasicUsage() {
  console.log('=== Example 1: Monitor all configured sites ===');
  const monitor = new MultiSiteJobMonitorStagehand();
  await monitor.run();
}

async function exampleSpecificSites() {
  console.log('=== Example 2: Monitor specific sites ===');
  const monitor = new MultiSiteJobMonitorStagehand(['xAI', 'OpenAI']);
  await monitor.run();
}

async function exampleWithConfiguration() {
  console.log('=== Example 3: Using configuration presets ===');
  
  // Monitor AI companies with detailed job extraction
  const aiMonitor = new ConfigurableJobMonitor(presetConfigs.aiCompanies);
  await aiMonitor.runOnce();
}

async function exampleContinuousMonitoring() {
  console.log('=== Example 4: Continuous monitoring ===');
  
  const monitor = new ConfigurableJobMonitor({
    enabledSites: ['xAI', 'Anthropic'],
    fetchJobDetails: true,
    intervalMinutes: 30
  });
  
  // This will run indefinitely, checking every 30 minutes
  await monitor.runContinuous();
}

async function exampleEnvironmentBasedConfig() {
  console.log('=== Example 5: Environment-based configuration ===');
  
  // Set environment variables
  process.env.ENABLED_SITES = 'xAI,OpenAI,Meta AI';
  process.env.FETCH_JOB_DETAILS = 'true';
  
  const monitor = new MultiSiteJobMonitorStagehand();
  await monitor.run();
}

// Main execution
async function main() {
  const example = process.argv[2] || '1';
  
  switch (example) {
    case '1':
      await exampleBasicUsage();
      break;
    case '2':
      await exampleSpecificSites();
      break;
    case '3':
      await exampleWithConfiguration();
      break;
    case '4':
      await exampleContinuousMonitoring();
      break;
    case '5':
      await exampleEnvironmentBasedConfig();
      break;
    default:
      console.log('Usage: npm run example [1-5]');
      console.log('1: Monitor all sites');
      console.log('2: Monitor specific sites');
      console.log('3: Use configuration presets');
      console.log('4: Continuous monitoring');
      console.log('5: Environment-based config');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
