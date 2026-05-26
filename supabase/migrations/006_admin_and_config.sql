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
