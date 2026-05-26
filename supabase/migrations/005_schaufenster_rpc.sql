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
