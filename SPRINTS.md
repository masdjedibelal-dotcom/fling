# Fling — Sprint-Übersicht

## Sprint 1 — Supabase + Auth ✅
- [x] Expo SDK 51 + Router + NativeWind
- [x] Age Gate → AGB → Welcome → Onboarding
- [x] Phone OTP, ID-Scan, Selfie, Pending, Rejected
- [x] `users`, `verification_queue`, RLS
- [x] Zustand `authStore`

## Sprint 2 — Schaufenster ✅
- [x] `useSchaufenster` + Demo-Daten
- [x] Frau: 3-Spalten Masonry, Filter Pills, Eyebrow
- [x] Mann: Self-Tile, Verfügbarkeit Toggle, Status Cards
- [x] `schaufenster/[id]` Detail + Slide-to-Pick
- [x] Filter Bottom Sheet (Radius, Verfügbarkeit)
- [x] Realtime-Hook auf `matches` (wenn Supabase aktiv)

## Sprint 3 — Match + Chat + Timer ✅
- [x] `useMatch`, `useChat`
- [x] `create_match` / `cancel_match` (Demo + RPC)
- [x] Chat: Timer-Ring, Blur alte Nachrichten, 160 Zeichen
- [x] Cancel Modals (Frau/Mann)
- [x] Pick Tab (aktiv + Empty States)
- [x] Expired Screen
- [x] Report Bottom Sheet

## Sprint 4 — Profil + Settings ✅
- [x] Profil Tab (Frau/Mann)
- [x] `profile/photos` (5 Slots)
- [x] `profile/edit` (Bio, Beruf, Tags)
- [x] `profile/settings/notifications`
- [x] `profile/settings/account` (Löschen)

## Sprint 5 — Push + Edge Cases + Admin ✅
- [x] `lib/notifications.ts` + Push-Registrierung beim Home-Start
- [x] Offline-Banner (NetInfo)
- [x] Maintenance + Force-Update + Account gesperrt (`AppGuards`)
- [x] Grid Skeleton (Shimmer)
- [x] Edge Function Stub `send-push`
- [x] Admin-Doku in `admin/README.md`

## Nächste Schritte (Produktion)
- [x] PostGIS + `get_schaufenster` RPCs (`005_schaufenster_rpc.sql`)
- [x] Admin RPCs + Storage + Push-Outbox (`006`–`008`)
- [ ] Admin Next.js App deployen
- [ ] Twilio SMS + Profilfoto-Upload zu Storage
- [ ] `pg_cron` für `expire_matches` (Anleitung in `supabase/README.md`)
