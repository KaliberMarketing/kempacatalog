-- MVP: campaign daily budget + budget rule execution log

-- Add per-campaign daily budget (EUR assumed in MVP)
alter table public.campaigns
add column if not exists daily_budget_amount numeric(12,2);

-- Log each evaluated rule (idempotency via (budget_rule_id, evaluated_date))
create table if not exists public.budget_rule_executions (
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

create index if not exists idx_budget_rule_executions_rule
  on public.budget_rule_executions(budget_rule_id);

create index if not exists idx_budget_rule_executions_org
  on public.budget_rule_executions(organization_id);

