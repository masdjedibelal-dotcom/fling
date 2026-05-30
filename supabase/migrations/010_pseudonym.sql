-- Pseudonym (öffentlich) vs. display_name (echter Name, nur Pick-Chat)

alter table public.users
  add column if not exists pseudonym text;

comment on column public.users.pseudonym is 'Öffentlich in Auswahl/Profil; display_name nur nach Match im Chat';

-- Öffentliches Schaufenster-Profil (ohne Name, Beruf, Alter)
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
    'pseudonym', coalesce(nullif(trim(p_user.pseudonym), ''), 'Profil'),
    'photos', coalesce(p_user.photos, '{}'::text[]),
    'primary_photo_idx', coalesce(p_user.primary_photo_idx, 0),
    'distance_km', round(dist_km::numeric, 1),
    'availability', coalesce(p_user.availability, 'off'),
    'verified_at', coalesce(p_user.verified_at, p_user.updated_at)::text,
    'bio', coalesce(p_user.bio, ''),
    'interest_tags', coalesce(p_user.interest_tags, '{}'::text[]),
    'last_seen_minutes', last_min
  );
end;
$$;

-- Volles Partner-Profil für Pick-Chat (Name, Beruf, Alter zusätzlich)
create or replace function public.build_match_partner_profile(
  p_user public.users,
  p_ref_lat double precision default null,
  p_ref_lng double precision default null
)
returns jsonb language plpgsql stable set search_path = public as $$
begin
  return public.build_schaufenster_profile(p_user, p_ref_lat, p_ref_lng)
    || jsonb_build_object(
      'display_name', coalesce(nullif(trim(p_user.display_name), ''), 'Profil'),
      'job', coalesce(p_user.job, ''),
      'age', public.user_age(p_user.birth_date)
    );
end;
$$;

-- Partner-Profil aus aktivem Match (volle Chat-Felder)
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
      'profile', public.build_match_partner_profile(partner, ref_lat, ref_lng),
      'city', null
    );
  else
    select * into partner from public.users where id = m.female_id;
    return jsonb_build_object(
      'profile', public.build_match_partner_profile(partner, null, null)
        || jsonb_build_object('distance_km', 0),
      'city', partner.city
    );
  end if;
end;
$$;

-- Aktiver Match: Partner-Profile mit Chat-Feldern
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
    'male_profile', public.build_match_partner_profile(
      male_u,
      female_u.latitude,
      female_u.longitude
    ),
    'female_profile', public.build_match_partner_profile(female_u, null, null)
      || jsonb_build_object('distance_km', 0),
    'female_city', female_u.city,
    'female_display_name', coalesce(nullif(trim(female_u.display_name), ''), 'Profil')
  );
end;
$$;
