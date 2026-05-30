-- Fling · 20 Demo-Männer für Auswahl (Supabase SQL Editor)
-- Felder: Pseudonym, Name, Alter, Beruf, Stadt, bis zu 5 Medien (Fotos + video:…)
--
-- Voraussetzungen: Migrationen 001–012, PostGIS aktiv.
-- Ausführen als postgres / Service Role im SQL Editor.
--
-- Danach: Frau mit verification_status = 'approved', Standort ~ Berlin.

create extension if not exists pgcrypto with schema extensions;

-- Alte Seed-IDs (001–014 + 015–020)
do $$
declare
  ids uuid[] := array[
    'a1000001-0001-4000-8000-000000000001'::uuid,
    'a1000002-0002-4000-8000-000000000002'::uuid,
    'a1000003-0003-4000-8000-000000000003'::uuid,
    'a1000004-0004-4000-8000-000000000004'::uuid,
    'a1000005-0005-4000-8000-000000000005'::uuid,
    'a1000006-0006-4000-8000-000000000006'::uuid,
    'a1000007-0007-4000-8000-000000000007'::uuid,
    'a1000008-0008-4000-8000-000000000008'::uuid,
    'a1000009-0009-4000-8000-000000000009'::uuid,
    'a1000010-0010-4000-8000-000000000010'::uuid,
    'a1000011-0011-4000-8000-000000000011'::uuid,
    'a1000012-0012-4000-8000-000000000012'::uuid,
    'a1000013-0013-4000-8000-000000000013'::uuid,
    'a1000014-0014-4000-8000-000000000014'::uuid,
    'a1000015-0015-4000-8000-000000000015'::uuid,
    'a1000016-0016-4000-8000-000000000016'::uuid,
    'a1000017-0017-4000-8000-000000000017'::uuid,
    'a1000018-0018-4000-8000-000000000018'::uuid,
    'a1000019-0019-4000-8000-000000000019'::uuid,
    'a1000020-0020-4000-8000-000000000020'::uuid
  ];
  uid uuid;
begin
  foreach uid in array ids loop
    delete from public.users where id = uid;
    delete from auth.identities where user_id = uid;
    delete from auth.users where id = uid;
  end loop;
end $$;

-- Kurzvideos: Prefix video: (max. 3s in der App)
-- Mixkit Preview-Clips (HTTPS, öffentlich)

create or replace function public.seed_demo_male(
  p_id uuid,
  p_email text,
  p_phone text,
  p_display_name text,
  p_pseudonym text,
  p_birth_date date,
  p_job text,
  p_bio text,
  p_photos text[],
  p_interest_tags text[],
  p_availability text,
  p_city text,
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
  v_photos text[];
begin
  v_photos := (select coalesce(array_agg(x), '{}'::text[]) from unnest(p_photos) x limit 5);
  v_password_hash := extensions.crypt('FlingSeed2026!', extensions.gen_salt('bf'::text));
  select id into v_instance from auth.instances limit 1;
  if v_instance is null then
    v_instance := '00000000-0000-0000-0000-000000000000';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, phone, phone_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) values (
    v_instance, p_id, 'authenticated', 'authenticated', p_email, v_password_hash,
    now(), p_phone, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('gender', 'male', 'seed', true),
    now(), now(), '', '', '', ''
  )
  on conflict (id) do update set email = excluded.email, phone = excluded.phone, updated_at = now();

  insert into auth.identities (
    provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    p_id::text, p_id,
    jsonb_build_object('sub', p_id::text, 'email', p_email),
    'email', now(), now(), now()
  )
  on conflict (provider_id, provider) do update set identity_data = excluded.identity_data, updated_at = now();

  insert into public.users (
    id, phone, gender, birth_date, verification_status, account_status,
    terms_accepted_at, privacy_accepted_at, marketing_opt_in,
    display_name, pseudonym, handle, photos, primary_photo_idx,
    job, bio, interest_tags, city, location_mode, availability,
    latitude, longitude, search_radius_km, verified_at, last_seen_at
  ) values (
    p_id, p_phone, 'male', p_birth_date, 'approved', 'active',
    now(), now(), false,
    p_display_name, p_pseudonym, lower(replace(p_pseudonym, ' ', '_')),
    v_photos, 0,
    p_job, p_bio, p_interest_tags, p_city, 'fixed', p_availability,
    p_lat, p_lng, 10, now(), now() - (p_last_seen_minutes || ' minutes')::interval
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    pseudonym = excluded.pseudonym,
    handle = excluded.handle,
    photos = excluded.photos,
    job = excluded.job,
    bio = excluded.bio,
    interest_tags = excluded.interest_tags,
    city = excluded.city,
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

-- Referenz: Berlin Mitte 52.520008, 13.404954

select public.seed_demo_male(
  'a1000001-0001-4000-8000-000000000001', 'seed-leon@fling.local', '+491511000001',
  'Leon', 'Leon_M', '1994-06-15', 'Architekt',
  'Design, gute Gespräche, spontane Pläne am Wochenende.',
  array['https://i.pravatar.cc/600?img=12','https://i.pravatar.cc/600?img=13','https://i.pravatar.cc/600?img=14'],
  array['Architektur','Kunst','Reisen'], 'now', 'Mitte', 52.522700, 13.404954, 2
);

select public.seed_demo_male(
  'a1000002-0002-4000-8000-000000000002', 'seed-felix@fling.local', '+491511000002',
  'Felix', 'Felix_Design', '1998-03-22', 'Product Designer',
  'Kaffee, Museen, Abendessen ohne Smalltalk.',
  array['https://i.pravatar.cc/600?img=32','https://i.pravatar.cc/600?img=33','https://i.pravatar.cc/600?img=34','https://i.pravatar.cc/600?img=35','https://i.pravatar.cc/600?img=36'],
  array['Design','Wein','Kino'], 'now', 'Prenzlauer Berg', 52.538500, 13.424000, 5
);

select public.seed_demo_male(
  'a1000003-0003-4000-8000-000000000003', 'seed-jonas@fling.local', '+491511000003',
  'Jonas', 'JonasFit', '1991-11-08', 'Consultant',
  'Sport morgens, entspannt abends. Lust auf Treffen!',
  array['https://i.pravatar.cc/600?img=51'],
  array['Sport','Fitness'], 'today', 'Wedding', 52.545200, 13.404954, 12
);

select public.seed_demo_male(
  'a1000004-0004-4000-8000-000000000004', 'seed-noah@fling.local', '+491511000004',
  'Noah', 'Noah_Lens', '1996-01-30', 'Fotograf',
  'Licht, Städte, ehrliche Gespräche. Schau dir mein Kurzvideo an.',
  array[
    'video:https://assets.mixkit.co/videos/preview/mixkit-man-portrait-looking-at-the-camera-3988-large.mp4',
    'https://i.pravatar.cc/600?img=22',
    'https://i.pravatar.cc/600?img=68',
    'https://i.pravatar.cc/600?img=69'
  ],
  array['Fotografie','Reisen'], 'now', 'Kreuzberg', 52.527200, 13.412000, 8
);

select public.seed_demo_male(
  'a1000005-0005-4000-8000-000000000005', 'seed-tim@fling.local', '+491511000005',
  'Tim', 'Tim_Code', '1999-07-12', 'Developer',
  'Tech by day, Weinbars by night.',
  array['https://i.pravatar.cc/600?img=20','https://i.pravatar.cc/600?img=21'],
  array['Gaming','Musik','Wein'], 'now', 'Friedrichshain', 52.533500, 13.398000, 3
);

select public.seed_demo_male(
  'a1000006-0006-4000-8000-000000000006', 'seed-lukas@fling.local', '+491511000006',
  'Lukas', 'Lukas_M', '1997-04-18', 'Marketing',
  'Spontan, direkt, ohne Spielchen.',
  array['https://i.pravatar.cc/600?img=15','https://i.pravatar.cc/600?img=16','https://i.pravatar.cc/600?img=17'],
  array['Reisen','Wein'], 'now', 'Charlottenburg', 52.518500, 13.408000, 14
);

select public.seed_demo_male(
  'a1000007-0007-4000-8000-000000000007', 'seed-ben@fling.local', '+491511000007',
  'Ben', 'Ben_Doc', '1992-08-25', 'Arzt',
  'Nachtschicht im Krankenhaus, tagsüber Zeit für lange Spaziergänge und ein gutes Frühstück. Ich mag Menschen, die ehrlich sagen, was sie wollen — ohne Drama. Wenn du heute Abend Lust auf ruhige Gespräche und vielleicht ein Glas Rotwein hast, melde dich.',
  array['https://i.pravatar.cc/600?img=25','https://i.pravatar.cc/600?img=26'],
  array['Sport','Kochen'], 'now', 'Mitte', 52.531000, 13.415000, 2
);

select public.seed_demo_male(
  'a1000008-0008-4000-8000-000000000008', 'seed-elias@fling.local', '+491511000008',
  'Elias', 'Elias_Brew', '1997-02-14', 'Barista',
  'Kaffee ist meine Sprache — kurzes Video zeigt, wer ich bin.',
  array[
    'video:https://assets.mixkit.co/videos/preview/mixkit-young-man-in-a-neon-lit-room-4255-large.mp4',
    'https://i.pravatar.cc/600?img=47'
  ],
  array['Kaffee','Musik'], 'today', 'Neukölln', 52.508000, 13.432000, 45
);

select public.seed_demo_male(
  'a1000009-0009-4000-8000-000000000009', 'seed-moritz@fling.local', '+491511000011',
  'Moritz', 'Moritz_Tech', '1994-10-30', 'Ingenieur',
  'Klettern, Craft Beer, ehrlich.',
  array['https://i.pravatar.cc/600?img=58','https://i.pravatar.cc/600?img=59','https://i.pravatar.cc/600?img=60','https://i.pravatar.cc/600?img=61','https://i.pravatar.cc/600?img=62'],
  array['Sport','Reisen'], 'now', 'Schöneberg', 52.512000, 13.425000, 6
);

select public.seed_demo_male(
  'a1000010-0010-4000-8000-000000000010', 'seed-david@fling.local', '+491511000012',
  'David', 'David_M', '1995-05-09', 'Journalist',
  'Ich schreibe über Nachtleben und Menschen, die keine Angst vor Offenheit haben. Berlin ist laut — ich suche Momente, die leise und echt sind. Wenn du neugierig bist, lass uns reden, bevor die Stadt uns wieder einsaugt. Abends gerne in kleinen Bars, ohne Show. Kein Stress, nur ehrliche Gespräche heute.',
  array[
    'https://i.pravatar.cc/600?img=61',
    'https://i.pravatar.cc/600?img=63',
    'https://i.pravatar.cc/600?img=64',
    'video:https://assets.mixkit.co/videos/preview/mixkit-young-man-in-a-neon-lit-room-4255-large.mp4'
  ],
  array['Kultur','Wein'], 'now', 'Mitte', 52.521000, 13.401000, 1
);

select public.seed_demo_male(
  'a1000011-0011-4000-8000-000000000011', 'seed-finn@fling.local', '+491511000013',
  'Finn', 'Finn_25', '1999-01-20', 'Student',
  'Neugierig, offen, heute Abend Zeit.',
  array['https://i.pravatar.cc/600?img=67','https://i.pravatar.cc/600?img=68'],
  array['Kino','Gaming'], 'today', 'Pankow', 52.548000, 13.410000, 90
);

select public.seed_demo_male(
  'a1000012-0012-4000-8000-000000000012', 'seed-tom@fling.local', '+491511000014',
  'Tom', 'Tom_Build', '1991-12-12', 'Gründer',
  'Busy days, clear nights.',
  array['https://i.pravatar.cc/600?img=11','https://i.pravatar.cc/600?img=12','https://i.pravatar.cc/600?img=18','https://i.pravatar.cc/600?img=19'],
  array['Tech','Fitness'], 'now', 'Kreuzberg', 52.525000, 13.418000, 4
);

select public.seed_demo_male(
  'a1000013-0013-4000-8000-000000000013', 'seed-rafael@fling.local', '+491511000015',
  'Rafael', 'Rafael_Beat', '1994-04-04', 'DJ',
  'Beats nach Mitternacht — swipe zu meinem Clip.',
  array[
    'video:https://assets.mixkit.co/videos/preview/mixkit-man-under-multicolored-lights-1237-large.mp4',
    'https://i.pravatar.cc/600?img=52',
    'https://i.pravatar.cc/600?img=53'
  ],
  array['Musik','Kino'], 'now', 'Friedrichshain', 52.515800, 13.455000, 7
);

select public.seed_demo_male(
  'a1000014-0014-4000-8000-000000000014', 'seed-stefan@fling.local', '+491511000016',
  'Stefan', 'Chef_Stef', '1989-09-19', 'Koch',
  'Ich koche den ganzen Tag für andere — abends will ich jemanden treffen, der Lust auf gutes Essen und ehrliche Gespräche hat. Kein Michelin-Sprech, nur du, ich und vielleicht ein spontanes Dinner irgendwo in Kreuzberg.',
  array['https://i.pravatar.cc/600?img=27','https://i.pravatar.cc/600?img=28','https://i.pravatar.cc/600?img=29'],
  array['Kochen','Wein','Reisen'], 'now', 'Kreuzberg', 52.499500, 13.428000, 11
);

select public.seed_demo_male(
  'a1000015-0015-4000-8000-000000000015', 'seed-philipp@fling.local', '+491511000017',
  'Philipp', 'Phil_Law', '1990-02-02', 'Anwalt',
  'Strukturiert im Job, spontan danach.',
  array['https://i.pravatar.cc/600?img=30','https://i.pravatar.cc/600?img=31'],
  array['Reisen','Kunst'], 'today', 'Mitte', 52.523800, 13.388000, 20
);

select public.seed_demo_male(
  'a1000016-0016-4000-8000-000000000016', 'seed-henri@fling.local', '+491511000018',
  'Henri', 'Henri_A', '1998-11-11', 'Architekt',
  'Form follows feeling — auch im Profil.',
  array[
    'https://i.pravatar.cc/600?img=40',
    'video:https://assets.mixkit.co/videos/preview/mixkit-man-portrait-looking-at-the-camera-3988-large.mp4',
    'https://i.pravatar.cc/600?img=41',
    'https://i.pravatar.cc/600?img=42'
  ],
  array['Architektur','Fotografie'], 'now', 'Prenzlauer Berg', 52.541000, 13.418000, 9
);

select public.seed_demo_male(
  'a1000017-0017-4000-8000-000000000017', 'seed-alex@fling.local', '+491511000019',
  'Alex', 'Alex_Fit', '1995-06-06', 'Personal Trainer',
  'Morgens Studio, abends offen für Pläne.',
  array['https://i.pravatar.cc/600?img=44'],
  array['Fitness','Sport'], 'now', 'Neukölln', 52.506500, 13.441000, 5
);

select public.seed_demo_male(
  'a1000018-0018-4000-8000-000000000018', 'seed-chris@fling.local', '+491511000020',
  'Chris', 'Chris_Film', '1996-08-08', 'Filmproduzent',
  'Kurzclips statt langer Stories.',
  array[
    'video:https://assets.mixkit.co/videos/preview/mixkit-young-man-in-a-neon-lit-room-4255-large.mp4',
    'https://i.pravatar.cc/600?img=55',
    'https://i.pravatar.cc/600?img=56'
  ],
  array['Kino','Fotografie'], 'now', 'Neukölln', 52.503000, 13.435000, 3
);

select public.seed_demo_male(
  'a1000019-0019-4000-8000-000000000019', 'seed-daniel@fling.local', '+491511000021',
  'Daniel', 'Dan_UX', '1998-12-12', 'UX Researcher',
  'Ich höre gerne zu — und stelle die richtigen Fragen.',
  array['https://i.pravatar.cc/600?img=57','https://i.pravatar.cc/600?img=58','https://i.pravatar.cc/600?img=59'],
  array['Design','Lesen'], 'today', 'Charlottenburg', 52.516000, 13.305000, 35
);

select public.seed_demo_male(
  'a1000020-0020-4000-8000-000000000020', 'seed-oskar@fling.local', '+491511000022',
  'Oskar', 'Oskar_Wine', '1992-03-03', 'Winzer',
  'Jahrelang in Baden gewohnt, jetzt Berlin — ich bringe guten Wein mit und suche jemanden, der Lust auf späte Abende und ehrliche Gespräche hat. Kein Perfektionsdruck, nur Chemie und ein bisschen Mut.',
  array['https://i.pravatar.cc/600?img=65','https://i.pravatar.cc/600?img=66'],
  array['Wein','Reisen','Kochen'], 'now', 'Schöneberg', 52.494000, 13.356000, 6
);

-- geom nachziehen
update public.users set latitude = latitude
where id in (
  'a1000001-0001-4000-8000-000000000001','a1000002-0002-4000-8000-000000000002',
  'a1000003-0003-4000-8000-000000000003','a1000004-0004-4000-8000-000000000004',
  'a1000005-0005-4000-8000-000000000005','a1000006-0006-4000-8000-000000000006',
  'a1000007-0007-4000-8000-000000000007','a1000008-0008-4000-8000-000000000008',
  'a1000009-0009-4000-8000-000000000009','a1000010-0010-4000-8000-000000000010',
  'a1000011-0011-4000-8000-000000000011','a1000012-0012-4000-8000-000000000012',
  'a1000013-0013-4000-8000-000000000013','a1000014-0014-4000-8000-000000000014',
  'a1000015-0015-4000-8000-000000000015','a1000016-0016-4000-8000-000000000016',
  'a1000017-0017-4000-8000-000000000017','a1000018-0018-4000-8000-000000000018',
  'a1000019-0019-4000-8000-000000000019','a1000020-0020-4000-8000-000000000020'
);

-- Prüfen (Frau ~ Berlin):
-- select public.get_schaufenster(10, 'all', 52.520008, 13.404954);
