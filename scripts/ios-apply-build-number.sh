#!/usr/bin/env bash
# Setzt CFBundleVersion im nativen iOS-Projekt (nach prebuild).
set -euo pipefail

if [ -f "${CM_ENV:-}" ]; then
  # shellcheck disable=SC1090
  set -a && source "$CM_ENV" && set +a
fi

: "${IOS_BUILD_NUMBER:?IOS_BUILD_NUMBER fehlt (Schritt „Resolve iOS build number“)}"
: "${CM_BUILD_DIR:?CM_BUILD_DIR fehlt}"

PLIST="$CM_BUILD_DIR/ios/Fling/Info.plist"
if [ ! -f "$PLIST" ]; then
  echo "Info.plist nicht gefunden: $PLIST"
  exit 1
fi

cd "$CM_BUILD_DIR/ios"

/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $IOS_BUILD_NUMBER" "$PLIST" 2>/dev/null \
  || /usr/libexec/PlistBuddy -c "Add :CFBundleVersion string $IOS_BUILD_NUMBER" "$PLIST"

agvtool new-version -all "$IOS_BUILD_NUMBER" >/dev/null 2>&1 || true

ACTUAL=$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$PLIST")
echo "CFBundleVersion in Info.plist: $ACTUAL"

if [ "$ACTUAL" != "$IOS_BUILD_NUMBER" ]; then
  echo "FEHLER: Build-Nummer konnte nicht gesetzt werden."
  exit 1
fi

if [ "$ACTUAL" -le 1 ]; then
  echo "FEHLER: CFBundleVersion=$ACTUAL — muss > 1 sein (Build 1 bereits auf TestFlight)."
  exit 1
fi
