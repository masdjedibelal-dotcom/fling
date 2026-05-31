# Release · TestFlight / App Store

## Aktuelle Version

| Feld | Wert |
|------|------|
| Marketing-Version | **1.0.4** |
| iOS Build (`CFBundleVersion`) | **8** |
| Android `versionCode` | **8** |
| Bundle ID | `com.flingapp.app` |

Vor jedem Upload in `app.json` erhöhen: `expo.version`, `expo.ios.buildNumber`, `expo.android.versionCode`.  
Gleiche Werte in `package.json`, `codemagic.yaml` (`EXPO_PUBLIC_APP_VERSION`) und `.env.example`.

---

## Checkliste vor Upload (1.0.4 · Build 8)

### 1. Code & Qualität

- [ ] `npm run icons` (Wortmarke → Splash/App-Icon/Android; Quelle: `fling-wordmark-dark.svg`)
- [ ] Splash sichtbar korrekt: erfordert **neuen Native-Build** (`expo prebuild --clean` in CI), nicht nur Expo Go Reload
- [ ] `npm run lint` ohne Fehler
- [ ] App lokal auf Gerät/Simulator durchgetestet:
  - [ ] Splash: neue Wortmarke (kein altes F-Logo)
  - [ ] Auswahl: Hintergrund oben (Dynamic Island) wie restlicher Screen
  - [ ] Onboarding: Geburtsdatum — Tipp außerhalb schließt Tastatur, „Weiter“ sichtbar
  - [ ] Chat: Tastatur ein/aus, Einmal-Fotos, Sprachnotiz
  - [ ] Pick-Tab: Partnerbild nach „Beim aktuellen Pick bleiben“
- [ ] Änderungen auf `main` gepusht (Codemagic triggert bei Push auf `main`)

### 2. Codemagic

- [ ] Environment group **`fling_production`**: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_PROJECT_ID`
- [ ] iOS Signing: Distribution-Zertifikat + App-Store-Provisioning Profile für `com.flingapp.app`
- [ ] Integration **`app_store_connect: fling`** aktiv
- [ ] **`APP_STORE_APPLE_ID`** in `codemagic.yaml` auf die numerische Apple-ID der App setzen (nicht `0`) — dann holt `ios-resolve-build-number.sh` automatisch die nächste Build-Nummer aus App Store Connect

### 3. App Store Connect (manuell)

Copy-Vorlagen: `lib/marketingCopy.ts` · `docs/app-store.md`

- [ ] **Was ist neu** (1.0.4): Text aus `docs/app-store.md` eintragen
- [ ] Screenshots aktuell (falls UI geändert)
- [ ] TestFlight: Build 8 nach Verarbeitung an **Internal Testers** verteilen

### 4. Nach dem Build

- [ ] TestFlight-Build installieren und Smoke-Test
- [ ] Bei Erfolg: für den *nächsten* Upload Build **9** in `app.json` vorbereiten (oder CI mit `APP_STORE_APPLE_ID` automatisch)

---

## Codemagic starten

1. Push auf `main` → Workflow **Fling iOS · TestFlight** startet automatisch  
2. Oder in Codemagic: Workflow manuell starten  
3. Artefakt: `build/ios/ipa/*.ipa` → Upload nach TestFlight über Publishing-Block

## Build-Nummer-Logik

- **Mit** `APP_STORE_APPLE_ID`: `latest + 1`, mindestens Wert aus `app.json`
- **Ohne** Apple-ID: fester Wert aus `app.json` / `MIN_BUILD` in `scripts/ios-resolve-build-number.sh`

Build **8** muss größer sein als der letzte hochgeladene Build auf TestFlight (vorherige Vorbereitung: Build 7).
