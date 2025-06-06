# Multi-Company Job Monitor

**Note:** This repository is a template. Remember to replace placeholders like `<YOUR_GITHUB_USERNAME_OR_ORG>` with your actual GitHub username or organization and update contact methods in `CODE_OF_CONDUCT.md` and `SECURITY.md`.

A powerful, configurable job monitoring system that scrapes multiple tech company career pages and sends intelligent email notifications for new job postings.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

## 🚀 Features

- **Multi-Company Support**: Monitor xAI, OpenAI, Anthropic, Meta AI, and more
- **Intelligent Categorization**: Automatically categorizes jobs by role (AI/Research, Engineering, Management, etc.)
- **Multiple Scraping Methods**: Supports Stagehand AI, Browserbase Cloud, and local Playwright
- **Smart Notifications**: Rich email alerts with job details, locations, and categories
- **Configurable**: Easy to add new companies and customize categories
- **Robust Error Handling**: Automatic retries, fallback mechanisms, and comprehensive logging
- **Type-Safe**: Full TypeScript implementation with strong typing

## 📋 Supported Companies

- **xAI** - Elon Musk's AI company
- **OpenAI** - ChatGPT creators  
- **Anthropic** - Claude AI developers
- **Meta AI** - Facebook's AI research division
- *Easily extensible to add more companies*

## 🛠 Installation

```bash
# Clone the repository
git clone https://github.com/<YOUR_GITHUB_USERNAME_OR_ORG>/multi-company-job-monitor.git
cd multi-company-job-monitor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

## ⚙️ Configuration

Create a `.env` file with the following variables:

```bash
# Email Configuration (Required)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
NOTIFICATION_EMAIL=recipient@example.com

# Browserbase Configuration (Required for cloud scraping)
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id

# Optional Settings
FETCH_JOB_DETAILS=false  # Set to 'true' for detailed job info (slower)
```

### Email Setup

1. **Gmail**: Use App Passwords for secure authentication
   - Go to Google Account Settings → Security → App passwords
   - Generate a new app password for this application
   
2. **Other Email Providers**: Update the service in `emailConfig`

### Browserbase Setup

1. Sign up at [Browserbase.com](https://browserbase.com)
2. Create a new project
3. Copy your API key and project ID to the `.env` file

## 🎯 Usage

### Basic Usage

```bash
# Monitor all companies with default settings
npm run check-jobs

# Use specific scraping method
npm run check-jobs-playwright
npm run check-jobs-manual

# Monitor specific companies only
npx tsx src/generic-job-monitor.ts playwright xai openai
```

### Programmatic Usage

```typescript
import { GenericJobMonitor, runMonitor } from './src/generic-job-monitor';
import { jobSites } from './src/job-sites.config';

// Basic usage
await runMonitor();

// Custom configuration
await runMonitor({
  preferredMethod: 'playwright',
  jobSites: [jobSites[0]], // Only monitor first company
  retries: 5
});

// Advanced usage
const monitor = new GenericJobMonitor({
  preferredMethod: 'manual', // Use local browser
  jobSites: jobSites.filter(site => site.name === 'xAI'),
  emailConfig: {
    service: 'gmail',
    user: 'your-email@gmail.com',
    pass: 'your-app-password',
    recipient: 'notifications@yourcompany.com'
  }
});

await monitor.run();
```

## 🏗 Architecture

```
src/
├── generic-job-monitor.ts    # Main monitoring class (recommended)
├── types.ts                  # TypeScript interfaces
├── job-sites.config.ts       # Company configurations
├── check-jobs.ts             # Legacy coordinator with fallbacks
├── stagehand-monitor.ts      # AI-powered extraction (experimental)
├── playwright-monitor.ts     # Cloud-based scraping
└── playwright-manual.ts      # Local browser scraping
```

### Scraping Methods

| Method | Technology | Pros | Cons | Use Case |
|--------|------------|------|------|----------|
| **Generic Monitor** | Configurable Playwright/Browserbase | Multi-company, flexible, reliable | - | **Recommended** |
| **Stagehand** | AI-powered extraction | Smart parsing, fewer selectors | Experimental API | Advanced users |
| **Playwright Cloud** | Browserbase + Playwright-core | Reliable, scalable | Cloud dependency | Production |
| **Manual** | Local Playwright | No external dependencies | Local resources | Development |

## 📊 Job Categories

Jobs are automatically categorized using intelligent keyword matching:

- **🤖 AI & Research**: AI engineers, researchers, ML engineers
- **🏗 Infrastructure**: DevOps, SRE, platform engineering
- **💻 Software Engineering**: Frontend, backend, full-stack developers
- **👨‍💼 Management**: Engineering managers, directors, leads
- **🔒 Security**: Cybersecurity, InfoSec roles
- **📈 Data**: Data scientists, engineers, analysts
- **🎨 Product**: Product managers, designers, UX researchers
- **📢 Sales & Marketing**: Business development, marketing roles
- **⚙️ Operations**: Program managers, operations roles

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

Rich email notifications include:

- 📊 **Summary**: Total new jobs across all companies
- 🏢 **Company Breakdown**: Jobs grouped by company and category
- 🔗 **Direct Links**: Clickable links to job postings
- 📍 **Location & Department**: When available
- 💰 **Salary Information**: If detected and detail fetching enabled
- 🏠 **Remote Work**: Remote-friendly positions highlighted

### Sample Email

```
🎯 Job Alert - 12/3/2024
Found 5 new job posting(s) across 2 companies:

🏢 xAI (3 jobs):
  📁 AI & Research (2):
    🔹 Senior ML Engineer
       🔗 https://job-boards.greenhouse.io/xai/jobs/123
       📍 San Francisco, CA
       🏢 Engineering

  📁 Software Engineering (1):
    🔹 Frontend Engineer
       🔗 https://job-boards.greenhouse.io/xai/jobs/124
       📍 Remote
       🏠 Remote-friendly

🏢 OpenAI (2 jobs):
  📁 AI & Research (2):
    🔹 Research Scientist
       🔗 https://openai.com/careers/research-scientist
       📍 San Francisco, CA

🤖 Powered by Multi-Company Job Monitor
📅 Monitoring: xAI, OpenAI, Anthropic, Meta AI
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for detailed information on how to get started, including development setup, coding standards, and our pull request process.

Key steps include:
1. Forking the repository.
2. Setting up your development environment (see `CONTRIBUTING.md` for details).
3. Creating a feature branch.
4. Making your changes, including tests if applicable.
5. Submitting a Pull Request.

Please also refer to our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🗓 Scheduling

Set up automated monitoring with cron jobs:

```bash
# Every hour during business hours (9 AM - 5 PM, Monday-Friday)
0 9-17 * * 1-5 cd /path/to/project && npm run check-jobs

# Twice daily (9 AM and 5 PM)
0 9,17 * * 1-5 cd /path/to/project && npm run check-jobs

# Every 6 hours
0 */6 * * * cd /path/to/project && npm run check-jobs
```

## 🚀 Production Deployment with GitHub Actions

For automated cloud-based monitoring, deploy using GitHub Actions:

### 1. Repository Setup

**Fork or clone** this repository

```bash
git clone https://github.com/retrospct/hunt.git
```

**Add repository secrets** in Settings → Secrets and variables → Actions:

```bash
EMAIL_USER=your_email_address@example.com
EMAIL_PASS=your_email_app_password
NOTIFICATION_EMAIL=recipient@example.com
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id
```

### 2. GitHub Actions Workflow

Create `.github/workflows/job-monitor.yml`:

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

### Alternative Deployment Options

- **AWS Lambda** with CloudWatch Events
- **Google Cloud Functions** with Cloud Scheduler
- **Azure Functions** with Timer Triggers
- **Docker** containers with cron in cloud platforms

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Playwright** - Reliable browser automation
- **Browserbase** - Cloud browser infrastructure  
- **Stagehand** - AI-powered web scraping
- **TypeScript** - Type-safe development
- **The Open Source Community** - For inspiration and tools

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/<YOUR_GITHUB_USERNAME_OR_ORG>/multi-company-job-monitor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/<YOUR_GITHUB_USERNAME_OR_ORG>/multi-company-job-monitor/discussions)
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
