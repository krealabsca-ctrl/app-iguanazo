#!/usr/bin/env bash
# Genera el APK local incrementando antes el contador de build.
# Uso: npm run apk:local
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"

# 1) Sube el contador (buildNumber + versionCode) en app.json.
node "$DIR/scripts/bump-build.cjs"

# 2) Entorno de Android/Java para el build local.
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

# 3) Build firmado (perfil preview, keystore de EAS).
eas build --platform android --profile preview --local \
  --non-interactive --output "$DIR/laiguana-preview.apk"
