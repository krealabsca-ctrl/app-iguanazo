#!/usr/bin/env node
/**
 * Incrementa el contador de builds del APK.
 *
 * Sube `expo.extra.buildNumber` (lo que se muestra en el menú: "v1.0.0 (N)")
 * y `expo.android.versionCode` (versión interna de Android) en app.json.
 * Se ejecuta automáticamente antes de cada build local (ver `npm run apk:local`).
 */
const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const json = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const expo = json.expo;

expo.extra = expo.extra || {};
expo.android = expo.android || {};

const next = (Number(expo.extra.buildNumber) || 0) + 1;
expo.extra.buildNumber = next;
expo.android.versionCode = next;

fs.writeFileSync(appJsonPath, JSON.stringify(json, null, 2) + '\n');
console.log(`🦎 Build #${next}  (versión ${expo.version})`);
