# Release · TestFlight / App Store

## Aktuelle Version

| Feld | Wert |
|------|------|
| Marketing-Version | **1.0.2** |
| iOS Build (`CFBundleVersion`) | **6** |
| Android `versionCode` | **6** |
| Bundle ID | `com.flingapp.app` |

Vor jedem Upload in `app.json` erhöhen: `expo.version`, `expo.ios.buildNumber`, `expo.android.versionCode`.  
Gleiche Werte in `package.json`, `codemagic.yaml` (`EXPO_PUBLIC_APP_VERSION`) und `.env.example`.

---

## Checkliste vor Upload

### 1. Code & Qualität

- [ ] `npm run lint` ohne Fehler
- [ ] App lokal auf Gerät/Simulator durchgetestet (Welcome, Onboarding, Auswahl, Pick, Chat)
- [ ] Änderungen auf `main` gepusht (Codemagic triggert bei Push auf `main`)

### 2. Codemagic

- [ ] Environment group **`fling_production`**: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_PROJECT_ID`
- [ ] iOS Signing: Distribution-Zertifikat + App-Store-Provisioning Profile für `com.flingapp.app`
- [ ] Integration **`app_store_connect: fling`** aktiv
- [ ] **`APP_STORE_APPLE_ID`** in `codemagic.yaml` auf die numerische Apple-ID der App setzen (nicht `0`) — dann holt `ios-resolve-build-number.sh` automatisch die nächste Build-Nummer aus App Store Connect

### 3. App Store Connect (manuell)

Copy-Vorlagen: `lib/marketingCopy.ts` · `docs/app-store.md`

- [ ] **Untertitel** (max. 30 Zeichen): `Such dir dein Abenteuer.`
- [ ] **Beschreibung**: USP-Text aus `docs/app-store.md`
- [ ] **Was ist neu** (1.0.2): z. B. neue App-Texte, Chat-Verbesserungen, Marke/Logo
- [ ] Screenshots aktuell (falls UI geändert)
- [ ] TestFlight: Build 6 nach Verarbeitung an **Internal Testers** verteilen

### 4. Nach dem Build

- [ ] TestFlight-Build installieren und Smoke-Test
- [ ] Bei Erfolg: optional Build-Nummer in `app.json` für den *nächsten* Upload schon auf **7** vorbereiten (oder CI mit `APP_STORE_APPLE_ID` automatisch)

---

## Codemagic starten

1. Push auf `main` → Workflow **Fling iOS · TestFlight** startet automatisch  
2. Oder in Codemagic: Workflow manuell starten  
3. Artefakt: `build/ios/ipa/*.ipa` → Upload nach TestFlight über Publishing-Block

## Build-Nummer-Logik

- **Mit** `APP_STORE_APPLE_ID`: `latest + 1`, mindestens Wert aus `app.json`
- **Ohne** Apple-ID: fester Wert aus `app.json` / `MIN_BUILD` in `scripts/ios-resolve-build-number.sh`

Build **6** muss größer sein als der letzte hochgeladene Build auf TestFlight (aktuell vorbereitet für Upload nach Build 5).
