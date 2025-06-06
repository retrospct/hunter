# Multi-Company Job Monitor

A powerful, configurable job monitoring system that scrapes multiple tech company career pages and sends intelligent email notifications for new job postings.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

## 🚀 Key Features

### 🌐 Multi-Site Support
The enhanced `stagehand-monitor.ts` (and `generic-job-monitor.ts`) now supports monitoring multiple career websites simultaneously.
- **xAI**: AI research and development roles
- **OpenAI**: AI research and product development
- **Anthropic**: AI safety and research positions
- **Meta AI**: AI/ML roles at Meta
- *Easily extensible to add more sites (see "Adding New Companies" section)*

### 🎯 Smart Job Categorization
Jobs are automatically categorized into groups like:
- AI & Research
- Software Engineering
- Infrastructure & DevOps
- Management & Leadership
- Product & Design
- Data Science & Analytics
- Security
- Sales & Marketing
- Operations
*(See "Job Categories" section for more details)*

### 📧 Enhanced Email Notifications
- Grouped by company and category
- Location and department information
- Optional detailed job descriptions (via `FETCH_JOB_DETAILS=true`)
- Professional HTML formatting

### ⚙️ Flexible Configuration
- Monitor all sites or specific ones
- Environment variable configuration (`ENABLED_SITES`, `FETCH_JOB_DETAILS`, etc.)
- Preset configurations for common use cases (e.g., AI companies, Big Tech) available for programmatic use.
- Continuous monitoring support (in some programmatic configurations).

### 🛠️ Multiple Scraping Methods
- Supports Stagehand AI, Browserbase Cloud, and local Playwright, providing flexibility and fallback options.

### 💪 Robust Error Handling
- Automatic retries for network issues or temporary site problems.
- Fallback mechanisms if one scraping method or site fails.
- Comprehensive logging for easier troubleshooting.

### 🔒 Type-Safe
- Full TypeScript implementation with strong typing for better maintainability and fewer runtime errors.

## 📋 Supported Companies

The system supports these career sites out of the box:
- **xAI** - https://job-boards.greenhouse.io/xai
- **OpenAI** - https://openai.com/careers
- **Anthropic** - https://www.anthropic.com/careers
- **Meta AI** - https://www.metacareers.com/jobs
- *Easily extensible to add more (see "Adding New Companies" section below)*

## 🏁 Quick Start

### Environment Setup
Ensure you have Node.js installed. Clone the repository and install dependencies:
```bash
git clone https://github.com/retrospct/hunter.git
cd hunter
npm install
```

Set up your environment variables by copying the example file and editing it:
```bash
cp .env.example .env
```
Then, edit the `.env` file with your credentials.
**At a minimum, you must set:**
*   `EMAIL_USER`, `EMAIL_PASS`, `NOTIFICATION_EMAIL` for email alerts.
*   `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` if using cloud-based scraping methods ('playwright', 'stagehand').

*For a full list of environment variables and detailed configuration options, please see the "⚙️ Configuration" section below.*

### Basic Usage Command
Once configured, you can start monitoring jobs using:
```bash
npm run check-jobs
```
This typically runs the `src/generic-job-monitor.ts` script, which will use your `.env` configuration (including `ENABLED_SITES`, `PREFERRED_METHOD`, etc.).

*For more detailed command-line usage, including monitoring specific sites or using different scraping methods, see the "🎯 Usage Commands & Examples" section.*

```bash
# Clone the repository
git clone https://github.com/retrospct/hunter.git
cd hunter

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## ⚙️ In-Depth Configuration

Configuration is primarily managed through environment variables, typically set in a `.env` file in the project root. Create this file by copying `.env.example` if you haven't already.

### Core Environment Variables

*   **`EMAIL_USER`**: Your Gmail address (or equivalent for other providers).
*   **`EMAIL_PASS`**: Your Gmail App Password (recommended for security with 2FA) or your regular account password if not using 2FA.
*   **`NOTIFICATION_EMAIL`**: The email address where job alerts will be sent.
*   **`BROWSERBASE_API_KEY`**: Your API key from [Browserbase.com](https://browserbase.com). This is **required** if you plan to use cloud-based scraping methods like `playwright` (default cloud) or `stagehand`.
*   **`BROWSERBASE_PROJECT_ID`**: Your project ID from Browserbase, also **required** for cloud scraping.

### Optional Environment Variables

*   **`ENABLED_SITES`**: A comma-separated list of company names to monitor (e.g., `"xAI,OpenAI,Anthropic"`). Ensure there are no spaces around the commas. If not set, the system might default to monitoring all companies defined in `src/job-sites.config.ts`, behavior which can depend on the specific script being run.
*   **`FETCH_JOB_DETAILS`**: Set to `"true"` to extract full job descriptions, requirements, etc. This is more informative but significantly slower and consumes more Browserbase credits (if used). Defaults to `"false"`.
*   **`PREFERRED_METHOD`**: Defines the default scraping method. Options typically include:
    *   `generic`: (Recommended) A flexible wrapper that can often choose the best method or be configured.
    *   `playwright`: Uses Playwright via Browserbase for cloud scraping.
    *   `stagehand`: Uses Stagehand AI via Browserbase for intelligent cloud scraping.
    *   `manual`: Uses a local Playwright installation (requires your machine to have browsers installed and may require `npx playwright install`).
    If not set, `generic` or `playwright` is often the default.
*   **`LOG_LEVEL`**: Controls logging verbosity. Set to `debug` for detailed troubleshooting logs (e.g., `LOG_LEVEL=debug`). Other common values are `info`, `warn`, `error`.
*   **`DATABASE_URL`**: Connection string for a PostgreSQL database, if you plan to use the (currently planned) database integration features. Example: `postgresql://user:password@host:port/database`.
*   **`MONITORING_INTERVAL_MINUTES`**: For programmatic scripts that support continuous monitoring, this sets the time interval in minutes between checks.

### Email Setup Details

1.  **Gmail (Recommended)**:
    *   Use an **App Password** for better security.
    *   Go to your Google Account → Security → 2-Step Verification (must be enabled).
    *   Scroll down to "App passwords".
    *   Generate a new app password, name it (e.g., "Job Monitor"), and copy the generated password into `EMAIL_PASS`.
2.  **Other Email Providers**: You might need to adjust the `emailConfig` object within the scripts if you're not using Gmail, or ensure your provider allows SMTP access with username/password.

### Browserbase Setup (for Cloud Scraping Methods)

1.  Go to [Browserbase.com](https://browserbase.com) and sign up for an account.
2.  In your Browserbase dashboard, create a new project.
3.  Locate your API Key and Project ID for this project.
4.  Add these credentials to the `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` variables in your `.env` file.
Browserbase is a service that runs browser automation tasks in the cloud, which is leveraged by the `playwright` (cloud) and `stagehand` scraping methods for reliability and to avoid IP blocking.

### Programmatic Configuration Presets
The system includes pre-defined configurations for common scenarios, intended for programmatic use with the `ConfigurableJobMonitor` (found in `src/stagehand-config.ts`). These presets are not directly set via `.env` but are used in your TypeScript code. They offer a convenient way to bundle settings like target sites, detail fetching, and monitoring intervals.

**Examples of available presets (defined in `src/stagehand-config.ts`):**

*   `presetConfigs.aiCompanies`: Monitors key AI companies (e.g., xAI, OpenAI, Anthropic) with detailed job extraction enabled.
    *   `enabledSites: ['xAI', 'OpenAI', 'Anthropic']`
    *   `fetchJobDetails: true`
    *   `intervalMinutes: 30` (default for continuous runs)
*   `presetConfigs.bigTech`: Aims at larger tech companies (e.g., Meta AI, potentially others).
    *   `enabledSites: ['Meta AI', 'xAI']` (example, actual sites may vary)
    *   `fetchJobDetails: false`
    *   `intervalMinutes: 60`
*   `presetConfigs.comprehensive`: Monitors all available sites with full job details.
    *   `enabledSites: undefined` (signifying all sites in `job-sites.config.ts`)
    *   `fetchJobDetails: true`
    *   `intervalMinutes: 60`
*   `presetConfigs.quick`: Scans all sites but without fetching extensive details, for faster updates.
    *   `enabledSites: undefined`
    *   `fetchJobDetails: false`
    *   `intervalMinutes: 30`

Refer to the "Programmatic Usage" section for examples of how to use these presets in your code.


## 🎯 Command-Line Usage

This section details how to run the job monitor from your terminal.

### Primary Monitoring Script (`generic-job-monitor.ts`)
The most common way to run the monitor is using `generic-job-monitor.ts`, often aliased in `package.json`.

**1. Monitor Based on `.env` Configuration:**
```bash
npm run check-jobs
```
This command typically executes `npx tsx src/generic-job-monitor.ts`. It will use settings from your `.env` file, such as `ENABLED_SITES`, `PREFERRED_METHOD`, and `FETCH_JOB_DETAILS`.

**2. Monitor Specific Companies (Overrides `.env` `ENABLED_SITES`):**
You can specify companies directly on the command line. The first argument after the script name is often the method, followed by company names (use short names defined in `job-sites.config.ts`).
```bash
# Use the 'generic' method for xAI and OpenAI
npx tsx src/generic-job-monitor.ts generic xai openai

# Use the 'playwright' (cloud) method for Anthropic
npx tsx src/generic-job-monitor.ts playwright anthropic

# Use the 'manual' (local Playwright) method for Meta AI
npx tsx src/generic-job-monitor.ts manual metaai

# Use the 'stagehand' (AI cloud) method for xAI
npx tsx src/generic-job-monitor.ts stagehand xai
```

**3. Using `npm run` Aliases:**
Your `package.json` might contain pre-configured scripts for common scenarios. Examples:
```bash
# Check package.json for scripts like these:
npm run monitor-all          # Potentially monitors all sites with default settings
npm run monitor-ai           # Could be configured for AI-focused companies
npm run monitor-with-details # Might run with FETCH_JOB_DETAILS=true implicitly
```
*Always refer to your `package.json` for the exact `scripts` available.*

**4. Running Packaged Examples (if available):**
Some versions may include example runner scripts (e.g., `npm run example <number>`). Check your `package.json` or project documentation.

## Programmatic Usage
The job monitor can be integrated into your own TypeScript projects or scripts, offering greater flexibility.

### Option 1: Using `GenericJobMonitor` (Recommended for Most Custom Scripts)
The `GenericJobMonitor` class (`src/generic-job-monitor.ts`) is a versatile option.

```typescript
The job monitor can be integrated into your own TypeScript projects or scripts.

### Using `GenericJobMonitor` (Recommended for Flexibility)
```typescript
import { GenericJobMonitor, runMonitor } from './src/generic-job-monitor';
import { jobSites } from './src/job-sites.config'; // Full list of site configurations
import { JobMonitorArgs } from './src/types';     // Type definitions for configuration options

// Example 1: Simple run using .env configuration
async function simpleRun() {
  await runMonitor(); // Automatically uses settings from your .env file
}
// To run: simpleRun();

// Example 2: Programmatic configuration for a single execution
async function configuredSingleRun() {
  const options: JobMonitorArgs = {
    preferredMethod: 'playwright', // Specify scraping method: 'playwright', 'stagehand', 'manual', or 'generic'
    jobSites: jobSites.filter(site => ['xAI', 'OpenAI'].includes(site.name)), // Select specific sites
    retries: 3,                   // Number of retries on failure
    fetchJobDetails: true,        // Override .env to fetch full details
    // Optionally, override email configuration directly in code:
    // emailConfig: {
    //   user: process.env.EMAIL_USER!, // Or hardcoded values
    //   pass: process.env.EMAIL_PASS!,
    //   recipient: process.env.NOTIFICATION_EMAIL!,
    //   service: 'Gmail' // Or your email service
    // }
  };
  await runMonitor(options);
}
// To run: configuredSingleRun();

// Example 3: Advanced instantiation for more control
async function advancedInstanceRun() {
  const monitor = new GenericJobMonitor({
    preferredMethod: 'manual', // Use local browser for this instance
    jobSites: jobSites.filter(site => site.name === 'xAI'), // Monitor only xAI
    fetchJobDetails: false,
    // Custom email configuration can also be passed here
  });
  await monitor.run(); // Executes based on the configuration of this specific instance
}
// To run: advancedInstanceRun();
```

### Option 2: Using `MultiSiteJobMonitorStagehand` and `ConfigurableJobMonitor`
These classes, primarily from `src/stagehand-monitor.ts` and `src/stagehand-config.ts`, provide an alternative structure, especially useful if you want to leverage the pre-defined configuration presets.

**A. Basic Multi-Site Monitoring with `MultiSiteJobMonitorStagehand`:**
This class is straightforward for monitoring sites, either all configured (via `.env`) or a specific list.
```typescript
import { MultiSiteJobMonitorStagehand } from './src/stagehand-monitor';

async function runStagehandMonitor() {
  // Monitors sites based on ENABLED_SITES in .env, or all sites if not set.
  const allSitesMonitor = new MultiSiteJobMonitorStagehand();
  await allSitesMonitor.run();

  // Monitor a specific list of sites programmatically
  const specificSitesMonitor = new MultiSiteJobMonitorStagehand(['xAI', 'OpenAI']);
  await specificSitesMonitor.run();
}
// To run: runStagehandMonitor();
```

**B. Using Configuration Presets with `ConfigurableJobMonitor`:**
This class allows you to easily use the `presetConfigs` (like `aiCompanies`, `bigTech`, etc.) mentioned in the "Configuration" section.
```typescript
import { ConfigurableJobMonitor, presetConfigs } from './src/stagehand-config';

async function runPresetMonitor() {
  // Example: Use the 'aiCompanies' preset for a single run
  const aiMonitor = new ConfigurableJobMonitor(presetConfigs.aiCompanies);
  await aiMonitor.runOnce();

  // Example: Continuous monitoring using a custom configuration or modified preset
  const continuousAnthropicMonitor = new ConfigurableJobMonitor({
    ...presetConfigs.quick, // Start with a base preset
    enabledSites: ['Anthropic'], // Override to focus on Anthropic
    fetchJobDetails: true,
    intervalMinutes: 45 // Check every 45 minutes
  });
  // await continuousAnthropicMonitor.runContinuous(); // Uncomment to run continuously
                                                  // Be mindful of resource usage and scheduling.
}
// To run: runPresetMonitor();
```

**C. Custom Configuration with `ConfigurableJobMonitor`:**
You can also provide a completely custom configuration to `ConfigurableJobMonitor`.
```typescript
import { ConfigurableJobMonitor } from './src/stagehand-config';

async function runCustomConfigurableMonitor() {
  const customMonitor = new ConfigurableJobMonitor({
    enabledSites: ['OpenAI', 'Meta AI'], // Specify sites
    fetchJobDetails: false,             // Fetch limited details
    intervalMinutes: 60                 // Set interval for continuous runs
  });
  await customMonitor.runOnce(); // For a single execution
}
// To run: runCustomConfigurableMonitor();
```

## 💾 Data Storage

To identify *new* job postings, the system needs to remember which jobs it has seen before. By default, this is done by storing job data (usually titles or unique IDs/URLs) in JSON files within the `./jobs-data/` directory. The path might be configurable in some script versions.

**Example filenames:**
- `xai-jobs-stagehand.json`
- `openai-jobs-stagehand.json`
- `anthropic-jobs-stagehand.json`
- `metaai-jobs-stagehand.json` (Note: filenames may vary slightly based on company name normalization)

These files ensure that you are only notified about jobs that have appeared since the last check. If the planned database integration is implemented and configured (see "Database Integration" section), job data will be stored in the database instead of local JSON files, offering more robust storage and querying capabilities.

## 🏗 Architecture

The project is modular, separating concerns like site configuration, scraping logic, categorization, and notifications.

**Core File Structure (`src/` directory):**
```
src/
├── generic-job-monitor.ts    # High-level flexible monitor; good starting point for CLI & programmatic use.
├── stagehand-monitor.ts      # Implements `MultiSiteJobMonitorStagehand` using Browserbase + Stagehand AI.
├── stagehand-config.ts       # Defines `ConfigurableJobMonitor` and various preset configurations.
├── playwright-monitor.ts     # Core logic for cloud-based Playwright scraping (via Browserbase).
├── playwright-manual.ts      # Core logic for local Playwright scraping.
├── check-jobs.ts             # Often the main entry point for `npm run check-jobs`; coordinates monitoring tasks.
|
├── job-sites.config.ts       # CRITICAL: Central configuration for all supported job sites (URLs, CSS selectors, category keywords).
├── types.ts                  # TypeScript interfaces and type definitions (JobPosting, SiteConfig, etc.).
|
├── email.ts                  # Utilities for composing and sending email notifications.
├── categorize.ts             # Logic for assigning categories to job postings.
├── utils.ts                  # Common utility functions used across the project.
└── ... (other specialized modules or helper files)
```

### Overview of Scraping Methods

| Method             | Underlying Technology              | Key Characteristics                                       | When to Use                                                |
|--------------------|------------------------------------|-----------------------------------------------------------|------------------------------------------------------------|
| **Generic Monitor**  | Wraps other methods                | Dynamically chooses method based on config; flexible      | **Recommended for most command-line and programmatic use** |
| **Stagehand**        | Browserbase + AI Extraction        | Smart parsing, potentially less reliant on exact CSS selectors | When CSS selectors are unstable or for complex job pages   |
| **Playwright Cloud** | Browserbase + Playwright-core      | Reliable, scalable, runs in the cloud                     | Production, scheduled tasks, when local IP gets blocked    |
| **Manual**           | Local Playwright installation      | Runs on your machine, no cloud dependencies, good for debugging | Development, testing new site configs, small-scale use     |

## 📊 Job Categories

Jobs are categorized using keywords found in their titles or descriptions. This logic is primarily handled by `src/categorize.ts`, utilizing keyword configurations within each site's definition in `src/job-sites.config.ts`.

**Common Default Categories:**
*(These can be customized or expanded in `job-sites.config.ts`)*
*   **🤖 AI & Research**: Includes roles like AI Engineer, Machine Learning Engineer, Researcher, Data Scientist (research-focused).
*   **💻 Software Engineering**: Covers Frontend, Backend, Full-Stack, Mobile, and general Software Engineers/Developers.
*   **🏗 Infrastructure & DevOps**: Roles such as SRE, Platform Engineer, Cloud Engineer, DevOps Engineer, Systems Administrator.
*   **👨‍💼 Management & Leadership**: Engineering Managers, Directors, VPs of Engineering, Team Leads.
*   **🎨 Product & Design**: Product Managers, UX/UI Designers, Product Designers, UX Researchers.
*   **📈 Data Science & Analytics**: Data Analysts, Data Engineers, BI Specialists, Data Scientists (product/analytics-focused).
*   **🔒 Security**: Cybersecurity Engineers, InfoSec Analysts, Application Security Specialists.
*   **📢 Sales & Marketing**: Technical sales, product marketing, business development in tech.
*   **⚙️ Operations**: Program Managers, Project Managers, Technical Operations, IT Support.

## 🔧 Adding New Companies

1. **Add company configuration** in `src/job-sites.config.ts`:

```typescript
{
  name: 'YourCompany',
  url: 'https://yourcompany.com/careers',
  selectors: {
    jobList: '.job-listing',           // Container for each job
    jobTitle: '.job-title',            // Job title element
    jobUrl: 'a',                       // Link to job details
    location: '.location',             // Optional: location info
    department: '.department'          // Optional: department info
  },
  categoryKeywords: {
    'AI & Research': ['ai', 'machine learning', 'research'],
    'Engineering': ['engineer', 'developer', 'programmer'],
    // ... customize categories for this company
  },
  urlPrefix: 'https://yourcompany.com'  // Optional: prefix for relative URLs
}
```

2. **Test the configuration**:

```bash
npx tsx src/generic-job-monitor.ts manual yourcompany
```

## 📬 Email Notifications

The system sends HTML-formatted email notifications detailing newly found jobs.

**Features:**
- **Summary**: Total new jobs found across all monitored companies.
- **Grouping**: Jobs are grouped by company and then by job category.
- **Details**: Each job listing typically includes:
    - Job Title
    - Direct URL to the job posting
    - Location (if available)
    - Department (if available)
    - Salary Information (if `FETCH_JOB_DETAILS` is true and data is found)
    - Remote work indication (if applicable)
- **Professional Formatting**: Emails are designed to be easy to read and navigate.

### Sample Email Format (Illustrative)
```
🚀 Found 5 new job posting(s) across 2 companies:

🏢 xAI (3 new jobs):

  📁 AI & Research:
    • Senior AI Researcher
      📍 Palo Alto, CA
      🏷️ Research Team
      🔗 https://job-boards.greenhouse.io/xai/jobs/...

  📁 Software Engineering:
    • Staff Software Engineer - Infrastructure
      📍 San Francisco, CA
      🔗 https://job-boards.greenhouse.io/xai/jobs/...

🏢 OpenAI (2 new jobs):

  📁 AI & Research:
    • Research Scientist - Safety
      📍 San Francisco, CA
      🔗 https://openai.com/careers/...

--------------------------------------------------
🤖 Powered by Multi-Company Job Monitor
🕒 Monitored Sites: xAI, OpenAI, Anthropic
```

## ⚙️ Error Handling and Reliability

The system incorporates several features for robust operation:
- **Site Failures**: If scraping one site fails, the monitor continues with other configured sites.
- **Network Issues**: Retries are implemented for transient network problems.
- **Data Extraction Fallbacks**: For some sites or methods, there might be fallbacks if primary data extraction fails.
- **Clear Logging**: Detailed logs help diagnose issues. Enable debug mode (`DEBUG=true` or `LOG_LEVEL=debug` in `.env`) for more verbose output.
- **Email Delivery Errors**: Failures in sending email notifications are logged.

## 🚀 Performance Considerations

- **Rate Limiting**: Respectful delays (e.g., 2 seconds) are often included between requests to individual sites to avoid overloading them.
- **Selective Monitoring**: Use `ENABLED_SITES` or programmatic filtering to monitor only the companies you care about, reducing execution time.
- **Detail Extraction**: Setting `FETCH_JOB_DETAILS="true"` provides more information but is significantly slower and uses more resources (both local and cloud, if applicable). Use judiciously.
- **Parallel Processing**: While not always explicit, some parts of the scraping process (e.g., processing multiple job links from a single page) might be done with some level of concurrency.

## 🛠️ Troubleshooting

### Common Issues
1.  **Environment Variables**: Double-check that all required variables in `.env` are correctly set (API keys, email credentials, etc.).
2.  **Browserbase Limits**: If using cloud methods, you might hit Browserbase usage limits. Check your dashboard.
3.  **Email Authentication**: For Gmail, ensure you're using an App Password if 2FA is enabled. Regular passwords might not work.
4.  **Site Structure Changes**: Career websites frequently update their HTML structure. This can break CSS selectors. If a site stops working, its selectors in `src/job-sites.config.ts` may need updating.
5.  **Dependencies**: Ensure all `npm` dependencies are correctly installed with `npm install`.
6.  **Playwright Browsers**: If using `manual` (local Playwright) for the first time, Playwright might need to download browser binaries. Run `npx playwright install` if you encounter issues.

### Debug Mode
Enable detailed logging for troubleshooting:
```bash
# Option 1: Using DEBUG environment variable (if supported by the script's logger)
DEBUG=true npm run check-jobs

# Option 2: Setting LOG_LEVEL in .env
# Add this line to your .env file:
# LOG_LEVEL=debug
# Then run your command:
# npm run check-jobs
```

### Monitoring Logs
The system provides console logging with varying levels of detail:
- `🔍` Indicates site scraping activity.
- `✅` Marks successful job data extraction.
- `❌` Denotes errors or failures.
- `🎯` Highlights new job discoveries.
- `📧` Shows email notification status.

Log files might also be generated in a `logs/` directory or the project root.

## 🔄 Migration from Single-Site Version

If you were using an older, single-site version of this tool (e.g., one focused only on xAI):
1.  **Data Migration**: Old job data files (e.g., `xai-jobs.json`) might be automatically read by the new system if the filenames or structures are compatible. The new system typically uses filenames like `xai-jobs-stagehand.json`.
2.  **Environment Variables**: Most environment variables (`EMAIL_USER`, `EMAIL_PASS`, `NOTIFICATION_EMAIL`, `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID`) remain the same. New optional variables like `ENABLED_SITES` and `FETCH_JOB_DETAILS` offer more control.
3.  **API Compatibility**: If you were using programmatic imports, the class and method names might have changed (e.g., from an xAI-specific monitor to `GenericJobMonitor` or `MultiSiteJobMonitorStagehand`). Update your imports accordingly.
4.  **Selective Monitoring**: To replicate old behavior (e.g., only monitor xAI), you can set `ENABLED_SITES="xAI"` in your `.env` file or specify the company when running the script.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for detailed information on how to get started, including development setup, coding standards, and our pull request process.

Key steps include:
1. Forking the repository.
2. Setting up your development environment (see `docs/CONTRIBUTING.md` for details).
3. Creating a feature branch.
4. Making your changes, including tests if applicable.
5. Submitting a Pull Request.

Please also refer to our [Code of Conduct](docs/CODE_OF_CONDUCT.md).

## 🚀 Deployment Strategies

This job monitor can be deployed in various environments, from simple local scheduling to robust cloud-based setups.

### Option 1: Local Scheduling (Cron Jobs)
For personal use or small-scale monitoring, you can run the monitor on your local machine or a personal server using `cron` (on macOS/Linux) or Task Scheduler (on Windows).

**Example `crontab` entry (Linux/macOS):**

```bash
# Example: Run every 4 hours
# 0 */4 * * * cd /path/to/your/project/hunter && npm run check-jobs >> /path/to/your/project/hunter/cron.log 2>&1

# Example: Run at 9 AM and 5 PM on weekdays
# 0 9,17 * * 1-5 cd /path/to/your/project/hunter && npm run check-jobs >> /path/to/your/project/hunter/cron.log 2>&1
```
Make sure to use the absolute path to your project and redirect output to a log file for easier debugging.

### Option 2: Cloud Deployment with GitHub Actions
GitHub Actions is an excellent way to run the job monitor automatically on a schedule, especially if your project is hosted on GitHub. This is a recommended method for regular, automated cloud monitoring.

**A. Repository Setup:**
1.  **Fork or clone** this repository to your GitHub account.
2.  **Configure Repository Secrets**: In your GitHub repository, navigate to `Settings` > `Secrets and variables` > `Actions`. Create new repository secrets for the following (these will be securely available to your workflow):
    *   `EMAIL_USER`
    *   `EMAIL_PASS` (Your Gmail App Password)
    *   `NOTIFICATION_EMAIL`
    *   `BROWSERBASE_API_KEY`
    *   `BROWSERBASE_PROJECT_ID`
    *   `ENABLED_SITES` (Optional, e.g., `"xAI,OpenAI,Anthropic"`)
    *   `FETCH_JOB_DETAILS` (Optional, e.g., `"true"` or `"false"`)

**B. Workflow File:**
Create a workflow file (e.g., `.github/workflows/job-monitor.yml`) in your repository:

```yaml
name: Job Monitor

on:
  schedule:
    # Run every 6 hours at 00, 06, 12, 18 UTC
    - cron: '0 */6 * * *'
    # Run twice daily during business hours (9 AM and 5 PM PST)
    - cron: '0 17,1 * * 1-5'  # 9 AM and 5 PM PST = 17:00 and 01:00 UTC
  workflow_dispatch:  # Allow manual triggers

jobs:
  monitor-jobs:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run job monitor
      env:
        EMAIL_USER: ${{ secrets.EMAIL_USER }}
        EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
        NOTIFICATION_EMAIL: ${{ secrets.NOTIFICATION_EMAIL }}
        BROWSERBASE_API_KEY: ${{ secrets.BROWSERBASE_API_KEY }}
        BROWSERBASE_PROJECT_ID: ${{ secrets.BROWSERBASE_PROJECT_ID }}
        FETCH_JOB_DETAILS: false
      run: npm run check-jobs
      
    - name: Upload logs on failure
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: job-monitor-logs
        path: |
          *.log
          logs/
        retention-days: 7
```

### 3. Advanced Workflow with Matrix Strategy

For monitoring different company groups or configurations:

```yaml
name: Multi-Strategy Job Monitor

on:
  schedule:
    - cron: '0 */4 * * *'
  workflow_dispatch:

jobs:
  monitor-jobs:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        config:
          - name: "AI Companies"
            companies: "xai openai anthropic"
          - name: "Big Tech"
            companies: "meta google microsoft"
      fail-fast: false
      
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run job monitor - ${{ matrix.config.name }}
      env:
        EMAIL_USER: ${{ secrets.EMAIL_USER }}
        EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
        NOTIFICATION_EMAIL: ${{ secrets.NOTIFICATION_EMAIL }}
        BROWSERBASE_API_KEY: ${{ secrets.BROWSERBASE_API_KEY }}
        BROWSERBASE_PROJECT_ID: ${{ secrets.BROWSERBASE_PROJECT_ID }}
      run: npx tsx src/generic-job-monitor.ts playwright ${{ matrix.config.companies }}
```

### 4. Monitoring and Alerts

Set up workflow monitoring:

```yaml
    - name: Notify on failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        channel: '#alerts'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 5. Production Best Practices

- **Rate Limiting**: GitHub Actions has usage limits; monitor your consumption
- **Error Handling**: Use `continue-on-error: true` for non-critical steps
- **Caching**: Cache dependencies and browser installations
- **Secrets Management**: Never commit secrets; use GitHub repository secrets
- **Monitoring**: Set up alerts for workflow failures
- **Timezone Considerations**: GitHub Actions runs in UTC; adjust cron schedules accordingly

### Option 3: Docker Deployment
Containerizing the application with Docker provides a consistent environment for running the monitor anywhere Docker is supported.

**A. Create a `Dockerfile`:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and supporting files
COPY src/ ./src/
COPY tsconfig.json ./
# Copy any other necessary files like .env.example if you manage env differently

# Set default command (can be overridden)
# Ensure your .env file is mounted or variables are passed at runtime
CMD ["npm", "run", "check-jobs"]
```

**B. Build the Docker Image:**
```bash
docker build -t job-monitor .
```

**C. Run the Docker Container:**
```bash
# Pass environment variables directly
docker run --rm \
  -e EMAIL_USER="your-email" \
  -e EMAIL_PASS="your-pass" \
  -e NOTIFICATION_EMAIL="your-notify-email" \
  -e BROWSERBASE_API_KEY="your-key" \
  -e BROWSERBASE_PROJECT_ID="your-id" \
  job-monitor

# Or mount an .env file (ensure paths are correct)
# docker run --rm --env-file ./.env job-monitor
```

**D. Using Docker Compose (Optional):**
For managing multi-container setups locally (e.g., if you add a database later), `docker-compose.yml` can be useful:
```yaml
# docker-compose.yml
version: '3.8'
services:
  job-monitor:
    build: .
    env_file:
      - .env # Ensure your .env file has the required variables
    restart: unless-stopped
    # For cron-like behavior within Docker, you might need a more complex setup
    # or use an external scheduler to trigger 'docker run' or 'docker-compose run'.
```

### Option 4: Other Cloud Platforms (Serverless, VMs)

*   **Serverless Functions (AWS Lambda, Google Cloud Functions, Azure Functions):**
    1.  Package your job monitoring script (e.g., `generic-job-monitor.ts` or a custom script using its logic) into a deployable unit for your chosen cloud provider.
    2.  Set environment variables in the function's configuration dashboard.
    3.  Use a cloud-specific scheduler (e.g., AWS CloudWatch Events, Google Cloud Scheduler, Azure Timer Triggers) to invoke your function on a regular basis.
    *Conceptual handler for a serverless environment:*
        ```typescript
        // Example: monitor-function-handler.ts
        import { runMonitor } from './src/generic-job-monitor'; // Adjust path as needed

        export async function handler(event?: any, context?: any) { // Signature varies by platform
          try {
            console.log("Job monitor function started.");
            await runMonitor(); // Ensure it uses environment variables set in the cloud platform
            console.log("Job monitor function completed successfully.");
            return { status: 'completed' };
          } catch (error) {
            console.error("Error running job monitor function:", error);
            return { status: 'failed', error: (error as Error).message };
          }
        }
        ```

*   **Virtual Machines (AWS EC2, Google Compute Engine, Azure VMs):**
    1.  Provision a VM on your preferred cloud provider.
    2.  Clone your repository onto the VM.
    3.  Install Node.js, npm, and project dependencies (`npm install`).
    4.  Configure your `.env` file on the VM.
    5.  Use `cron` (Linux) or Task Scheduler (Windows) inside the VM to execute your `npm run check-jobs` command at desired intervals.

### Option 5: Kubernetes (K8s)
For large-scale, resilient deployments, Kubernetes CronJobs offer a robust solution.

```yaml
# k8s/cronjob.yaml (Conceptual example)
apiVersion: batch/v1
kind: CronJob
metadata:
  name: job-monitor
spec:
  schedule: "0 */2 * * *"  # Every 2 hours
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: job-monitor
            image: your-docker-registry/job-monitor:latest # Your built Docker image
            envFrom:
            - secretRef:
                name: job-monitor-secrets # K8s secret holding your env vars
            # Alternatively, define env vars directly:
            # env:
            # - name: EMAIL_USER
            #   valueFrom:
            #     secretKeyRef:
            #       name: job-monitor-secrets
            #       key: email-user
            # ... other env vars
          restartPolicy: OnFailure
```
This setup requires an existing Kubernetes cluster and your job monitor's Docker image hosted in a container registry accessible by your K8s cluster.

## 🗄️ Database Integration (Future Enhancement)

Currently, the job monitor typically uses local JSON files for tracking seen jobs (see "Data Storage" section). Future development plans include optional integration with a PostgreSQL database for more persistent and scalable job data storage, history tracking, and advanced querying.

### Conceptual Database Schema
```sql
-- jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  company VARCHAR(100) NOT NULL,
  url VARCHAR(1000) NOT NULL UNIQUE, -- Ensures no duplicate job entries by URL
  category VARCHAR(100),
  location VARCHAR(200),
  department VARCHAR(200),
  description TEXT,                  -- For full job descriptions
  requirements TEXT,               -- Extracted requirements
  salary_range VARCHAR(100),
  remote_friendly BOOLEAN DEFAULT FALSE,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE, -- To mark if a job is still listed

  INDEX idx_company (company),
  INDEX idx_category (category),
  INDEX idx_discovered_at (discovered_at),
  INDEX idx_is_active (is_active)
);

-- (Other tables like job_alerts, notifications might be planned)
```

### Conceptual Integration Logic (`src/database/index.ts`)
```typescript
// src/database/index.ts (Conceptual - if implemented)
import { Pool } from 'pg'; // Using node-postgres (pg)
import { JobPosting } from '../types'; // Assuming JobPosting type

export class JobDatabase {
  private pool: Pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set.");
    }
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async saveJobs(jobs: JobPosting[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const job of jobs) {
        // Upsert logic: Insert if new (based on URL), or update last_seen_at if existing
        await client.query(
          `INSERT INTO jobs (title, company, url, category, location, department, description, requirements, salary_range, remote_friendly, discovered_at, last_seen_at, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, TRUE)
           ON CONFLICT (url) DO UPDATE SET
             title = EXCLUDED.title,         -- Update title in case it changes
             category = EXCLUDED.category,
             location = EXCLUDED.location,
             department = EXCLUDED.department,
             description = EXCLUDED.description,
             requirements = EXCLUDED.requirements,
             salary_range = EXCLUDED.salary_range,
             remote_friendly = EXCLUDED.remote_friendly,
             last_seen_at = CURRENT_TIMESTAMP,
             is_active = TRUE`,
          [
            job.title, job.company, job.url, job.category, job.location,
            job.department, job.description, job.requirements, job.salary, job.isRemote
          ]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // Add methods like getNewJobs, markJobsInactive, etc.
}
```
*To enable database integration (when available), you would typically set the `DATABASE_URL` environment variable (e.g., `DATABASE_URL="postgresql://user:password@host:port/database"`) and potentially a flag to activate this feature.*


## 🌐 API Server & Frontend (Future Enhancements)
Longer-term plans envision evolving this tool into a full-stack application:
*   **Backend API**: An API server (potentially using FastAPI with Python, or Express.js/NestJS with Node.js) could be developed to:
    *   Expose RESTful endpoints for managing monitored sites and configurations.
    *   Allow programmatic triggering of job monitoring tasks.
    *   Provide access to job data stored in the database.
    *   Manage user accounts and personalized job alerts.
*   **Web Frontend**: A user-friendly web interface (e.g., built with Next.js/React) could allow users to:
    *   View and filter discovered job postings.
    *   Configure monitoring preferences and set up custom alerts.
    *   View statistics and analytics about job trends.

*(These are forward-looking statements; refer to specific project roadmaps or issues for current status.)*

## 📈 Monitoring & Analytics (Future Enhancements)
As the system evolves, especially with database integration, more advanced monitoring and analytics could be added:
*   **Scraping Metrics**: Tracking the number of jobs found per site, success/failure rates, site response times.
*   **Job Trends**: Analyzing new vs. existing job ratios, popular categories, or skills over time.
*   **Notification Effectiveness**: Monitoring email delivery rates or user engagement with alerts (if a frontend is developed).
Metrics could be stored in the primary database or exported to dedicated monitoring services.

## 🔧 Production Environment Configuration (Comprehensive Guide)
For a robust production deployment, especially if running continuously or at scale, consider the following environment variables (some are for planned features):
```bash
# --- Core Monitoring ---
BROWSERBASE_API_KEY=your_browserbase_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id
ENABLED_SITES="xAI,OpenAI,Anthropic,Meta AI" # Comma-separated, no spaces
FETCH_JOB_DETAILS=true # Or false for faster, less detailed runs
PREFERRED_METHOD="playwright" # generic, playwright, stagehand, manual

# --- Database (if/when integrated) ---
# DATABASE_URL=postgresql://user:pass@host:5432/jobhunter
# REDIS_URL=redis://localhost:6379 # For caching or queueing

# --- Email Notifications ---
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
NOTIFICATION_EMAIL=recipient@email.com
# EMAIL_SERVICE=Gmail # Optional, if configurable

# --- Operational ---
LOG_LEVEL=info # debug, info, warn, error
MONITORING_INTERVAL_MINUTES=60 # For continuous mode scripts
# SENTRY_DSN= # For error tracking platforms

# --- API (if/when an API server is built) ---
# API_PORT=8000
# API_HOST=0.0.0.0
# CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com

# --- Feature Flags (example for future features) ---
# ENABLE_WEBHOOKS=false
# ENABLE_SLACK_NOTIFICATIONS=false
```

## 🏗️ Scalability & Infrastructure
Consider these recommendations as your monitoring needs grow:

*   **Small Scale (e.g., personal use, < 1000 jobs processed/day):**
    *   **Compute**: GitHub Actions (scheduled), simple cron on a local machine/VPS, or basic serverless functions (e.g., AWS Lambda free tier).
    *   **Database (if used)**: Managed PostgreSQL instances on platforms like Railway, Render, or Heroku Postgres.
*   **Medium Scale (e.g., team use, 1k-10k jobs/day):**
    *   **Compute**: Docker containers on AWS ECS/Fargate, Google Cloud Run, or Azure Container Instances. Scheduled tasks on these platforms.
    *   **Database**: Managed relational databases like AWS RDS, Google Cloud SQL, or Azure Database for PostgreSQL.
    *   **Queuing (optional)**: For distributing scraping tasks, consider AWS SQS, Google Pub/Sub, or Redis.
*   **Large Scale (e.g., extensive commercial use, 10k+ jobs/day):**
    *   **Compute**: Kubernetes cluster (EKS, GKE, AKS) for orchestration and scaling of scraper workers.
    *   **Database**: Scaled PostgreSQL with read replicas, potentially sharding.
    *   **Message Broker**: Robust systems like RabbitMQ or Kafka for task queuing and inter-service communication.
    *   **Caching**: Redis or Memcached for frequently accessed data or API response caching.
    *   **CDN**: For any frontend components, use a CDN like Cloudflare or AWS CloudFront.
    *   **Observability**: Comprehensive logging, monitoring, and alerting stack (e.g., Prometheus, Grafana, ELK stack, Sentry).

## 🔄 CI/CD Pipeline (Best Practices)
Automating testing and deployment is crucial for maintaining a reliable job monitor. A CI/CD pipeline (e.g., using GitHub Actions, GitLab CI, Jenkins) should typically include:

1.  **Linting**: Automatically check code style and quality (e.g., using ESLint, Prettier).
    *   `npm run lint`
2.  **Type Checking**: Ensure TypeScript code is type-safe.
    *   `npm run type-check` (often `tsc --noEmit`)
3.  **Unit & Integration Tests**: Run automated tests to verify individual components and their interactions.
    *   `npm test`
4.  **Build Step (if applicable)**: If your project requires a compilation step beyond what `tsx` handles at runtime for production.
    *   `npm run build`
5.  **Security Scans**: Automated checks for vulnerabilities in dependencies or code.
6.  **Deployment**: Automatically deploy the application to your chosen environment (e.g., update a Docker image in a registry, deploy a serverless function, push to a VM) after all checks pass on the main branch.

**Example GitHub Actions Workflow Snippet for CI:**
```yaml
# In your .github/workflows/main.yml or similar

# ... (trigger conditions: on push, on pull_request)

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Run linters
        run: npm run lint # Assuming you have a lint script
      - name: Run type checking
        run: npm run type-check # Assuming tsc --noEmit
      - name: Run tests
        run: npm test # Assuming you have test scripts

  # deploy-backend: # Example, if you have a backend to deploy
  #   needs: test
  #   if: github.ref == 'refs/heads/main' # Only deploy from main branch
  #   runs-on: ubuntu-latest
  #   steps:
  #     # ... steps to build and deploy
```

## 🗺️ Project Roadmap (Illustrative)

This outlines potential future directions for the project. For current plans, always check the project's official issue tracker or roadmap documents.

*   **Phase 1: Current (Advanced CLI Tool)**
    *   ✅ Multi-site monitoring with various methods (generic, playwright cloud/manual, stagehand).
    *   ✅ Intelligent job categorization.
    *   ✅ Rich HTML email notifications.
    *   ✅ Flexible configuration via `.env` files and command-line arguments.
    *   ✅ Programmatic usage options for integration into custom scripts.
    *   ✅ Local JSON file-based storage for tracking previously seen jobs.

*   **Phase 2: Database Integration & Core API (Near-Term Goals)**
    *   🔄 **Implement PostgreSQL Integration**: Allow users to optionally connect to a PostgreSQL database for robust job storage, history, and de-duplication.
    *   🔄 **Develop a Basic Backend API**: Create a simple API (e.g., using Express.js/NestJS in Node.js, or FastAPI in Python) to:
        *   Trigger job monitoring tasks.
        *   Retrieve job listings (with filtering).
        *   Manage basic alert configurations.

*   **Phase 3: Interactive Frontend Dashboard (Mid-Term Vision)**
    *   📋 **Build a Web Interface**: Develop a frontend application (e.g., using Next.js, React, Vue, or Svelte) to:
        *   Display job listings in a user-friendly, searchable, and filterable format.
        *   Allow users to manage monitored sites and notification preferences through a UI.
        *   Provide a simple dashboard with basic job statistics.

*   **Phase 4: Advanced Features & User Personalization (Long-Term Vision)**
    *   🔐 **User Accounts & Authentication**: Allow users to sign up and have personalized monitoring settings and alerts.
    *   📝 **Job Application Tracking**: Basic features to help users track jobs they've applied for or are interested in.
    *   🤖 **AI-Powered Enhancements**: Explore ML for smarter categorization, resume-job matching, or highlighting relevant job details.
    *   📊 **Deeper Analytics**: Provide more insights into job market trends, skills in demand, etc.

*   **Phase 5: Community & Enterprise Capabilities (Extended Vision)**
    *   🏢 **Multi-Tenant Options**: For supporting separate user groups or organizations.
    *   🔌 **Webhook & Integration Support**: Send notifications to Slack, Discord, or other platforms via webhooks.
    *   📈 **Advanced Reporting & Analytics**: Customizable reports for power users or businesses.
    *   🛠️ **API Enhancements**: More comprehensive API with rate limiting, developer keys, etc.
    *   🌍 **Localization & Internationalization**.

## 🔒 Security & Privacy

- **Email Security**: Uses App Passwords, not regular credentials
- **Environment Variables**: Sensitive data stored securely in `.env`
- **Rate Limiting**: Built-in delays between requests to be respectful
- **No Data Storage**: Only job titles stored for new job detection
- **GDPR Compliant**: No personal data collection

### Best Practices

- Use dedicated email accounts for notifications
- Rotate API keys regularly
- Monitor for rate limiting and adjust delays
- Use secure secret management in production

## 📄 License

This project is licensed under the MIT License - see the [docs/LICENSE](docs/LICENSE) file for details.

## 🙏 Acknowledgments

- **Playwright** - Reliable browser automation
- **Browserbase** - Cloud browser infrastructure  
- **Stagehand** - AI-powered web scraping
- **TypeScript** - Type-safe development
- **The Open Source Community** - For inspiration and tools

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/retrospct/hunter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/retrospct/hunter/discussions)
- **Email**: (Consider setting up a dedicated email for support or using GitHub Discussions/Issues)

## 🗺 Roadmap

- [ ] Web UI for configuration and monitoring
- [ ] Database integration for job history
- [ ] Slack/Discord notification support
- [ ] Machine learning for better job categorization
- [ ] Mobile app for notifications
- [ ] Integration with job boards APIs
- [ ] Custom filtering and search capabilities

---

**⭐ Star this repository if you find it useful!**
