# Fling Admin (Web)

Minimales Admin-Interface — in Produktion als separates Next.js-Projekt mit `SUPABASE_SERVICE_ROLE_KEY`.

## Seiten (Sprint 5 Spec)

| Route | Funktion |
|-------|----------|
| `/admin/verify` | `verification_queue` WHERE status=waiting |
| `/admin/users` | Suche, Sperren/Bannen via `admin_set_user_status` |
| `/admin/reports` | Offene Reports |
| `/admin/config` | `app_config` Key-Value Editor |
| `/admin/safe-picks` | `safe_pick_sessions` — Team-Übersicht (intern) |

## Setup (Next.js empfohlen)

```bash
npx create-next-app@latest fling-admin
cd fling-admin
npm install @supabase/supabase-js
```

Nutze den Service Role Key **nur serverseitig** (API Routes / Server Actions).

## RPCs

- `admin_decide_verification(queue_id, 'approved' | 'rejected', reason?)`
- `admin_set_user_status(user_id, status)`
- `submit_report` — von der App

Die SQL-Stubs liegen in `supabase/migrations/002_matches_chat.sql`. Erweitere sie für Admin-Policies (nur `ADMIN_USER_ID`).

## Safe Pick (Phase 1)

Tabelle `safe_pick_sessions` in `supabase/migrations/003_safe_pick.sql`.

- Nutzerin aktiviert im Chat (Modal: Zeit, Ort, optional Kontext, Nachfrage nach 1–3h)
- Keine SMS, keine Vertrauensperson, keine Auto-Eskalation
- Nachfrage: Gut/Schlecht + kurzer Freitext → nur Team
- RPC `admin_list_safe_picks()` — nur mit **Service Role** aufrufen

**Demo-App:** Profil → „Safe Pick · Team“ (nur Demo-Modus) zeigt gespeicherte Sessions aus AsyncStorage.
