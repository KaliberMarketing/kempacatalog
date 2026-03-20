-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.business_units enable row level security;
alter table public.departments enable row level security;
alter table public.channels enable row level security;
alter table public.ad_accounts enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_metrics enable row level security;
alter table public.budget_rules enable row level security;

-- Helper: get current user's profile id
create or replace function public.current_profile_id()
returns uuid as $$
  select id from public.profiles where auth_user_id = auth.uid()
$$ language sql security definer stable;

-- Helper: check if current user is super_admin
create or replace function public.is_super_admin()
returns boolean as $$
  select exists(
    select 1 from public.profiles
    where auth_user_id = auth.uid() and role = 'super_admin'
  )
$$ language sql security definer stable;

-- Helper: check membership in org (any role)
create or replace function public.is_member_of(org_id uuid)
returns boolean as $$
  select public.is_super_admin() or exists(
    select 1 from public.memberships m
    join public.profiles p on p.id = m.profile_id
    where p.auth_user_id = auth.uid() and m.organization_id = org_id
  )
$$ language sql security definer stable;

-- Helper: check if current user is org_admin for a specific org
create or replace function public.is_org_admin_of(org_id uuid)
returns boolean as $$
  select public.is_super_admin() or exists(
    select 1 from public.memberships m
    join public.profiles p on p.id = m.profile_id
    where p.auth_user_id = auth.uid()
      and m.organization_id = org_id
      and m.role = 'org_admin'
  )
$$ language sql security definer stable;

-- ============================================================
-- PROFILES
-- ============================================================
create policy "Users can view own profile"
  on public.profiles for select
  using (auth_user_id = auth.uid());

create policy "Super admins can view all profiles"
  on public.profiles for select
  using (public.is_super_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth_user_id = auth.uid());

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create policy "Super admins can do anything with orgs"
  on public.organizations for all
  using (public.is_super_admin());

create policy "Members can view their orgs"
  on public.organizations for select
  using (public.is_member_of(id));

create policy "Org admins can update their orgs"
  on public.organizations for update
  using (public.is_org_admin_of(id))
  with check (public.is_org_admin_of(id));

-- ============================================================
-- MEMBERSHIPS
-- ============================================================
create policy "Super admins manage all memberships"
  on public.memberships for all
  using (public.is_super_admin());

create policy "Users can view own memberships"
  on public.memberships for select
  using (profile_id = public.current_profile_id());

create policy "Org admins can manage memberships for their org"
  on public.memberships for insert
  with check (public.is_org_admin_of(organization_id));

create policy "Org admins can update memberships for their org"
  on public.memberships for update
  using (public.is_org_admin_of(organization_id))
  with check (public.is_org_admin_of(organization_id));

create policy "Org admins can delete memberships for their org"
  on public.memberships for delete
  using (public.is_org_admin_of(organization_id));

-- ============================================================
-- BUSINESS UNITS
-- ============================================================
create policy "Super admins manage all business units"
  on public.business_units for all
  using (public.is_super_admin());

create policy "Members can view org business units"
  on public.business_units for select
  using (public.is_member_of(organization_id));

create policy "Org admins can create business units"
  on public.business_units for insert
  with check (public.is_org_admin_of(organization_id));

create policy "Org admins can update business units"
  on public.business_units for update
  using (public.is_org_admin_of(organization_id))
  with check (public.is_org_admin_of(organization_id));

-- ============================================================
-- DEPARTMENTS
-- ============================================================
create policy "Super admins manage all departments"
  on public.departments for all
  using (public.is_super_admin());

create policy "Members can view org departments"
  on public.departments for select
  using (public.is_member_of(organization_id));

create policy "Org admins can create departments"
  on public.departments for insert
  with check (public.is_org_admin_of(organization_id));

create policy "Org admins can update departments"
  on public.departments for update
  using (public.is_org_admin_of(organization_id))
  with check (public.is_org_admin_of(organization_id));

-- ============================================================
-- CHANNELS (global, viewable by all authenticated users)
-- ============================================================
create policy "Authenticated users can view channels"
  on public.channels for select
  using (auth.uid() is not null);

create policy "Super admins manage channels"
  on public.channels for all
  using (public.is_super_admin());

-- ============================================================
-- AD ACCOUNTS
-- ============================================================
create policy "Super admins manage all ad accounts"
  on public.ad_accounts for all
  using (public.is_super_admin());

create policy "Members can view org ad accounts"
  on public.ad_accounts for select
  using (public.is_member_of(organization_id));

create policy "Org admins can create ad accounts"
  on public.ad_accounts for insert
  with check (public.is_org_admin_of(organization_id));

create policy "Org admins can update ad accounts"
  on public.ad_accounts for update
  using (public.is_org_admin_of(organization_id))
  with check (public.is_org_admin_of(organization_id));

-- ============================================================
-- CAMPAIGNS
-- ============================================================
create policy "Super admins manage all campaigns"
  on public.campaigns for all
  using (public.is_super_admin());

create policy "Members can view org campaigns"
  on public.campaigns for select
  using (public.is_member_of(organization_id));

create policy "Org admins can create campaigns"
  on public.campaigns for insert
  with check (public.is_org_admin_of(organization_id));

create policy "Org admins can update campaigns"
  on public.campaigns for update
  using (public.is_org_admin_of(organization_id))
  with check (public.is_org_admin_of(organization_id));

-- ============================================================
-- CAMPAIGN METRICS
-- ============================================================
create policy "Super admins manage all metrics"
  on public.campaign_metrics for all
  using (public.is_super_admin());

create policy "Members can view org metrics"
  on public.campaign_metrics for select
  using (
    exists(
      select 1 from public.campaigns c
      where c.id = campaign_id and public.is_member_of(c.organization_id)
    )
  );

create policy "Org admins can create metrics"
  on public.campaign_metrics for insert
  with check (
    exists(
      select 1 from public.campaigns c
      where c.id = campaign_id and public.is_org_admin_of(c.organization_id)
    )
  );

create policy "Org admins can update metrics"
  on public.campaign_metrics for update
  using (
    exists(
      select 1 from public.campaigns c
      where c.id = campaign_id and public.is_org_admin_of(c.organization_id)
    )
  );

-- ============================================================
-- BUDGET RULES
-- ============================================================
create policy "Super admins manage all budget rules"
  on public.budget_rules for all
  using (public.is_super_admin());

create policy "Members can view org budget rules"
  on public.budget_rules for select
  using (public.is_member_of(organization_id));

create policy "Org admins can create budget rules"
  on public.budget_rules for insert
  with check (public.is_org_admin_of(organization_id));

create policy "Org admins can update budget rules"
  on public.budget_rules for update
  using (public.is_org_admin_of(organization_id))
  with check (public.is_org_admin_of(organization_id));
