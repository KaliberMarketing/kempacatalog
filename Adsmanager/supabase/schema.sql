-- ============================================================
-- ADS OPERATIONS PLATFORM - DATABASE SCHEMA
-- Generic, multi-tenant, multi-org advertising operations
-- ============================================================

-- Enable UUID generation (Postgres 17 compatible)
create extension if not exists pgcrypto;

-- ============================================================
-- 1. PROFILES (linked to Supabase Auth)
-- ============================================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null default 'analyst' check (role in ('super_admin', 'org_admin', 'analyst')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_auth_user on public.profiles(auth_user_id);

-- ============================================================
-- 2. ORGANIZATIONS
-- ============================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_organizations_slug on public.organizations(slug);
create index idx_organizations_status on public.organizations(status);

-- ============================================================
-- 3. MEMBERSHIPS (profile <-> organization link)
-- ============================================================
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null default 'analyst' check (role in ('org_admin', 'analyst')),
  created_at timestamptz not null default now(),
  unique(profile_id, organization_id)
);

create index idx_memberships_profile on public.memberships(profile_id);
create index idx_memberships_org on public.memberships(organization_id);

-- ============================================================
-- 4. BUSINESS UNITS
-- ============================================================
create table public.business_units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  type text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, slug)
);

create index idx_business_units_org on public.business_units(organization_id);

-- ============================================================
-- 5. DEPARTMENTS
-- ============================================================
create table public.departments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(organization_id, slug)
);

create index idx_departments_org on public.departments(organization_id);

-- ============================================================
-- 6. CHANNELS
-- ============================================================
create table public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_channels_slug on public.channels(slug);

-- ============================================================
-- 7. AD ACCOUNTS
-- ============================================================
create table public.ad_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_unit_id uuid references public.business_units(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  channel_id uuid not null references public.channels(id) on delete restrict,
  name text not null,
  external_account_id text,
  currency text not null default 'EUR',
  timezone text not null default 'Europe/Brussels',
  status text not null default 'active' check (status in ('active', 'paused', 'disabled', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_ad_accounts_org on public.ad_accounts(organization_id);
create index idx_ad_accounts_channel on public.ad_accounts(channel_id);
create index idx_ad_accounts_bu on public.ad_accounts(business_unit_id);
create index idx_ad_accounts_dept on public.ad_accounts(department_id);

-- ============================================================
-- 8. CAMPAIGNS
-- ============================================================
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  ad_account_id uuid not null references public.ad_accounts(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_unit_id uuid references public.business_units(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  name text not null,
  external_campaign_id text,
  objective text,
  daily_budget_amount numeric(12,2),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived', 'draft')),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_campaigns_ad_account on public.campaigns(ad_account_id);
create index idx_campaigns_org on public.campaigns(organization_id);
create index idx_campaigns_status on public.campaigns(status);

-- ============================================================
-- 9. CAMPAIGN METRICS
-- ============================================================
create table public.campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  date date not null,
  spend numeric(12,2) not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  leads integer not null default 0,
  conversions integer not null default 0,
  revenue numeric(12,2),
  cpa numeric(12,2),
  roas numeric(8,4),
  created_at timestamptz not null default now(),
  unique(campaign_id, date)
);

create index idx_campaign_metrics_campaign on public.campaign_metrics(campaign_id);
create index idx_campaign_metrics_date on public.campaign_metrics(date);

-- ============================================================
-- 10. BUDGET RULES
-- ============================================================
create table public.budget_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_unit_id uuid references public.business_units(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  channel_id uuid references public.channels(id) on delete set null,
  ad_account_id uuid references public.ad_accounts(id) on delete set null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  name text not null,
  description text,
  metric_type text not null check (metric_type in ('spend', 'cpa', 'roas', 'clicks', 'conversions', 'impressions', 'leads', 'revenue')),
  operator text not null check (operator in ('>', '<', '>=', '<=', '=')),
  threshold_value numeric(12,2) not null,
  action_type text not null check (action_type in ('alert', 'pause', 'increase_budget', 'decrease_budget', 'notify')),
  action_value text,
  max_daily_change_pct numeric(5,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_budget_rules_org on public.budget_rules(organization_id);
create index idx_budget_rules_active on public.budget_rules(is_active);

-- ============================================================
-- 11. BUDGET RULE EXECUTIONS (MVP log)
-- ============================================================
create table public.budget_rule_executions (
  id uuid primary key default gen_random_uuid(),
  budget_rule_id uuid not null references public.budget_rules(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  evaluated_date date not null,
  triggered boolean not null default false,
  status text not null default 'skipped' check (status in ('success', 'skipped', 'error')),
  details jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  unique (budget_rule_id, evaluated_date)
);

create index idx_budget_rule_executions_rule
  on public.budget_rule_executions(budget_rule_id);

create index idx_budget_rule_executions_org
  on public.budget_rule_executions(organization_id);

-- ============================================================
-- 12. INTEGRATION CONNECTIONS (MVP)
-- ============================================================
create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('google_ads')),
  status text not null default 'not_connected' check (status in ('not_connected', 'connected')),

  -- OAuth tokens (MVP only). In production: encrypt at rest.
  google_access_token text,
  google_refresh_token text,
  google_token_expires_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (organization_id, provider)
);

create index idx_integration_connections_org on public.integration_connections(organization_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_updated_at before update on public.profiles for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.organizations for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.business_units for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.departments for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.channels for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.ad_accounts for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.campaigns for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.budget_rules for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.integration_connections for each row execute function public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (auth_user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'analyst'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
