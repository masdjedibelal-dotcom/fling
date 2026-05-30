-- Chat-Medien: Einmal-Fotos, Sprachnotizen
alter table public.messages
  add column if not exists message_type text not null default 'text'
    check (message_type in ('text', 'image', 'voice')),
  add column if not exists media_url text,
  add column if not exists media_duration_ms integer,
  add column if not exists view_once boolean not null default false,
  add column if not exists viewed_at timestamptz;

alter table public.messages alter column body set default '';
