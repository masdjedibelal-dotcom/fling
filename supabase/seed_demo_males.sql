-- Fling · Demo-Männer für Schaufenster (Supabase SQL Editor)
-- Ergebnis: 12 sichtbare Profile im Radius (5 bestehende + 7 neue; Paul/Max ausgeschlossen)
--
-- Voraussetzungen: Migrationen 001–008 ausgeführt, PostGIS aktiv.
-- Ausführen als: SQL Editor (Service-Role / postgres).
--
-- Danach: Eingeloggte Frau mit verification_status = 'approved',
-- Standort ~ Berlin (52.52, 13.405), dann get_schaufenster zeigt diese Profile.
--
-- Mock im Code entfällt, wenn EXPO_PUBLIC_SUPABASE_* gesetzt ist und RPC keinen Fehler wirft.

-- In Supabase liegt pgcrypto im Schema "extensions"
create extension if not exists pgcrypto with schema extensions;

-- ─── Optional: alte Seed-User entfernen ─────────────────────────────────────
delete from public.users where id in (
  'a1000001-0001-4000-8000-000000000001',
  'a1000002-0002-4000-8000-000000000002',
  'a1000003-0003-4000-8000-000000000003',
  'a1000004-0004-4000-8000-000000000004',
  'a1000005-0005-4000-8000-000000000005',
  'a1000006-0006-4000-8000-000000000006',
  'a1000007-0007-4000-8000-000000000007',
  'a1000008-0008-4000-8000-000000000008',
  'a1000009-0009-4000-8000-000000000009',
  'a1000010-0010-4000-8000-000000000010',
  'a1000011-0011-4000-8000-000000000011',
  'a1000012-0012-4000-8000-000000000012',
  'a1000013-0013-4000-8000-000000000013',
  'a1000014-0014-4000-8000-000000000014'
);
delete from auth.identities where user_id in (
  'a1000001-0001-4000-8000-000000000001',
  'a1000002-0002-4000-8000-000000000002',
  'a1000003-0003-4000-8000-000000000003',
  'a1000004-0004-4000-8000-000000000004',
  'a1000005-0005-4000-8000-000000000005',
  'a1000006-0006-4000-8000-000000000006',
  'a1000007-0007-4000-8000-000000000007',
  'a1000008-0008-4000-8000-000000000008',
  'a1000009-0009-4000-8000-000000000009',
  'a1000010-0010-4000-8000-000000000010',
  'a1000011-0011-4000-8000-000000000011',
  'a1000012-0012-4000-8000-000000000012',
  'a1000013-0013-4000-8000-000000000013',
  'a1000014-0014-4000-8000-000000000014'
);
delete from auth.users where id in (
  'a1000001-0001-4000-8000-000000000001',
  'a1000002-0002-4000-8000-000000000002',
  'a1000003-0003-4000-8000-000000000003',
  'a1000004-0004-4000-8000-000000000004',
  'a1000005-0005-4000-8000-000000000005',
  'a1000006-0006-4000-8000-000000000006',
  'a1000007-0007-4000-8000-000000000007',
  'a1000008-0008-4000-8000-000000000008',
  'a1000009-0009-4000-8000-000000000009',
  'a1000010-0010-4000-8000-000000000010',
  'a1000011-0011-4000-8000-000000000011',
  'a1000012-0012-4000-8000-000000000012',
  'a1000013-0013-4000-8000-000000000013',
  'a1000014-0014-4000-8000-000000000014'
);

-- ─── Hilfsfunktion: Auth-User + public.users (Mann) ───────────────────────────
create or replace function public.seed_demo_male(
  p_id uuid,
  p_email text,
  p_phone text,
  p_display_name text,
  p_birth_date date,
  p_job text,
  p_bio text,
  p_photos text[],
  p_interest_tags text[],
  p_availability text,
  p_lat double precision,
  p_lng double precision,
  p_last_seen_minutes int default 5
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_instance uuid;
  v_password_hash text;
begin
  v_password_hash := extensions.crypt('FlingSeed2026!', extensions.gen_salt('bf'::text));
  select id into v_instance from auth.instances limit 1;
  if v_instance is null then
    v_instance := '00000000-0000-0000-0000-000000000000';
  end if;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    v_instance,
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    v_password_hash,
    now(),
    p_phone,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('gender', 'male', 'seed', true),
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();

  insert into auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    p_id::text,
    p_id,
    jsonb_build_object('sub', p_id::text, 'email', p_email),
    'email',
    now(),
    now(),
    now()
  )
  on conflict (provider_id, provider) do update set
    identity_data = excluded.identity_data,
    updated_at = now();

  insert into public.users (
    id,
    phone,
    gender,
    birth_date,
    verification_status,
    account_status,
    terms_accepted_at,
    privacy_accepted_at,
    marketing_opt_in,
    display_name,
    handle,
    photos,
    primary_photo_idx,
    job,
    bio,
    interest_tags,
    city,
    location_mode,
    availability,
    latitude,
    longitude,
    search_radius_km,
    verified_at,
    last_seen_at
  ) values (
    p_id,
    p_phone,
    'male',
    p_birth_date,
    'approved',
    'active',
    now(),
    now(),
    false,
    p_display_name,
    lower(replace(p_display_name, ' ', '')) || '_seed',
    p_photos,
    0,
    p_job,
    p_bio,
    p_interest_tags,
    'Berlin',
    'fixed',
    p_availability,
    p_lat,
    p_lng,
    10,
    now(),
    now() - (p_last_seen_minutes || ' minutes')::interval
  )
  on conflict (id) do update set
    phone = excluded.phone,
    display_name = excluded.display_name,
    handle = excluded.handle,
    photos = excluded.photos,
    job = excluded.job,
    bio = excluded.bio,
    interest_tags = excluded.interest_tags,
    availability = excluded.availability,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    verification_status = 'approved',
    account_status = 'active',
    verified_at = now(),
    last_seen_at = excluded.last_seen_at,
    updated_at = now();
end;
$$;

-- Referenzpunkt Auswahl: Berlin Mitte (52.520008, 13.404954)
-- Koordinaten ≈ Entfernung zum Zentrum

select public.seed_demo_male(
  'a1000001-0001-4000-8000-000000000001',
  'seed-leon@fling.local',
  '+491511000001',
  'Leon',
  '1994-06-15',
  'Architekt',
  'Design, gute Gespräche, spontane Pläne.',
  array['https://i.pravatar.cc/600?img=12', 'https://i.pravatar.cc/600?img=13'],
  array['Architektur', 'Kunst', 'Reisen'],
  'now',
  52.522700, 13.404954,
  2
);

select public.seed_demo_male(
  'a1000002-0002-4000-8000-000000000002',
  'seed-felix@fling.local',
  '+491511000002',
  'Felix',
  '1998-03-22',
  'Product Designer',
  'Kaffee, Museen, Abendessen ohne Smalltalk.',
  array['https://i.pravatar.cc/600?img=32', 'https://i.pravatar.cc/600?img=33'],
  array['Design', 'Wein', 'Kino'],
  'now',
  52.520008, 13.420000,
  5
);

select public.seed_demo_male(
  'a1000003-0003-4000-8000-000000000003',
  'seed-jonas@fling.local',
  '+491511000003',
  'Jonas',
  '1991-11-08',
  'Consultant',
  'Sport morgens, entspannt abends.',
  array['https://i.pravatar.cc/600?img=51'],
  array['Sport', 'Fitness'],
  'today',
  52.545200, 13.404954,
  12
);

select public.seed_demo_male(
  'a1000004-0004-4000-8000-000000000004',
  'seed-noah@fling.local',
  '+491511000004',
  'Noah',
  '1996-01-30',
  'Fotograf',
  'Licht, Städte, ehrliche Gespräche.',
  array['https://i.pravatar.cc/600?img=22', 'https://i.pravatar.cc/600?img=68'],
  array['Fotografie', 'Reisen'],
  'now',
  52.527200, 13.412000,
  8
);

select public.seed_demo_male(
  'a1000005-0005-4000-8000-000000000005',
  'seed-tim@fling.local',
  '+491511000005',
  'Tim',
  '1999-07-12',
  'Developer',
  'Tech by day, Weinbars by night.',
  array['https://i.pravatar.cc/600?img=20'],
  array['Gaming', 'Musik', 'Wein'],
  'now',
  52.533500, 13.398000,
  3
);

-- Paul: ~11,5 km — erscheint NICHT in get_schaufenster (Radius max. 10 km)
select public.seed_demo_male(
  'a1000006-0006-4000-8000-000000000006',
  'seed-paul@fling.local',
  '+491511000006',
  'Paul',
  '1995-09-03',
  'Anwalt',
  'Außerhalb deines Radius.',
  array['https://i.pravatar.cc/600?img=60'],
  array['Reisen'],
  'now',
  52.623000, 13.404954,
  1
);

select public.seed_demo_male(
  'a1000008-0008-4000-8000-000000000008',
  'seed-lukas@fling.local',
  '+491511000008',
  'Lukas',
  '1997-04-18',
  'Marketing',
  'Spontan, direkt, ohne Spielchen.',
  array['https://i.pravatar.cc/600?img=15'],
  array['Reisen', 'Wein'],
  'now',
  52.518500, 13.408000,
  14
);

select public.seed_demo_male(
  'a1000009-0009-4000-8000-000000000009',
  'seed-ben@fling.local',
  '+491511000009',
  'Ben',
  '1992-08-25',
  'Arzt',
  'Nachtschicht, tagsüber frei.',
  array['https://i.pravatar.cc/600?img=25'],
  array['Sport', 'Kochen'],
  'now',
  52.531000, 13.415000,
  2
);

select public.seed_demo_male(
  'a1000010-0010-4000-8000-000000000010',
  'seed-elias@fling.local',
  '+491511000010',
  'Elias',
  '1997-02-14',
  'Barista',
  'Kaffee und gute Gespräche.',
  array['https://i.pravatar.cc/600?img=47'],
  array['Kaffee', 'Musik'],
  'today',
  52.538000, 13.390000,
  45
);

select public.seed_demo_male(
  'a1000011-0011-4000-8000-000000000011',
  'seed-moritz@fling.local',
  '+491511000011',
  'Moritz',
  '1994-10-30',
  'Ingenieur',
  'Klettern, Craft Beer, ehrlich.',
  array['https://i.pravatar.cc/600?img=58'],
  array['Sport', 'Reisen'],
  'now',
  52.512000, 13.425000,
  6
);

select public.seed_demo_male(
  'a1000012-0012-4000-8000-000000000012',
  'seed-david@fling.local',
  '+491511000012',
  'David',
  '1995-05-09',
  'Journalist',
  'Geschichten, Bars, Mitternacht.',
  array['https://i.pravatar.cc/600?img=61'],
  array['Kultur', 'Wein'],
  'now',
  52.521000, 13.401000,
  1
);

select public.seed_demo_male(
  'a1000013-0013-4000-8000-000000000013',
  'seed-finn@fling.local',
  '+491511000013',
  'Finn',
  '1999-01-20',
  'Student',
  'Neugierig, offen, heute Abend Zeit.',
  array['https://i.pravatar.cc/600?img=67'],
  array['Kino', 'Gaming'],
  'today',
  52.548000, 13.410000,
  90
);

select public.seed_demo_male(
  'a1000014-0014-4000-8000-000000000014',
  'seed-tom@fling.local',
  '+491511000014',
  'Tom',
  '1991-12-12',
  'Gründer',
  'Busy days, clear nights.',
  array['https://i.pravatar.cc/600?img=11'],
  array['Tech', 'Fitness'],
  'now',
  52.525000, 13.418000,
  4
);

-- Max: availability off — erscheint NICHT in der Auswahl
select public.seed_demo_male(
  'a1000007-0007-4000-8000-000000000007',
  'seed-max@fling.local',
  '+491511000007',
  'Max',
  '1997-12-01',
  'Musiker',
  'Pause — erscheint nicht in der Auswahl.',
  array['https://i.pravatar.cc/600?img=70'],
  array['Musik'],
  'off',
  52.515000, 13.400000,
  400
);

-- geom aus lat/lng nachziehen (Trigger greift nur bei INSERT/UPDATE der Spalten)
update public.users
set latitude = latitude
where id in (
  'a1000001-0001-4000-8000-000000000001',
  'a1000002-0002-4000-8000-000000000002',
  'a1000003-0003-4000-8000-000000000003',
  'a1000004-0004-4000-8000-000000000004',
  'a1000005-0005-4000-8000-000000000005',
  'a1000006-0006-4000-8000-000000000006',
  'a1000007-0007-4000-8000-000000000007',
  'a1000008-0008-4000-8000-000000000008',
  'a1000009-0009-4000-8000-000000000009',
  'a1000010-0010-4000-8000-000000000010',
  'a1000011-0011-4000-8000-000000000011',
  'a1000012-0012-4000-8000-000000000012',
  'a1000013-0013-4000-8000-000000000013',
  'a1000014-0014-4000-8000-000000000014'
);

-- ─── Dein Frauen-Profil: Standort setzen (UUID anpassen!) ─────────────────────
-- Nach dem Login in Supabase → Authentication → Users die User-ID kopieren:
--
-- update public.users set
--   latitude = 52.520008,
--   longitude = 13.404954,
--   city = 'Berlin',
--   verification_status = 'approved',
--   account_status = 'active',
--   verified_at = now()
-- where id = 'DEINE-FRAUEN-USER-UUID';

-- Prüfen (als eingeloggte Frau per RPC in der App oder SQL mit JWT):
-- select public.get_schaufenster(10, 'all', 52.520008, 13.404954);

-- Aufräumen (optional, Funktion behalten oder löschen):
-- drop function if exists public.seed_demo_male(uuid, text, text, text, date, text, text, text[], text[], text, double precision, double precision, int);
