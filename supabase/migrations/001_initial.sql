-- Fling · Sprint 1 Schema
-- Run in Supabase SQL Editor (EU Frankfurt)

create extension if not exists "uuid-ossp";

create type public.gender as enum ('female', 'male');
create type public.verification_status as enum (
  'none',
  'phone_pending',
  'documents_pending',
  'pending_review',
  'approved',
  'rejected'
);
create type public.account_status as enum ('active', 'suspended', 'banned', 'deleted');
create type public.rejection_reason as enum ('id_blurry', 'id_mismatch', 'selfie_unclear');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text,
  gender public.gender not null,
  birth_date date not null,
  verification_status public.verification_status not null default 'phone_pending',
  account_status public.account_status not null default 'active',
  rejection_reason public.rejection_reason,
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  marketing_opt_in boolean not null default false,
  photos text[] default '{}',
  primary_photo_idx int default 0,
  job text,
  bio text,
  availability text default 'now',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verification_queue (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'waiting',
  id_front_path text,
  selfie_path text,
  submitted_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid
);

create table public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_config (key, value) values
  ('match_duration_hours', '24'),
  ('cooldown_hours', '24'),
  ('max_photos', '5'),
  ('max_message_length', '160'),
  ('maintenance_mode', 'false'),
  ('new_registrations', 'true'),
  ('verification_required', 'true')
on conflict (key) do nothing;

alter table public.users enable row level security;
alter table public.verification_queue enable row level security;

create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

create policy "verification_queue_insert_own" on public.verification_queue
  for insert with check (auth.uid() = user_id);

create policy "verification_queue_select_own" on public.verification_queue
  for select using (auth.uid() = user_id);

-- Storage bucket: verification-docs (private) — create in Supabase Dashboard
