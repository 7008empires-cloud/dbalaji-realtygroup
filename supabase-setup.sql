-- Run this entire file in Supabase > SQL Editor.
-- 1) Create the properties table.
create table if not exists public.properties (
  id uuid primary key,
  title text not null,
  type text not null,
  price text,
  location text not null,
  area text,
  status text not null default 'available' check (status in ('available','sold')),
  description text,
  photos text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.properties enable row level security;

-- Public customers can only read currently available properties.
drop policy if exists "Public can view available properties" on public.properties;
create policy "Public can view available properties" on public.properties
for select to anon, authenticated using (status = 'available');

-- Admin users are explicitly allow-listed here. No public signup is needed.
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.site_admins enable row level security;

drop policy if exists "Admins can view all properties" on public.properties;
create policy "Admins can view all properties" on public.properties
for select to authenticated
using (exists (select 1 from public.site_admins a where a.user_id = auth.uid()));
drop policy if exists "Admins can read admin list" on public.site_admins;
create policy "Admins can read admin list" on public.site_admins
for select to authenticated using (user_id = auth.uid());

-- Admin-only property management. The allow-list is checked for every write.
drop policy if exists "Admins can manage properties" on public.properties;
create policy "Admins can manage properties" on public.properties
for all to authenticated
using (exists (select 1 from public.site_admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.site_admins a where a.user_id = auth.uid()));

-- Create a Storage bucket for listing photos.
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view property photos" on storage.objects;
create policy "Public can view property photos" on storage.objects
for select to anon, authenticated using (bucket_id = 'property-photos');

drop policy if exists "Admins can upload property photos" on storage.objects;
create policy "Admins can upload property photos" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'property-photos'
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
);

drop policy if exists "Admins can update property photos" on storage.objects;
create policy "Admins can update property photos" on storage.objects
for update to authenticated
using (bucket_id = 'property-photos' and exists (select 1 from public.site_admins a where a.user_id = auth.uid()))
with check (bucket_id = 'property-photos' and exists (select 1 from public.site_admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can delete property photos" on storage.objects;
create policy "Admins can delete property photos" on storage.objects
for delete to authenticated
using (bucket_id = 'property-photos' and exists (select 1 from public.site_admins a where a.user_id = auth.uid()));

-- IMPORTANT: After creating your owner user in Supabase Authentication,
-- copy that user's UUID and run this statement with the real UUID:
-- insert into public.site_admins (user_id) values ('YOUR-AUTH-USER-UUID');
