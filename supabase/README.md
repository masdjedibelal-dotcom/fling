# Fling · Supabase Backend Setup

Schritt-für-Schritt-Anleitung für ein **Production-Backend** in Supabase (Region: **EU Frankfurt**).

## 1. Projekt anlegen

1. [supabase.com](https://supabase.com) → **New Project**
2. Region: **Frankfurt (eu-central-1)**
3. Starkes DB-Passwort notieren

## 2. Migrations ausführen

Im **SQL Editor** nacheinander ausführen (Reihenfolge einhalten):

| # | Datei | Inhalt |
|---|-------|--------|
| 1 | `migrations/001_initial.sql` | Users, Verifikation, app_config |
| 2 | `migrations/002_matches_chat.sql` | Matches, Chat, Basis-RPCs |
| 3 | `migrations/003_safe_pick.sql` | Safe Pick Sessions |
| 4 | `migrations/004_schema_extensions.sql` | PostGIS, city, last_seen |
| 5 | `migrations/005_schaufenster_rpc.sql` | Auswahl, Detail, Partner, Match |
| 6 | `migrations/006_admin_and_config.sql` | Admin-RPCs, Realtime |
| 7 | `migrations/007_storage.sql` | Buckets + Foto-Policies |
| 8 | `migrations/008_cron_and_triggers.sql` | Ablauf, Push-Outbox |

> **Hinweis:** Falls `alter publication supabase_realtime add table …` in 006 fehlschlägt (Tabelle schon drin), Zeile überspringen.

Alternativ mit Supabase CLI:

```bash
npm i -g supabase
supabase login
supabase link --project-ref DEIN_PROJECT_REF
supabase db push
```

## 3. Auth konfigurieren

### Phone OTP (SMS)

1. **Authentication → Providers → Phone** aktivieren
2. SMS-Provider wählen (Twilio empfohlen für DE)
3. Testnummern für Entwicklung eintragen

### URL & Redirects

- Site URL: `fling://` (Deep Link Schema aus `app.json`)
- Redirect URLs: `fling://**`, `exp://**` (Dev)

## 4. Realtime aktivieren

**Database → Replication** — folgende Tabellen sollten in `supabase_realtime` sein:

- `matches`
- `messages`
- `users`

(Migration 006 fügt sie hinzu.)

## 5. Storage

Migration 007 legt an:

| Bucket | Zweck | Zugriff |
|--------|-------|---------|
| `verification-docs` | Ausweis + Selfie | Privat, nur eigener Ordner |
| `profile-photos` | Profilbilder | Privat, signierte URLs |

Foto-Pfade in `users.photos` als `{user_id}/photo-0.jpg` speichern.  
Die App generiert signierte URLs clientseitig via `supabase.storage.from('profile-photos').createSignedUrl()`.

## 6. Admin einrichten

1. Admin-Account in **Authentication → Users** anlegen (E-Mail oder Phone)
2. UUID kopieren
3. Im SQL Editor:

```sql
insert into public.admin_users (user_id)
values ('DEINE-ADMIN-UUID');
```

Admin-RPCs (via Service Role Key im Admin-Web):

- `admin_list_verification_queue()`
- `admin_decide_verification(queue_id, 'approved' | 'rejected', reason?)`
- `admin_set_user_status(user_id, 'active' | 'suspended' | 'banned', suspended_until?)`
- `admin_list_reports()` / `admin_resolve_report(report_id)`
- `admin_list_safe_picks()`
- `admin_update_config(key, value)`
- `admin_search_users(query)`

## 7. Push-Benachrichtigungen

### A) Outbox + Edge Function

Migration 008 schreibt bei Match/Nachricht in `push_outbox`.

Edge Function deployen:

```bash
supabase functions deploy send-push
```

Erweiterte Version (Outbox abarbeiten) — optional als Cron/Webhook:

```sql
-- Alle 1 Min: pending Pushes an Edge Function senden (via pg_net oder Dashboard-Webhook)
select * from public.push_outbox where sent_at is null order by created_at limit 50;
```

### B) Expo Push Token

In `.env.local` / EAS Secrets:

```
EXPO_PUBLIC_PROJECT_ID=dein-expo-project-id
```

## 8. Match-Ablauf (pg_cron)

1. **Database → Extensions** → `pg_cron` aktivieren
2. SQL Editor:

```sql
select cron.schedule(
  'expire-matches',
  '*/5 * * * *',
  $$ select public.expire_stale_matches(); $$
);
```

## 9. App verbinden

`.env.local` im Projektroot:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_PROJECT_ID=xxxx-xxxx
EXPO_PUBLIC_APP_VERSION=1.0.0
```

Keys unter **Project Settings → API**.

> **Wichtig:** `service_role` Key **niemals** in die App — nur im Admin-Backend.

## 10. Smoke Test

Nach Setup im SQL Editor:

```sql
-- Config lesbar?
select * from public.app_config;

-- PostGIS aktiv?
select postgis_version();

-- RPC existiert?
select proname from pg_proc where proname = 'get_schaufenster';
```

In der App (mit echtem Build + `.env.local`):

1. Phone OTP → Verifikation
2. Admin freischalten → Auswahl-Grid sichtbar
3. Pick → Match + Chat
4. Safe Pick anlegen

## Architektur-Übersicht

```
App (Expo)
  ├── Auth (Phone OTP)
  ├── RPCs: get_schaufenster, create_match, get_active_match …
  ├── Realtime: matches, messages
  └── Storage: profile-photos, verification-docs

Admin-Web (Next.js + Service Role)
  ├── Verifikation freischalten
  ├── Reports, Safe Picks, User-Sperren
  └── app_config (Wartung, min_version)

Edge Function: send-push
  └── Liest push_outbox → Expo Push API
```

## Noch offen (App-Seite)

- [ ] Profilfoto-Upload zu Storage (statt lokaler URIs)
- [ ] `touch_last_seen()` beim App-Start aufrufen
- [ ] Signierte Foto-URLs vor Anzeige generieren
- [ ] Admin Next.js App deployen (`admin/README.md`)
