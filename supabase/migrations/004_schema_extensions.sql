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
