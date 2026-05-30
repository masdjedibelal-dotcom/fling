-- create_match: volles Match inkl. Partner-Profile für Chat (Name, Beruf, Alter)

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
    'created_at', now(),
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
