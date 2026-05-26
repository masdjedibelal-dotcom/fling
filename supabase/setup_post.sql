-- Fling · Nach dem Setup (optional, manuell ausführen)

-- 1) Admin-UUID eintragen (aus Authentication → Users kopieren)
-- insert into public.admin_users (user_id) values ('DEINE-ADMIN-UUID-HIER');

-- 2) pg_cron aktivieren (Dashboard → Database → Extensions → pg_cron)
-- Dann:
-- select cron.schedule(
--   'expire-matches',
--   '*/5 * * * *',
--   $$ select public.expire_stale_matches(); $$
-- );

-- 3) Smoke Test
select postgis_version();
select proname from pg_proc where proname like 'get_schaufenster%';
select key, value from public.app_config order by key;
select id, name, public from storage.buckets where id in ('verification-docs', 'profile-photos');
