# Fling

iOS Hookup-App — React Native + Expo SDK 51, Expo Router, NativeWind, Supabase.

**Alle 5 Sprints implementiert.** Details in [SPRINTS.md](./SPRINTS.md).

## Features

| Sprint | Inhalt |
|--------|--------|
| 1 | Auth: Age Gate → AGB → Onboarding → Verifikation |
| 2 | Schaufenster Grid (Frau), Warten (Mann), Detail + Pick |
| 3 | Match, Chat (24h Timer, Blur), Cancel, Report |
| 4 | Profil, Fotos, Bio/Tags, Benachrichtigungen, Konto löschen |
| 5 | Push-Setup, Offline-Banner, Wartung/Update-Guards, Skeletons |

## Setup

```bash
cp .env.example .env.local
npm install
npx expo start
```

### Supabase (Produktion)

Vollständige Anleitung: **[supabase/README.md](./supabase/README.md)**

1. Migrations `001`–`008` im SQL Editor ausführen
2. Phone Auth + Realtime aktivieren
3. Admin-UUID in `admin_users` eintragen
4. `.env.local` mit URL + Anon Key + `EXPO_PUBLIC_PROJECT_ID`

**Ohne Supabase:** Demo-Modus mit Mock-Daten, beliebigem SMS-Code, Slide-to-Pick → Chat.

### iOS Build (Codemagic → TestFlight)

1. Repo auf GitHub/GitLab pushen
2. [Codemagic](https://codemagic.io) → App hinzufügen → `codemagic.yaml` wird erkannt
3. **Integrations:** App Store Connect API Key (Name: `fling`)
4. **Environment group** `fling_production`: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_PROJECT_ID`
5. In `codemagic.yaml`: `APP_STORE_APPLE_ID` + Beta-Gruppe `Internal Testers` anpassen
6. Push auf `main` → Build → TestFlight

Details in den Kommentaren in [`codemagic.yaml`](./codemagic.yaml).

## Struktur

```
app/
├── (auth)/           # Sprint 1
├── (tabs)/           # Home, Pick, Profil
├── schaufenster/[id] # Sprint 2
├── chat/             # Sprint 3
└── profile/          # Sprint 4
lib/                  # API, Demo, Notifications
hooks/                # Schaufenster, Match, Chat
supabase/             # Migrations + Edge Function
admin/                # Admin-Web Doku (Sprint 5)
```

## Core Rules (implementiert)

- Nur Frauen picken (`create_match` RPC + Demo)
- Max. 1 aktiver Pick/Chat
- 24h Timer im Chat-Header
- Nur letzte 2 Nachrichten sichtbar (ältere geblurrt)
- Max. 160 Zeichen pro Nachricht
- Max. 5 Fotos pro Profil

## Admin

Siehe [admin/README.md](./admin/README.md) — separates Next.js-Tool mit Service Role Key.
