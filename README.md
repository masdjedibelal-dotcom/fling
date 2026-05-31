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

**Aktuell:** Version **1.0.2**, Build **6**

Signing läuft wie beim letzten erfolgreichen Upload: `.p12` + Provisioning Profile in Codemagic, Pipeline nutzt `keychain add-certificates` + `use-profiles` (ohne `fetch-signing-files`).

1. Repo auf GitHub pushen (`main`)
2. Codemagic: Zertifikat + App-Store-Profil für `com.flingapp.app` (mit Push) hinterlegt lassen
3. Environment group `fling_production` mit Supabase-Keys
4. Optional in `codemagic.yaml`: `APP_STORE_APPLE_ID` setzen
5. Build starten → TestFlight

Vor jedem Upload: `npm run icons` → `app.json` Version/Build erhöhen. Checkliste: **[docs/RELEASE.md](./docs/RELEASE.md)**.

Marken-Assets: `assets/icon-app.svg` (App-Icon), `assets/splash-screen.svg` (Splash), `assets/wordmark-only.svg` (Android-Foreground). Generierung: `npm run icons`.

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
