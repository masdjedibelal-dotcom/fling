#!/usr/bin/env bash
# Ermittelt IOS_BUILD_NUMBER für TestFlight (muss > letzter Upload sein).
set -euo pipefail

MIN_BUILD=4

APP_JSON_BUILD=$(node -p "parseInt(require('./app.json').expo.ios?.buildNumber || '0', 10)" 2>/dev/null || echo 0)

if [ -n "${APP_STORE_APPLE_ID:-}" ] && [ "$APP_STORE_APPLE_ID" != "0" ]; then
  LATEST=$(app-store-connect get-latest-app-store-build-number "$APP_STORE_APPLE_ID" || echo 0)
  NEXT_BUILD=$((LATEST + 1))
  if [ "$APP_JSON_BUILD" -gt "$NEXT_BUILD" ]; then
    NEXT_BUILD=$APP_JSON_BUILD
  fi
  echo "App Store Connect: $LATEST → $NEXT_BUILD (app.json min: $APP_JSON_BUILD)"
else
  BN="${PROJECT_BUILD_NUMBER:-${BUILD_NUMBER:-$APP_JSON_BUILD}}"
  NEXT_BUILD=$BN
  if [ "$APP_JSON_BUILD" -gt "$NEXT_BUILD" ]; then
    NEXT_BUILD=$APP_JSON_BUILD
  fi
  if [ "$NEXT_BUILD" -lt "$MIN_BUILD" ]; then
    NEXT_BUILD=$MIN_BUILD
  fi
  echo "WARN: APP_STORE_APPLE_ID nicht gesetzt — nutze app.json/ENV → $NEXT_BUILD"
  echo "Tipp: APP_STORE_APPLE_ID in codemagic.yaml (App Store Connect → Apple-ID der App)."
fi

export IOS_BUILD_NUMBER="$NEXT_BUILD"
echo "IOS_BUILD_NUMBER=$IOS_BUILD_NUMBER"

if [ -n "${CM_ENV:-}" ]; then
  echo "IOS_BUILD_NUMBER=$IOS_BUILD_NUMBER" >> "$CM_ENV"
fi
