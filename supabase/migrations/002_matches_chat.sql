-- Sprint 2-5: Matches, Messages, Cooldowns, Blocks, Reports, RPCs

create type public.match_status as enum ('active', 'cancelled', 'expired');
create type public.availability as enum ('now', 'today', 'off');

alter table public.users
  add column if not exists display_name text,
  add column if not exists handle text,
  add column if not exists interest_tags text[] default '{}',
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists search_radius_km int default 5,
  add column if not exists profile_views_today int default 0,
  add column if not exists picks_count int default 0,
  add column if not exists dates_count int default 0,
  add column if not exists push_token text,
  add column if not exists suspended_until timestamptz,
  add column if not exists notification_prefs jsonb default '{"new_pick":true,"new_message":true,"warning_6h":true,"pick_expired":true,"marketing":false}'::jsonb;

alter table public.users
  alter column availability type text using availability::text;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  female_id uuid not null references public.users (id) on delete cascade,
  male_id uuid not null references public.users (id) on delete cascade,
  status public.match_status not null default 'active',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  cancelled_by uuid references public.users (id),
  cancelled_at timestamptz
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.users (id) on delete cascade,
  body text not null check (char_length(body) <= 160),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.cooldowns (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.users (id) on delete cascade,
  user_b uuid not null references public.users (id) on delete cascade,
  until_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.users (id) on delete cascade,
  blocked_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users (id) on delete cascade,
  reported_id uuid not null references public.users (id) on delete cascade,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  action text not null,
  target_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.cooldowns enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

create policy "matches_select_participant" on public.matches
  for select using (auth.uid() = female_id or auth.uid() = male_id);

create policy "messages_select_participant" on public.messages
  for select using (
    exists (
      select 1 from public.matches m
      where m.id = match_id and (m.female_id = auth.uid() or m.male_id = auth.uid())
    )
  );

create policy "messages_insert_participant" on public.messages
  for insert with check (
    sender_id = auth.uid() and exists (
      select 1 from public.matches m
      where m.id = match_id and m.status = 'active'
        and (m.female_id = auth.uid() or m.male_id = auth.uid())
    )
  );

insert into public.app_config (key, value) values
  ('min_version', '"1.0.0"'),
  ('schaufenster_active', 'true')
on conflict (key) do nothing;

-- Simplified RPC stubs (extend in production with PostGIS)
create or replace function public.get_active_match(user_id uuid)
returns jsonb language plpgsql security definer as $$
declare m public.matches%rowtype;
begin
  select * into m from public.matches
  where status = 'active' and (female_id = user_id or male_id = user_id)
  and expires_at > now() limit 1;
  if not found then return null; end if;
  return to_jsonb(m);
end;
$$;

create or replace function public.create_match(male_id uuid)
returns jsonb language plpgsql security definer as $$
declare fid uuid := auth.uid(); mid uuid; exp timestamptz;
begin
  if (select gender from public.users where id = fid) != 'female' then
    raise exception 'Nur Frauen können picken';
  end if;
  if exists (select 1 from public.matches where status='active' and (female_id=fid or male_id=fid)) then
    raise exception 'Bereits ein aktiver Pick';
  end if;
  if exists (select 1 from public.matches where status='active' and male_id=create_match.male_id) then
    raise exception 'Mann ist besetzt';
  end if;
  exp := now() + interval '24 hours';
  insert into public.matches (female_id, male_id, expires_at) values (fid, male_id, exp) returning id into mid;
  return jsonb_build_object('id', mid, 'female_id', fid, 'male_id', create_match.male_id, 'status', 'active', 'expires_at', exp);
end;
$$;

create or replace function public.cancel_match(match_id uuid)
returns void language plpgsql security definer as $$
declare m public.matches%rowtype; uid uuid := auth.uid();
begin
  select * into m from public.matches where id = match_id and status = 'active';
  if not found then raise exception 'Match nicht gefunden'; end if;
  if m.female_id != uid and m.male_id != uid then raise exception 'Nicht berechtigt'; end if;
  update public.matches set status='cancelled', cancelled_by=uid, cancelled_at=now() where id = match_id;
  update public.messages set deleted_at=now() where match_id = cancel_match.match_id;
  insert into public.cooldowns (user_a, user_b, until_at) values
    (m.female_id, m.male_id, now() + interval '24 hours'),
    (m.male_id, m.female_id, now() + interval '24 hours');
end;
$$;

create or replace function public.submit_report(reported_id uuid, reason text)
returns void language plpgsql security definer as $$
begin
  insert into public.reports (reporter_id, reported_id, reason) values (auth.uid(), reported_id, reason);
end;
$$;

create or replace function public.delete_own_account()
returns void language plpgsql security definer as $$
begin
  update public.users set account_status='deleted', display_name='Gelöscht', photos='{}' where id = auth.uid();
end;
$$;
