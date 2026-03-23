-- MVP: Google Ads integration connection storage (per organization)

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

create index if not exists idx_integration_connections_org on public.integration_connections(organization_id);

-- Keep updated_at in sync with existing handle_updated_at() helper.
drop trigger if exists set_updated_at on public.integration_connections;
create trigger set_updated_at before update on public.integration_connections
for each row execute function public.handle_updated_at();

