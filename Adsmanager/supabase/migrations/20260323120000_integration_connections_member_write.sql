-- Allow all organization members (not only org admins) to connect Google Ads.
drop policy if exists "Org admins can upsert integration connections" on public.integration_connections;
drop policy if exists "Org admins can update integration connections" on public.integration_connections;

create policy "Members can insert org integration connections"
  on public.integration_connections for insert
  with check (public.is_member_of(organization_id));

create policy "Members can update org integration connections"
  on public.integration_connections for update
  using (public.is_member_of(organization_id))
  with check (public.is_member_of(organization_id));
