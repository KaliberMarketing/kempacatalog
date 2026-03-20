# Ads Operations Platform

A generic, scalable, multi-tenant advertising operations platform for managing ad structures, visibility, and budget rules across organizations, business units, departments, channels, ad accounts, and campaigns.

## Tech Stack

- **Next.js 15+** (App Router, Server Actions, Server Components)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **shadcn/ui-style** custom components
- **Supabase** (Postgres, Auth, RLS)
- **React Hook Form** + **Zod** validation
- **TanStack Table** for sortable/filterable data tables
- **Recharts** for dashboard charts

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### 2. Setup

```bash
# Install dependencies
npm install

# Copy env example and fill in your Supabase credentials
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase project URL and anon key.

### 3. Database Setup

Run the SQL files in your Supabase SQL Editor in this order:

1. `supabase/schema.sql` — creates all tables, indexes, triggers
2. `supabase/rls_policies.sql` — enables RLS and creates security policies
3. `supabase/seed.sql` — inserts demo data (generic, not company-specific)

### 4. Run

```bash
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/login`.

### 5. First User

Sign up via the login page. Then in Supabase SQL Editor, promote yourself to super_admin:

```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login/signup page
│   ├── (platform)/            # Layout with sidebar + header
│   │   ├── layout.tsx         # Platform shell
│   │   └── app/
│   │       ├── dashboard/     # KPI cards, charts, overview
│   │       ├── organizations/ # Org CRUD + detail view
│   │       ├── business-units/
│   │       ├── departments/
│   │       ├── channels/
│   │       ├── ad-accounts/
│   │       ├── campaigns/
│   │       ├── metrics/       # Campaign metrics (manual entry for MVP)
│   │       ├── rules/         # Budget rules with flexible scope
│   │       └── settings/      # Placeholder for integrations
│   └── api/auth/callback/     # Supabase auth callback
├── components/
│   ├── ui/                    # Button, Card, Badge, Dialog, Input, Select, etc.
│   └── shared/                # DataTable, PageHeader, StatusBadge, FormField, etc.
├── lib/
│   ├── supabase/              # Server + client + middleware Supabase clients
│   ├── actions/               # Server Actions per module
│   ├── validators/            # Zod schemas
│   └── utils.ts               # cn(), slugify(), formatCurrency(), calcCPA(), etc.
├── types/
│   └── database.ts            # All TypeScript interfaces
└── middleware.ts               # Auth route protection
```

## Domain Model

| Entity | Description |
|--------|-------------|
| Organizations | Top-level tenant |
| Business Units | Brands / divisions under an org |
| Departments | Functional teams under an org |
| Channels | Ad platforms (Google Ads, Meta, LinkedIn, TikTok, etc.) |
| Ad Accounts | Platform accounts linked to org + channel |
| Campaigns | Individual campaigns under ad accounts |
| Campaign Metrics | Daily performance data per campaign |
| Budget Rules | Flexible rules that can target any hierarchy level |

## Future Extension Points

The architecture is prepared for these features (marked with TODO comments):

- **API Integrations**: Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads sync
- **Automatic Campaign Import**: Pull campaigns and metrics from APIs
- **Budget Automation Engine**: Execute rules automatically (pause, adjust budgets)
- **Rule Execution Logs**: Track when rules fire and what actions are taken
- **Audit Logs**: Full change history for compliance
- **Webhook Ingestion**: Receive real-time data from ad platforms
- **Notification Center**: Email, Slack, webhook alerts
- **Team Permissions**: Per-module access control
- **Profile Management**: User settings and preferences
