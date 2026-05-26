
-- ═══════════════════════════════════════════════════════════════
-- FLING SETUP: 001_initial.sql
-- ═══════════════════════════════════════════════════════════════

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


-- ═══════════════════════════════════════════════════════════════
-- FLING SETUP: 002_matches_chat.sql
-- ═══════════════════════════════════════════════════════════════

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


-- ═══════════════════════════════════════════════════════════════
-- FLING SETUP: 003_safe_pick.sql
-- ═══════════════════════════════════════════════════════════════

-- Safe Pick: diskretes Check-in, nur für Nutzerin + Admin/Team (keine Weitergabe)

create type public.safe_pick_status as enum ('active', 'completed', 'cancelled');
create type public.safe_pick_rating as enum ('good', 'bad');

create table if not exists public.safe_pick_sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  meet_at timestamptz not null,
  area_text text not null check (char_length(area_text) <= 80),
  context_note text check (context_note is null or char_length(context_note) <= 120),
  check_in_at timestamptz not null,
  status public.safe_pick_status not null default 'active',
  follow_up_rating public.safe_pick_rating,
  follow_up_note text check (follow_up_note is null or char_length(follow_up_note) <= 200),
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  unique (match_id)
);

create index if not exists safe_pick_sessions_user_idx on public.safe_pick_sessions (user_id);
create index if not exists safe_pick_sessions_status_idx on public.safe_pick_sessions (status, check_in_at);

alter table public.safe_pick_sessions enable row level security;

create policy "safe_pick_select_own" on public.safe_pick_sessions
  for select using (auth.uid() = user_id);

create policy "safe_pick_insert_female" on public.safe_pick_sessions
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.female_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy "safe_pick_update_own" on public.safe_pick_sessions
  for update using (auth.uid() = user_id);

-- Nutzerin: Session für Match
create or replace function public.get_safe_pick_for_match(p_match_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s public.safe_pick_sessions%rowtype;
begin
  select * into s from public.safe_pick_sessions
  where match_id = p_match_id and user_id = auth.uid()
  limit 1;
  if not found then return null; end if;
  return to_jsonb(s);
end;
$$;

create or replace function public.create_safe_pick(
  p_match_id uuid,
  p_meet_at timestamptz,
  p_area_text text,
  p_context_note text,
  p_check_in_delay_minutes int
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  s public.safe_pick_sessions%rowtype;
  delay int := greatest(30, least(coalesce(p_check_in_delay_minutes, 120), 360));
begin
  if (select gender from public.users where id = uid) != 'female' then
    raise exception 'Nur für Frauen';
  end if;
  if not exists (
    select 1 from public.matches m
    where m.id = p_match_id and m.female_id = uid and m.status = 'active'
  ) then
    raise exception 'Kein aktiver Pick';
  end if;
  if exists (select 1 from public.safe_pick_sessions where match_id = p_match_id) then
    raise exception 'Safe Pick bereits aktiv';
  end if;

  insert into public.safe_pick_sessions (
    match_id, user_id, meet_at, area_text, context_note, check_in_at
  ) values (
    p_match_id,
    uid,
    p_meet_at,
    trim(p_area_text),
    nullif(trim(p_context_note), ''),
    p_meet_at + (delay || ' minutes')::interval
  )
  returning * into s;

  return to_jsonb(s);
end;
$$;

create or replace function public.submit_safe_pick_followup(
  p_session_id uuid,
  p_rating public.safe_pick_rating,
  p_note text
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s public.safe_pick_sessions%rowtype;
begin
  update public.safe_pick_sessions
  set
    status = 'completed',
    follow_up_rating = p_rating,
    follow_up_note = nullif(trim(p_note), ''),
    follow_up_at = now()
  where id = p_session_id and user_id = auth.uid() and status = 'active'
  returning * into s;

  if not found then raise exception 'Session nicht gefunden'; end if;
  return to_jsonb(s);
end;
$$;

-- Admin: Service Role oder erweiterte Policy — hier nur Stub-Dokumentation
create or replace function public.admin_list_safe_picks()
returns setof public.safe_pick_sessions language sql security definer set search_path = public as $$
  select * from public.safe_pick_sessions
  order by created_at desc
  limit 200;
$$;

grant execute on function public.get_safe_pick_for_match(uuid) to authenticated;
grant execute on function public.create_safe_pick(uuid, timestamptz, text, text, int) to authenticated;
grant execute on function public.submit_safe_pick_followup(uuid, public.safe_pick_rating, text) to authenticated;


-- ═══════════════════════════════════════════════════════════════
-- FLING SETUP: 004_schema_extensions.sql
-- ═══════════════════════════════════════════════════════════════

-- Fling · Schema-Erweiterungen für Produktion
-- PostGIS, Standort, Aktivität, Verifikations-Zeitstempel

create extension if not exists postgis;

alter table public.users
  add column if not exists city text,
  add column if not exists location_mode text not null default 'fixed',
  add column if not exists last_seen_at timestamptz not null default now(),
  add column if not exists verified_at timestamptz;

create index if not exists users_gender_status_idx
  on public.users (gender, verification_status, account_status)
  where account_status = 'active';

create index if not exists users_availability_idx
  on public.users (availability)
  where gender = 'male' and account_status = 'active';

create index if not exists users_last_seen_idx
  on public.users (last_seen_at desc)
  where gender = 'male';

-- Geometrie-Spalte für schnelle Distanzabfragen
alter table public.users
  add column if not exists geom geography(point, 4326);

create or replace function public.sync_user_geom()
returns trigger language plpgsql as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.geom := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  else
    new.geom := null;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists users_sync_geom on public.users;
create trigger users_sync_geom
  before insert or update of latitude, longitude on public.users
  for each row execute function public.sync_user_geom();

-- Bestehende Koordinaten backfillen
update public.users
set geom = st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
where latitude is not null and longitude is not null and geom is null;

create index if not exists users_geom_idx on public.users using gist (geom);

-- Heartbeat: App ruft bei Start auf
create or replace function public.touch_last_seen()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.users
  set last_seen_at = now()
  where id = auth.uid();
end;
$$;

grant execute on function public.touch_last_seen() to authenticated;

insert into public.app_config (key, value) values
  ('default_radius_km', '5'),
  ('max_radius_km', '50'),
  ('auswahl_max_radius_km', '10'),
  ('auswahl_max_profiles', '12')
on conflict (key) do nothing;


-- ═══════════════════════════════════════════════════════════════
-- FLING SETUP: 005_schaufenster_rpc.sql
-- ═══════════════════════════════════════════════════════════════

-- Fling · Schaufenster, Match & Partner RPCs (PostGIS)

-- Hilfsfunktion: Alter aus birth_date
create or replace function public.user_age(birth date)
returns int language sql immutable as $$
  select extract(year from age(current_date, birth))::int;
$$;

-- Hilfsfunktion: Schaufenster-Profil als JSON
create or replace function public.build_schaufenster_profile(
  p_user public.users,
  p_ref_lat double precision,
  p_ref_lng double precision
)
returns jsonb language plpgsql stable set search_path = public as $$
declare
  dist_km double precision := 999;
  last_min int := 99999;
begin
  if p_ref_lat is not null and p_ref_lng is not null and p_user.geom is not null then
    dist_km := st_distance(
      p_user.geom,
      st_setsrid(st_makepoint(p_ref_lng, p_ref_lat), 4326)::geography
    ) / 1000.0;
  end if;

  if p_user.last_seen_at is not null then
    last_min := greatest(0, floor(extract(epoch from (now() - p_user.last_seen_at)) / 60))::int;
  end if;

  return jsonb_build_object(
    'id', p_user.id,
    'display_name', coalesce(p_user.display_name, p_user.job, 'Profil'),
    'age', public.user_age(p_user.birth_date),
    'photos', coalesce(p_user.photos, '{}'::text[]),
    'primary_photo_idx', coalesce(p_user.primary_photo_idx, 0),
    'job', coalesce(p_user.job, ''),
    'distance_km', round(dist_km::numeric, 1),
    'availability', coalesce(p_user.availability, 'off'),
    'verified_at', coalesce(p_user.verified_at, p_user.updated_at)::text,
    'bio', coalesce(p_user.bio, ''),
    'interest_tags', coalesce(p_user.interest_tags, '{}'::text[]),
    'last_seen_minutes', last_min
  );
end;
$$;

-- Auswahl-Grid: verifizierte Männer im Radius
create or replace function public.get_schaufenster(
  radius_km int default 10,
  filter text default 'all',
  user_lat double precision default null,
  user_lng double precision default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  viewer public.users%rowtype;
  ref_lat double precision;
  ref_lng double precision;
  ref_point geography;
  result jsonb;
begin
  select * into viewer from public.users where id = auth.uid();
  if not found or viewer.gender != 'female' then
    raise exception 'Nur für Frauen';
  end if;
  if viewer.verification_status != 'approved' or viewer.account_status != 'active' then
    return '[]'::jsonb;
  end if;

  ref_lat := coalesce(user_lat, viewer.latitude);
  ref_lng := coalesce(user_lng, viewer.longitude);
  if ref_lat is null or ref_lng is null then
    return '[]'::jsonb;
  end if;

  ref_point := st_setsrid(st_makepoint(ref_lng, ref_lat), 4326)::geography;

  select coalesce(jsonb_agg(prof order by
    case when (prof->>'availability') = 'now' or (prof->>'last_seen_minutes')::int <= 5 then 0 else 1 end,
    (prof->>'last_seen_minutes')::int,
    (prof->>'distance_km')::float
  ), '[]'::jsonb)
  into result
  from (
    select public.build_schaufenster_profile(u, ref_lat, ref_lng) as prof
    from public.users u
    where u.gender = 'male'
      and u.verification_status = 'approved'
      and u.account_status = 'active'
      and u.availability != 'off'
      and u.geom is not null
      and st_dwithin(u.geom, ref_point, radius_km * 1000.0)
      and not exists (
        select 1 from public.matches m
        where m.male_id = u.id and m.status = 'active' and m.expires_at > now()
      )
      and not exists (
        select 1 from public.blocks b
        where b.blocker_id = viewer.id and b.blocked_id = u.id
      )
      and not exists (
        select 1 from public.cooldowns c
        where c.user_a = viewer.id and c.user_b = u.id and c.until_at > now()
      )
      and (
        filter = 'all'
        or (filter = 'now' and u.availability = 'now')
        or (filter = 'today' and u.availability in ('now', 'today'))
      )
  ) sub;

  return result;
end;
$$;

-- Detail-Ansicht: einzelnes Profil
create or replace function public.get_schaufenster_profile(profile_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  viewer public.users%rowtype;
  target public.users%rowtype;
  ref_lat double precision;
  ref_lng double precision;
begin
  select * into viewer from public.users where id = auth.uid();
  select * into target from public.users where id = profile_id;

  if not found or target.gender != 'male' then
    return null;
  end if;
  if viewer.gender != 'female' then
    raise exception 'Nur für Frauen';
  end if;
  if target.verification_status != 'approved' or target.account_status != 'active' then
    return null;
  end if;

  ref_lat := viewer.latitude;
  ref_lng := viewer.longitude;

  return public.build_schaufenster_profile(target, ref_lat, ref_lng);
end;
$$;

-- Partner-Profil aus aktivem Match
create or replace function public.get_partner_profile(p_match_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  m public.matches%rowtype;
  viewer public.users%rowtype;
  partner public.users%rowtype;
  ref_lat double precision;
  ref_lng double precision;
begin
  select * into m from public.matches
  where id = p_match_id
    and status = 'active'
    and expires_at > now()
    and (female_id = uid or male_id = uid);

  if not found then
    return null;
  end if;

  select * into viewer from public.users where id = uid;

  if m.female_id = uid then
    select * into partner from public.users where id = m.male_id;
    ref_lat := viewer.latitude;
    ref_lng := viewer.longitude;
    return jsonb_build_object(
      'profile', public.build_schaufenster_profile(partner, ref_lat, ref_lng),
      'city', null
    );
  else
    select * into partner from public.users where id = m.female_id;
    return jsonb_build_object(
      'profile', jsonb_build_object(
        'id', partner.id,
        'display_name', coalesce(partner.display_name, 'Profil'),
        'age', public.user_age(partner.birth_date),
        'photos', coalesce(partner.photos, '{}'::text[]),
        'primary_photo_idx', coalesce(partner.primary_photo_idx, 0),
        'job', coalesce(partner.job, ''),
        'distance_km', 0,
        'availability', coalesce(partner.availability, 'off'),
        'verified_at', coalesce(partner.verified_at, partner.updated_at)::text,
        'bio', coalesce(partner.bio, ''),
        'interest_tags', coalesce(partner.interest_tags, '{}'::text[]),
        'last_seen_minutes', 0
      ),
      'city', partner.city
    );
  end if;
end;
$$;

-- Angereicherter aktiver Match
create or replace function public.get_active_match(user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  m public.matches%rowtype;
  viewer public.users%rowtype;
  male_u public.users%rowtype;
  female_u public.users%rowtype;
begin
  select * into m from public.matches
  where status = 'active'
    and expires_at > now()
    and (female_id = user_id or male_id = user_id)
  order by created_at desc
  limit 1;

  if not found then
    return null;
  end if;

  select * into viewer from public.users where id = user_id;
  select * into male_u from public.users where id = m.male_id;
  select * into female_u from public.users where id = m.female_id;

  return jsonb_build_object(
    'id', m.id,
    'female_id', m.female_id,
    'male_id', m.male_id,
    'status', m.status,
    'created_at', m.created_at,
    'expires_at', m.expires_at,
    'male_profile', public.build_schaufenster_profile(
      male_u,
      female_u.latitude,
      female_u.longitude
    ),
    'female_profile', jsonb_build_object(
      'id', female_u.id,
      'display_name', coalesce(female_u.display_name, 'Profil'),
      'age', public.user_age(female_u.birth_date),
      'photos', coalesce(female_u.photos, '{}'::text[]),
      'primary_photo_idx', coalesce(female_u.primary_photo_idx, 0),
      'job', coalesce(female_u.job, ''),
      'distance_km', 0,
      'availability', coalesce(female_u.availability, 'off'),
      'verified_at', coalesce(female_u.verified_at, female_u.updated_at)::text,
      'bio', coalesce(female_u.bio, ''),
      'interest_tags', coalesce(female_u.interest_tags, '{}'::text[]),
      'last_seen_minutes', 0
    ),
    'female_city', female_u.city,
    'female_display_name', coalesce(female_u.display_name, 'Profil')
  );
end;
$$;

-- create_match: Verifikation + Cooldown + Blocks
create or replace function public.create_match(male_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  fid uuid := auth.uid();
  female_u public.users%rowtype;
  male_u public.users%rowtype;
  mid uuid;
  exp timestamptz;
  dur_hours int := 24;
begin
  select * into female_u from public.users where id = fid;
  select * into male_u from public.users where id = create_match.male_id;

  if female_u.gender != 'female' then
    raise exception 'Nur Frauen können picken';
  end if;
  if female_u.verification_status != 'approved' then
    raise exception 'Verifikation erforderlich';
  end if;
  if male_u.verification_status != 'approved' or male_u.account_status != 'active' then
    raise exception 'Profil nicht verfügbar';
  end if;
  if male_u.availability = 'off' then
    raise exception 'Profil nicht verfügbar';
  end if;

  if exists (
    select 1 from public.matches
    where status = 'active' and expires_at > now()
      and (female_id = fid or male_id = fid)
  ) then
    raise exception 'Bereits ein aktiver Pick';
  end if;

  if exists (
    select 1 from public.matches
    where status = 'active' and expires_at > now() and male_id = create_match.male_id
  ) then
    raise exception 'Mann ist besetzt';
  end if;

  if exists (
    select 1 from public.cooldowns
    where user_a = fid and user_b = create_match.male_id and until_at > now()
  ) then
    raise exception 'Cooldown aktiv';
  end if;

  if exists (
    select 1 from public.blocks
    where blocker_id = fid and blocked_id = create_match.male_id
  ) then
    raise exception 'Profil blockiert';
  end if;

  select coalesce((value)::int, 24) into dur_hours
  from public.app_config where key = 'match_duration_hours';

  exp := now() + (dur_hours || ' hours')::interval;

  insert into public.matches (female_id, male_id, expires_at)
  values (fid, create_match.male_id, exp)
  returning id into mid;

  return jsonb_build_object(
    'id', mid,
    'female_id', fid,
    'male_id', create_match.male_id,
    'status', 'active',
    'expires_at', exp,
    'created_at', now()
  );
end;
$$;

grant execute on function public.get_schaufenster(int, text, double precision, double precision) to authenticated;
grant execute on function public.get_schaufenster_profile(uuid) to authenticated;
grant execute on function public.get_partner_profile(uuid) to authenticated;
grant execute on function public.get_active_match(uuid) to authenticated;
grant execute on function public.create_match(uuid) to authenticated;


-- ═══════════════════════════════════════════════════════════════
-- FLING SETUP: 006_admin_and_config.sql
-- ═══════════════════════════════════════════════════════════════

-- Fling · Admin RPCs, app_config Leserechte, Blocks/Reports Policies

-- Admin-Whitelist (UUIDs aus Supabase Auth → Authentication → Users)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Kein direkter Client-Zugriff — nur Service Role
create policy "admin_users_deny_all" on public.admin_users
  for all using (false);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- app_config: authentifizierte Nutzer dürfen lesen (Wartung, min_version)
alter table public.app_config enable row level security;

drop policy if exists "app_config_select_authenticated" on public.app_config;
create policy "app_config_select_authenticated" on public.app_config
  for select to authenticated using (true);

-- Blocks: Nutzer können blockieren
drop policy if exists "blocks_insert_own" on public.blocks;
create policy "blocks_insert_own" on public.blocks
  for insert to authenticated with check (blocker_id = auth.uid());

drop policy if exists "blocks_select_own" on public.blocks;
create policy "blocks_select_own" on public.blocks
  for select to authenticated using (blocker_id = auth.uid());

-- Reports: nur über RPC (submit_report), keine direkte SELECT-Policy für Nutzer

-- ─── Admin RPCs (Service Role oder Admin-JWT) ───────────────────────────────

create or replace function public.admin_assert()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.role() = 'service_role' then
    return;
  end if;
  if not public.is_admin() then
    raise exception 'Nicht berechtigt';
  end if;
end;
$$;

create or replace function public.admin_list_verification_queue()
returns setof public.verification_queue language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_assert();
  return query
    select * from public.verification_queue
    where status = 'waiting'
    order by submitted_at asc;
end;
$$;

create or replace function public.admin_decide_verification(
  p_queue_id uuid,
  p_decision text,
  p_reason public.rejection_reason default null
)
returns void language plpgsql security definer set search_path = public as $$
declare
  q public.verification_queue%rowtype;
begin
  perform public.admin_assert();

  if p_decision not in ('approved', 'rejected') then
    raise exception 'Ungültige Entscheidung';
  end if;

  select * into q from public.verification_queue where id = p_queue_id for update;
  if not found then
    raise exception 'Eintrag nicht gefunden';
  end if;

  update public.verification_queue
  set status = p_decision, decided_at = now(), decided_by = auth.uid()
  where id = p_queue_id;

  if p_decision = 'approved' then
    update public.users
    set verification_status = 'approved',
        verified_at = now(),
        rejection_reason = null,
        updated_at = now()
    where id = q.user_id;
  else
    update public.users
    set verification_status = 'rejected',
        rejection_reason = coalesce(p_reason, 'id_blurry'),
        updated_at = now()
    where id = q.user_id;
  end if;

  insert into public.admin_actions (admin_id, action, target_id, meta)
  values (
    coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'verification_' || p_decision,
    q.user_id,
    jsonb_build_object('queue_id', p_queue_id, 'reason', p_reason)
  );
end;
$$;

create or replace function public.admin_set_user_status(
  p_user_id uuid,
  p_status public.account_status,
  p_suspended_until timestamptz default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_assert();

  update public.users
  set account_status = p_status,
      suspended_until = case when p_status = 'suspended' then p_suspended_until else null end,
      updated_at = now()
  where id = p_user_id;

  insert into public.admin_actions (admin_id, action, target_id, meta)
  values (
    coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'set_status_' || p_status::text,
    p_user_id,
    jsonb_build_object('suspended_until', p_suspended_until)
  );
end;
$$;

create or replace function public.admin_list_reports()
returns setof public.reports language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_assert();
  return query
    select * from public.reports
    where status = 'open'
    order by created_at desc;
end;
$$;

create or replace function public.admin_resolve_report(p_report_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_assert();
  update public.reports set status = 'resolved' where id = p_report_id;
end;
$$;

create or replace function public.admin_update_config(p_key text, p_value jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_assert();
  insert into public.app_config (key, value, updated_at)
  values (p_key, p_value, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
end;
$$;

create or replace function public.admin_search_users(p_query text)
returns setof public.users language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_assert();
  return query
    select * from public.users
    where display_name ilike '%' || p_query || '%'
       or handle ilike '%' || p_query || '%'
       or phone ilike '%' || p_query || '%'
    order by updated_at desc
    limit 50;
end;
$$;

-- Safe Pick Admin: nur Service Role / Admin
revoke execute on function public.admin_list_safe_picks() from public;
revoke execute on function public.admin_list_safe_picks() from authenticated;

create or replace function public.admin_list_safe_picks()
returns setof public.safe_pick_sessions language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_assert();
  return query
    select * from public.safe_pick_sessions
    order by created_at desc
    limit 200;
end;
$$;

grant execute on function public.admin_list_verification_queue() to authenticated, service_role;
grant execute on function public.admin_decide_verification(uuid, text, public.rejection_reason) to authenticated, service_role;
grant execute on function public.admin_set_user_status(uuid, public.account_status, timestamptz) to authenticated, service_role;
grant execute on function public.admin_list_reports() to authenticated, service_role;
grant execute on function public.admin_resolve_report(uuid) to authenticated, service_role;
grant execute on function public.admin_update_config(text, jsonb) to authenticated, service_role;
grant execute on function public.admin_search_users(text) to authenticated, service_role;
grant execute on function public.admin_list_safe_picks() to authenticated, service_role;

-- Realtime: Tabellen für Live-Updates freigeben
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.users;


-- ═══════════════════════════════════════════════════════════════
-- FLING SETUP: 007_storage.sql
-- ═══════════════════════════════════════════════════════════════

-- Fling · Storage Buckets + RLS Policies

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'verification-docs',
    'verification-docs',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'profile-photos',
    'profile-photos',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- verification-docs: nur eigener Ordner
create policy "verification_docs_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "verification_docs_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "verification_docs_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- profile-photos: Upload + Lesen eigener Fotos; andere sehen sie via signierte URLs
create policy "profile_photos_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "profile_photos_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "profile_photos_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "profile_photos_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Signierte URLs für Schaufenster: authenticated Nutzer dürfen Profilfotos lesen
create policy "profile_photos_select_authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'profile-photos');

-- Hilfs-RPC: signierte URL für ein Foto (1h gültig)
create or replace function public.get_photo_signed_url(p_path text)
returns text language plpgsql security definer set search_path = public, storage as $$
declare
  signed_url text;
begin
  if p_path is null or p_path = '' then
    return null;
  end if;
  -- Client-seitig bevorzugt: supabase.storage.from('profile-photos').createSignedUrl()
  -- Dieser Stub dokumentiert den Pfad; echte URLs generiert die App.
  return p_path;
end;
$$;

grant execute on function public.get_photo_signed_url(text) to authenticated;


-- ═══════════════════════════════════════════════════════════════
-- FLING SETUP: 008_cron_and_triggers.sql
-- ═══════════════════════════════════════════════════════════════

-- Fling · Match-Ablauf, Push-Outbox, Auth-Trigger

-- Abgelaufene Matches automatisch schließen
create or replace function public.expire_stale_matches()
returns int language plpgsql security definer set search_path = public as $$
declare
  cnt int;
begin
  update public.matches
  set status = 'expired'
  where status = 'active' and expires_at <= now();

  get diagnostics cnt = row_count;
  return cnt;
end;
$$;

-- Push-Outbox: Edge Function liest und sendet
create table if not exists public.push_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  push_token text not null,
  title text not null,
  body text not null,
  payload jsonb default '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists push_outbox_pending_idx
  on public.push_outbox (created_at)
  where sent_at is null;

alter table public.push_outbox enable row level security;

create policy "push_outbox_deny_client" on public.push_outbox
  for all using (false);

-- Bei neuem Match: Push an Mann
create or replace function public.notify_new_match()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  token text;
  female_name text;
begin
  select coalesce(display_name, 'Jemand') into female_name
  from public.users where id = new.female_id;

  select push_token into token from public.users where id = new.male_id;

  if token is not null then
    insert into public.push_outbox (user_id, push_token, title, body, payload)
    values (
      new.male_id,
      token,
      'Neuer Pick',
      female_name || ' hat dich gewählt — 24 Stunden Chat.',
      jsonb_build_object('type', 'new_pick', 'match_id', new.id)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists matches_notify_new on public.matches;
create trigger matches_notify_new
  after insert on public.matches
  for each row execute function public.notify_new_match();

-- Bei neuer Nachricht: Push an Empfänger
create or replace function public.notify_new_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  m public.matches%rowtype;
  recipient_id uuid;
  token text;
begin
  select * into m from public.matches where id = new.match_id;
  if m.status != 'active' or m.expires_at <= now() then
    return new;
  end if;

  recipient_id := case
    when new.sender_id = m.female_id then m.male_id
    else m.female_id
  end;

  select push_token into token from public.users where id = recipient_id;

  if token is not null then
    insert into public.push_outbox (user_id, push_token, title, body, payload)
    values (
      recipient_id,
      token,
      'Neue Nachricht',
      left(new.body, 80),
      jsonb_build_object('type', 'new_message', 'match_id', new.match_id)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists messages_notify_new on public.messages;
create trigger messages_notify_new
  after insert on public.messages
  for each row execute function public.notify_new_message();

-- pg_cron Job (in Supabase Dashboard → Database → Extensions → pg_cron aktivieren):
-- select cron.schedule('expire-matches', '*/5 * * * *', $$ select public.expire_stale_matches(); $$);

-- Auth: public.users Zeile bei Signup anlegen (Phone OTP)
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, phone, gender, birth_date, verification_status)
  values (
    new.id,
    new.phone,
    'female',
    '2000-01-01',
    'phone_pending'
  )
  on conflict (id) do update set
    phone = coalesce(excluded.phone, public.users.phone),
    updated_at = now();
  return new;
end;
$$;

-- Optional: nur aktivieren wenn Phone-Auth ohne manuelles upsertUserProfile
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute function public.handle_new_auth_user();

-- Grants für bestehende RPCs
grant execute on function public.get_active_match(uuid) to authenticated;
grant execute on function public.cancel_match(uuid) to authenticated;
grant execute on function public.submit_report(uuid, text) to authenticated;
grant execute on function public.delete_own_account() to authenticated;
grant execute on function public.expire_stale_matches() to service_role;

