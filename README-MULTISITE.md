# Multi-Site Job Monitor with Stagehand

The enhanced `stagehand-monitor.ts` now supports monitoring multiple career websites simultaneously, making it much more powerful than the original xAI-only version.

## Key Features

### 🌐 Multi-Site Support
- **xAI**: AI research and development roles
- **OpenAI**: AI research and product development
- **Anthropic**: AI safety and research positions  
- **Meta AI**: AI/ML roles at Meta
- Easily extensible to add more sites

### 🎯 Smart Job Categorization
- AI & Research
- Software Engineering
- Infrastructure & DevOps
- Management & Leadership
- Product & Design
- Data Science & Analytics
- Security
- Sales & Marketing
- Operations

### 📧 Enhanced Email Notifications
- Grouped by company and category
- Location and department information
- Optional detailed job descriptions
- Professional formatting

### ⚙️ Flexible Configuration
- Monitor all sites or specific ones
- Environment variable configuration
- Preset configurations for common use cases
- Continuous monitoring support

## Quick Start

### Environment Setup
```bash
# Required environment variables
export BROWSERBASE_API_KEY="your-browserbase-key"
export BROWSERBASE_PROJECT_ID="your-project-id"
export EMAIL_USER="your-gmail@gmail.com"
export EMAIL_PASS="your-app-password"
export NOTIFICATION_EMAIL="recipient@email.com"

# Optional configuration
export ENABLED_SITES="xAI,OpenAI,Anthropic"  # Comma-separated list
export FETCH_JOB_DETAILS="true"              # Enable detailed extraction
```

### Basic Usage

#### Monitor All Configured Sites
```bash
npm run monitor-all
```

#### Monitor Specific Sites
```bash
npm run monitor-ai  # Only AI companies (xAI, OpenAI, Anthropic)
```

#### Monitor with Detailed Job Extraction
```bash
npm run monitor-with-details
```

### Programmatic Usage

#### Basic Multi-Site Monitoring
```typescript
import { MultiSiteJobMonitorStagehand } from './src/stagehand-monitor';

// Monitor all configured sites
const monitor = new MultiSiteJobMonitorStagehand();
await monitor.run();

// Monitor specific sites
const specificMonitor = new MultiSiteJobMonitorStagehand(['xAI', 'OpenAI']);
await specificMonitor.run();
```

#### Using Configuration Presets
```typescript
import { ConfigurableJobMonitor, presetConfigs } from './src/stagehand-config';

// AI companies with detailed extraction
const aiMonitor = new ConfigurableJobMonitor(presetConfigs.aiCompanies);
await aiMonitor.runOnce();

// Continuous monitoring
const continuousMonitor = new ConfigurableJobMonitor({
  enabledSites: ['xAI', 'Anthropic'],
  fetchJobDetails: true,
  intervalMinutes: 30
});
await continuousMonitor.runContinuous();
```

#### Custom Configuration
```typescript
import { ConfigurableJobMonitor } from './src/stagehand-config';

const customMonitor = new ConfigurableJobMonitor({
  enabledSites: ['OpenAI', 'Meta AI'],
  fetchJobDetails: false,
  intervalMinutes: 45
});

await customMonitor.runOnce();
```

## Configuration Options

### Available Sites
The system supports these career sites out of the box:
- `xAI` - https://job-boards.greenhouse.io/xai
- `OpenAI` - https://openai.com/careers  
- `Anthropic` - https://www.anthropic.com/careers
- `Meta AI` - https://www.metacareers.com/jobs

### Preset Configurations

#### AI Companies Focus
```typescript
presetConfigs.aiCompanies = {
  enabledSites: ['xAI', 'OpenAI', 'Anthropic'],
  fetchJobDetails: true,
  intervalMinutes: 30
}
```

#### Big Tech Companies
```typescript
presetConfigs.bigTech = {
  enabledSites: ['Meta AI', 'xAI'],
  fetchJobDetails: false,
  intervalMinutes: 60
}
```

#### Comprehensive Monitoring
```typescript
presetConfigs.comprehensive = {
  enabledSites: undefined, // All sites
  fetchJobDetails: true,
  intervalMinutes: 60
}
```

#### Quick Monitoring
```typescript
presetConfigs.quick = {
  enabledSites: undefined, // All sites
  fetchJobDetails: false,
  intervalMinutes: 30
}
```

## Examples

Run the examples to see different usage patterns:

```bash
# Basic usage - monitor all sites
npm run example 1

# Monitor specific sites only
npm run example 2

# Use configuration presets
npm run example 3

# Continuous monitoring
npm run example 4

# Environment-based configuration
npm run example 5
```

## Data Storage

The system stores job data in the `./jobs-data/` directory:
- `xai-jobs-stagehand.json` - xAI job titles
- `openai-jobs-stagehand.json` - OpenAI job titles  
- `anthropic-jobs-stagehand.json` - Anthropic job titles
- `meta ai-jobs-stagehand.json` - Meta AI job titles

This allows tracking new vs. existing jobs across monitoring sessions.

## Email Notifications

### Sample Email Format
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
```

## Error Handling

The system includes robust error handling:
- **Site Failures**: If one site fails, others continue processing
- **Network Issues**: Graceful degradation and retry logic
- **Data Extraction**: Fallback for when AI extraction fails
- **Email Delivery**: Clear error reporting for notification failures

## Adding New Sites

To add a new career site:

1. Add the configuration to `src/job-sites.config.ts`:
```typescript
{
  name: 'NewCompany',
  url: 'https://newcompany.com/careers',
  selectors: {
    jobList: '.job-listing',
    jobTitle: '.title',
    jobUrl: 'a',
    location: '.location',
    department: '.department'
  },
  categoryKeywords: {
    'AI & Research': ['ai', 'machine learning', 'research'],
    // ... other categories
  },
  urlPrefix: 'https://newcompany.com' // if needed for relative URLs
}
```

2. Update the enabled sites list or use environment variables:
```bash
export ENABLED_SITES="xAI,OpenAI,NewCompany"
```

## Performance Considerations

- **Rate Limiting**: 2-second delays between site requests
- **Selective Monitoring**: Choose specific sites vs. all sites
- **Detail Extraction**: Optional detailed job extraction (slower but more informative)
- **Parallel Processing**: Jobs within a site are processed efficiently

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required variables are set
2. **Browserbase Limits**: Check your Browserbase usage and limits
3. **Email Authentication**: Use Gmail app passwords, not regular passwords
4. **Site Changes**: Career sites may update their structure

### Debug Mode

Enable detailed logging:
```bash
DEBUG=true npm run monitor-all
```

### Monitoring Logs

The system provides detailed logging:
- `🔍` Site scraping status
- `✅` Successful job extraction
- `❌` Error conditions
- `🎯` New job discoveries
- `📧` Email notification status

## Migration from Single-Site

If upgrading from the original xAI-only version:

1. **Data Migration**: Old job files will be automatically migrated
2. **Environment Variables**: Same variables, just add new optional ones
3. **API Compatibility**: The main `run()` method works the same way
4. **Selective Monitoring**: Use `['xAI']` to maintain old behavior

## Deployment Options

### 🚀 Local Development
```bash
# Clone and setup
git clone <repository>
cd hunt
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your credentials

# Run monitoring
npm run monitor-all
```

### ☁️ Cloud Deployment

#### Option 1: Simple Cron-based Deployment
Deploy as a scheduled job on any cloud provider:

**Railway/Render/Heroku:**
```bash
# Deploy with built-in cron scheduler
# Add environment variables in dashboard
# Set up daily/hourly monitoring schedule
```

**Vercel/Netlify (Functions):**
```typescript
// api/monitor-jobs.ts
import { MultiSiteJobMonitorStagehand } from '../src/stagehand-monitor';

export default async function handler(req: Request) {
  const monitor = new MultiSiteJobMonitorStagehand();
  await monitor.run();
  return new Response(JSON.stringify({ status: 'completed' }));
}
```

#### Option 2: Containerized Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY tsconfig.json ./

RUN npm run build

CMD ["npm", "run", "monitor-all"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  job-monitor:
    build: .
    environment:
      - BROWSERBASE_API_KEY=${BROWSERBASE_API_KEY}
      - BROWSERBASE_PROJECT_ID=${BROWSERBASE_PROJECT_ID}
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASS=${EMAIL_PASS}
      - NOTIFICATION_EMAIL=${NOTIFICATION_EMAIL}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=jobhunter
      - POSTGRES_USER=jobhunter
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

#### Option 3: Kubernetes Deployment
```yaml
# k8s/cronjob.yaml
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
            image: your-registry/job-monitor:latest
            env:
            - name: BROWSERBASE_API_KEY
              valueFrom:
                secretKeyRef:
                  name: job-monitor-secrets
                  key: browserbase-api-key
            # ... other env vars
          restartPolicy: OnFailure
```

### 🗄️ Database Integration (Planned)

#### Database Schema Design
```sql
-- jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  company VARCHAR(100) NOT NULL,
  url VARCHAR(1000) NOT NULL UNIQUE,
  category VARCHAR(100),
  location VARCHAR(200),
  department VARCHAR(200),
  description TEXT,
  requirements TEXT,
  salary_range VARCHAR(100),
  remote_friendly BOOLEAN DEFAULT FALSE,
  discovered_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  INDEX idx_company (company),
  INDEX idx_category (category),
  INDEX idx_discovered_at (discovered_at),
  INDEX idx_active (is_active)
);

-- job_alerts table
CREATE TABLE job_alerts (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  companies TEXT[], -- Array of company names
  categories TEXT[], -- Array of categories
  keywords TEXT[], -- Array of keywords
  location_preferences TEXT[],
  remote_only BOOLEAN DEFAULT FALSE,
  salary_min INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id),
  user_email VARCHAR(255),
  sent_at TIMESTAMP DEFAULT NOW(),
  notification_type VARCHAR(50) -- 'email', 'webhook', 'slack'
);
```

#### Database Integration Code
```typescript
// src/database/index.ts
import { Pool } from 'pg';
import { JobPosting } from '../types';

export class JobDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async saveJobs(jobs: JobPosting[]): Promise<void> {
    const client = await this.pool.connect();
    try {
      for (const job of jobs) {
        await client.query(
          `INSERT INTO jobs (title, company, url, category, location, department, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (url) DO UPDATE SET
           last_seen_at = NOW(), is_active = TRUE`,
          [job.title, job.company, job.url, job.category, job.location, job.department, job.description]
        );
      }
    } finally {
      client.release();
    }
  }

  async getNewJobs(since: Date): Promise<JobPosting[]> {
    const result = await this.pool.query(
      'SELECT * FROM jobs WHERE discovered_at > $1 ORDER BY discovered_at DESC',
      [since]
    );
    return result.rows;
  }
}
```

### 🌐 API Server Architecture (Planned)

#### FastAPI Backend Structure
```
api/
├── src/
│   ├── main.py              # FastAPI app entry point
│   ├── models/
│   │   ├── job.py           # Pydantic models
│   │   └── alert.py
│   ├── routes/
│   │   ├── jobs.py          # Job endpoints
│   │   ├── alerts.py        # Alert management
│   │   └── monitoring.py    # Monitor control
│   ├── services/
│   │   ├── job_service.py   # Business logic
│   │   └── alert_service.py
│   ├── database/
│   │   ├── connection.py    # DB connection
│   │   └── migrations/
│   └── integrations/
│       └── monitor.py       # Call TS monitor
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

#### API Endpoints Design
```python
# main.py
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Job Hunter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # NextJS frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/jobs")
async def get_jobs(
    company: str = None,
    category: str = None,
    limit: int = 50,
    offset: int = 0
):
    """Get paginated job listings with filters"""
    pass

@app.post("/api/jobs/search")
async def search_jobs(search_request: JobSearchRequest):
    """Advanced job search with keywords, location, etc."""
    pass

@app.post("/api/alerts")
async def create_alert(alert: JobAlert):
    """Create a new job alert"""
    pass

@app.post("/api/monitor/run")
async def trigger_monitoring(background_tasks: BackgroundTasks):
    """Manually trigger job monitoring"""
    background_tasks.add_task(run_job_monitor)
    return {"status": "monitoring started"}

@app.get("/api/stats")
async def get_stats():
    """Get monitoring statistics and metrics"""
    pass
```

### 🎨 NextJS Frontend Architecture (Planned)

#### Project Structure
```
frontend/
├── src/
│   ├── app/                 # App Router (NextJS 13+)
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── jobs/
│   │   │   ├── page.tsx     # Job listings
│   │   │   └── [id]/page.tsx # Job details
│   │   ├── alerts/
│   │   │   └── page.tsx     # Manage alerts
│   │   └── api/             # API routes (if needed)
│   ├── components/
│   │   ├── ui/              # Shared components
│   │   ├── JobCard.tsx
│   │   ├── JobFilters.tsx
│   │   ├── AlertForm.tsx
│   │   └── Dashboard.tsx
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   ├── utils.ts
│   │   └── types.ts
│   └── hooks/
│       ├── useJobs.ts       # Custom hooks
│       └── useAlerts.ts
├── public/
├── package.json
├── tailwind.config.js
└── next.config.js
```

#### Key Frontend Features
```typescript
// components/JobCard.tsx
interface JobCardProps {
  job: JobPosting;
  onSave?: (job: JobPosting) => void;
  onApply?: (job: JobPosting) => void;
}

export function JobCard({ job, onSave, onApply }: JobCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {job.category}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        {job.location && (
          <p className="text-gray-600 flex items-center">
            <MapPinIcon className="w-4 h-4 mr-2" />
            {job.location}
          </p>
        )}
        {job.department && (
          <p className="text-gray-600 flex items-center">
            <BuildingIcon className="w-4 h-4 mr-2" />
            {job.department}
          </p>
        )}
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={() => onSave?.(job)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Save Job
        </button>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          View Details
        </a>
      </div>
    </div>
  );
}
```

### 📊 Monitoring & Analytics

#### Metrics to Track
- Jobs discovered per site per day
- New vs. existing job ratios
- Response times per site
- Email delivery success rates
- User engagement (if frontend deployed)
- Alert effectiveness

#### Monitoring Setup
```typescript
// src/monitoring/metrics.ts
export interface MonitoringMetrics {
  timestamp: Date;
  site: string;
  jobsFound: number;
  newJobs: number;
  responseTime: number;
  errors: string[];
}

export class MetricsCollector {
  async recordSiteMetrics(site: string, metrics: Partial<MonitoringMetrics>) {
    // Store in database or send to monitoring service
    await this.database.saveMetrics({
      timestamp: new Date(),
      site,
      ...metrics
    });
  }
}
```

### 🔧 Environment Configuration

#### Production Environment Variables
```bash
# Core monitoring
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=
ENABLED_SITES=xAI,OpenAI,Anthropic,Meta AI

# Database
DATABASE_URL=postgresql://user:pass@host:5432/jobhunter
REDIS_URL=redis://localhost:6379

# Email notifications
EMAIL_USER=
EMAIL_PASS=
NOTIFICATION_EMAIL=

# API Configuration
API_PORT=8000
API_HOST=0.0.0.0
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Monitoring
LOG_LEVEL=info
MONITORING_INTERVAL_MINUTES=60
ENABLE_METRICS=true
SENTRY_DSN=

# Feature flags
FETCH_JOB_DETAILS=true
ENABLE_WEBHOOKS=false
ENABLE_SLACK_NOTIFICATIONS=false
```

### 🏗️ Infrastructure Recommendations

#### Small Scale (< 1000 jobs/day)
- **Hosting**: Railway, Render, or Heroku
- **Database**: Managed PostgreSQL (Railway/Heroku Postgres)
- **Monitoring**: Simple cron job
- **Frontend**: Vercel or Netlify

#### Medium Scale (1000-10000 jobs/day)  
- **Hosting**: AWS ECS, Google Cloud Run, or Azure Container Instances
- **Database**: AWS RDS, Google Cloud SQL, or Azure Database
- **Queue**: Redis or AWS SQS for background jobs
- **Monitoring**: CloudWatch, Datadog, or New Relic

#### Large Scale (10000+ jobs/day)
- **Hosting**: Kubernetes cluster (EKS, GKE, AKS)
- **Database**: Managed PostgreSQL with read replicas
- **Queue**: Redis Cluster or message broker (RabbitMQ/Kafka)
- **Caching**: Redis for API responses
- **CDN**: CloudFront, CloudFlare
- **Monitoring**: Full observability stack (Prometheus, Grafana, ELK)

### 🔄 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Job Monitor

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run type-check

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Build and push Docker image
          # Deploy to container registry
          # Update production deployment

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy NextJS app
        run: |
          # Build frontend
          # Deploy to Vercel/Netlify
```

## Future Architecture Roadmap

### Phase 1: Current (CLI Tool)
- ✅ Multi-site monitoring
- ✅ Email notifications
- ✅ JSON file storage

### Phase 2: Database & API (Next)
- 🔄 PostgreSQL integration
- 🔄 FastAPI backend
- 🔄 RESTful API endpoints
- 🔄 Advanced job search

### Phase 3: Frontend Dashboard
- 📋 NextJS frontend
- 📋 Job listings and filtering
- 📋 Alert management UI
- 📋 Analytics dashboard

### Phase 4: Advanced Features
- 📋 User authentication
- 📋 Job application tracking
- 📋 Resume matching
- 📋 Salary insights
- 📋 Company ratings
- 📋 Interview scheduling

### Phase 5: Enterprise Features
- 📋 Multi-tenant support
- 📋 Advanced analytics
- 📋 API rate limiting
- 📋 Webhook integrations
- 📋 Slack/Teams notifications
- 📋 Custom job board creation
