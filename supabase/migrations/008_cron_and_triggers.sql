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
