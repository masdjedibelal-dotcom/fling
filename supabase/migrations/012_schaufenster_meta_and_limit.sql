-- Öffentliche Meta-Felder (Alter, Beruf, Stadt) + mehr Profile in der Auswahl

update public.app_config
set value = '20'::jsonb, updated_at = now()
where key = 'auswahl_max_profiles';

insert into public.app_config (key, value) values
  ('auswahl_max_profiles', '20')
on conflict (key) do update set value = excluded.value, updated_at = now();

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
    'age', public.user_age(p_user.birth_date),
    'job', coalesce(nullif(trim(p_user.job), ''), ''),
    'city', coalesce(nullif(trim(p_user.city), ''), ''),
    'distance_km', round(dist_km::numeric, 1),
    'availability', coalesce(p_user.availability, 'off'),
    'verified_at', coalesce(p_user.verified_at, p_user.updated_at)::text,
    'bio', coalesce(p_user.bio, ''),
    'interest_tags', coalesce(p_user.interest_tags, '{}'::text[]),
    'last_seen_minutes', last_min
  );
end;
$$;
