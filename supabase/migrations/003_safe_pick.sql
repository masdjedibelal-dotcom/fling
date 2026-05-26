-- Safe Pick: diskretes Check-in, nur für Nutzerin + Admin/Team (keine Weitergabe)

create type public.safe_pick_status as enum ('active', 'completed', 'cancelled');
create type public.safe_pick_rating as enum ('good', 'bad');

create table if not exists public.safe_pick_sessions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  meet_at timestamptz not null,
  area_text text not null check (char_length(area_text) <= 80),
  context_note text check (context_note is null or char_length(context_note) <= 120),
  check_in_at timestamptz not null,
  status public.safe_pick_status not null default 'active',
  follow_up_rating public.safe_pick_rating,
  follow_up_note text check (follow_up_note is null or char_length(follow_up_note) <= 200),
  follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  unique (match_id)
);

create index if not exists safe_pick_sessions_user_idx on public.safe_pick_sessions (user_id);
create index if not exists safe_pick_sessions_status_idx on public.safe_pick_sessions (status, check_in_at);

alter table public.safe_pick_sessions enable row level security;

create policy "safe_pick_select_own" on public.safe_pick_sessions
  for select using (auth.uid() = user_id);

create policy "safe_pick_insert_female" on public.safe_pick_sessions
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.female_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy "safe_pick_update_own" on public.safe_pick_sessions
  for update using (auth.uid() = user_id);

-- Nutzerin: Session für Match
create or replace function public.get_safe_pick_for_match(p_match_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s public.safe_pick_sessions%rowtype;
begin
  select * into s from public.safe_pick_sessions
  where match_id = p_match_id and user_id = auth.uid()
  limit 1;
  if not found then return null; end if;
  return to_jsonb(s);
end;
$$;

create or replace function public.create_safe_pick(
  p_match_id uuid,
  p_meet_at timestamptz,
  p_area_text text,
  p_context_note text,
  p_check_in_delay_minutes int
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  s public.safe_pick_sessions%rowtype;
  delay int := greatest(30, least(coalesce(p_check_in_delay_minutes, 120), 360));
begin
  if (select gender from public.users where id = uid) != 'female' then
    raise exception 'Nur für Frauen';
  end if;
  if not exists (
    select 1 from public.matches m
    where m.id = p_match_id and m.female_id = uid and m.status = 'active'
  ) then
    raise exception 'Kein aktiver Pick';
  end if;
  if exists (select 1 from public.safe_pick_sessions where match_id = p_match_id) then
    raise exception 'Safe Pick bereits aktiv';
  end if;

  insert into public.safe_pick_sessions (
    match_id, user_id, meet_at, area_text, context_note, check_in_at
  ) values (
    p_match_id,
    uid,
    p_meet_at,
    trim(p_area_text),
    nullif(trim(p_context_note), ''),
    p_meet_at + (delay || ' minutes')::interval
  )
  returning * into s;

  return to_jsonb(s);
end;
$$;

create or replace function public.submit_safe_pick_followup(
  p_session_id uuid,
  p_rating public.safe_pick_rating,
  p_note text
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s public.safe_pick_sessions%rowtype;
begin
  update public.safe_pick_sessions
  set
    status = 'completed',
    follow_up_rating = p_rating,
    follow_up_note = nullif(trim(p_note), ''),
    follow_up_at = now()
  where id = p_session_id and user_id = auth.uid() and status = 'active'
  returning * into s;

  if not found then raise exception 'Session nicht gefunden'; end if;
  return to_jsonb(s);
end;
$$;

-- Admin: Service Role oder erweiterte Policy — hier nur Stub-Dokumentation
create or replace function public.admin_list_safe_picks()
returns setof public.safe_pick_sessions language sql security definer set search_path = public as $$
  select * from public.safe_pick_sessions
  order by created_at desc
  limit 200;
$$;

grant execute on function public.get_safe_pick_for_match(uuid) to authenticated;
grant execute on function public.create_safe_pick(uuid, timestamptz, text, text, int) to authenticated;
grant execute on function public.submit_safe_pick_followup(uuid, public.safe_pick_rating, text) to authenticated;
