# Laiguana 🦎

App móvil oficial de **[laiguana.tv](https://laiguana.tv)** — noticias, transmisión
en vivo, podcasts y el resumen de audio **"Las 5 Noticias del Día"**. Construida en
**React Native + Expo (SDK 54)** con TypeScript estricto y `expo-router`.

---

## 🧩 Stack

- **Expo SDK 54** + **React Native 0.81** + **React 19**.
- **expo-router 6** — navegación basada en archivos, con rutas tipadas.
- **TypeScript estricto** — `npm run typecheck` (`tsc --noEmit`) pasa sin errores.
- **Zustand 5** + **AsyncStorage** — estado global con persistencia.
- **expo-audio** — reproductor de podcasts/episodios.
- **expo-speech** — TTS (lectura por voz) de artículos y de "Las 5 Noticias del Día".
- **react-native-webview** — transmisión en vivo de YouTube (incl. mini-player PiP).
- **expo-image** — imágenes con fallback al logo cuando una URL falla.
- **expo-apple-authentication** / **expo-local-authentication** — login con Apple y Face ID.
- **expo-notifications** — push locales de nuevas noticias por categoría.
- **lucide-react-native** — íconos. **@expo-google-fonts/open-sans** — tipografía.
- Tema **claro / oscuro / sistema**.

---

## 🎯 Core — cómo funciona

**Fuentes de datos**

| Fuente | Para qué | Archivo |
|--------|----------|---------|
| **WordPress REST API** de `laiguana.tv` (`/wp-json/wp/v2`) | Artículos, categorías, autores | `src/api/wp.ts` |
| **YouTube Data API** | Videos y detección de transmisión en vivo | `src/api/youtube.ts`, `src/api/youtubeLive.ts` |
| **Mocks** | Mismo dataset del MVP web como respaldo/desarrollo | `src/api/mocks.ts` |

**Piezas centrales**

- **Estado (Zustand):** cada dominio tiene su store en `src/store/`. Los clave:
  - `useArticlesStore` — feed de noticias (carga desde WordPress).
  - `usePulsoStore` + `src/utils/speech.ts` + `src/utils/dailyDigest.ts` — **"Las 5 Noticias del Día"**: selecciona el top 5, arma el guion y lo narra por TTS con voz latina y guion de tono venezolano.
  - `useLivePlayerStore` — estado del vivo y mini-player flotante.
  - `useEpisodePlayerStore` / `useEpisodeProgressStore` — reproductor de podcasts y progreso.
  - `useAuthStore` / `useUserStore` — sesión; permite uso como **invitado** (login se exige tras 24 h).
  - `useFollowStore`, `useFollowingStore`, `useFavoritesStore`, `useReadingListStore`, `useIguanazoStore`, `useHistoryStore` — follows, favoritos, guardados e historial.
  - `useSettingsStore` — tema, tamaño de fuente, suscripciones de notificaciones.
- **Audio:** la sesión se configura al iniciar (`setAudioModeAsync({ playsInSilentMode: true })` en `app/_layout.tsx`) para que la voz suene aun en modo silencio.
- **Overlays globales** (montados en `app/_layout.tsx`): `MiniPlayer`, `LiveMiniPlayer`, `EpisodePlayerModal`, `PulsoModal`, `TTSModal`, `MenuDrawer` y `SplashScreen`.
- **Theming:** tokens y hooks (`useTheme`) en `src/theme/tokens.ts`.
- **Alias de imports:** `@/*` → `src/*` (configurado en `tsconfig.json` y `babel.config.js`).

---

## 📂 Estructura

```
app/                          # Rutas (expo-router, file-based)
  _layout.tsx                 # Stack raíz + overlays globales + splash + sesión de audio
  (auth)/login.tsx            # Login (Apple / invitado)
  (tabs)/_layout.tsx          # TabBar custom (En Vivo, Noticias, Podcasts, Mi Iguana, Menú)
  (tabs)/live.tsx             # Transmisión en vivo (WebView)
  (tabs)/index.tsx            # Feed de noticias
  (tabs)/podcasts.tsx         # Biblioteca de podcasts
  (tabs)/iguanazo.tsx         # "Mi Iguana" (siguiendo / guardados / historial)
  (tabs)/profile.tsx          # Perfil
  article/[id].tsx            # Detalle de artículo
  programs/[id].tsx           # Detalle de programa/podcast
  journalist/[id].tsx         # Perfil de periodista
  search.tsx · notifications.tsx
  profile/*.tsx               # Sub-pantallas (favoritos, reading-list, idioma, etc.)

src/
  api/                        # wp.ts (WordPress), youtube.ts, youtubeLive.ts, mocks.ts
  components/
    layout/                   # MainHeader, SubHeader, SplashScreen, MenuDrawer
    player/                   # MiniPlayer, LiveMiniPlayer, EpisodePlayerModal, PulsoModal, TTSModal
    ui/                       # Button, Card, Chip, Avatar, ImageFallback, Toggle, ...
  store/                      # Stores Zustand (estado + persistencia)
  theme/tokens.ts             # Tema claro/oscuro + tipografía
  types/index.ts              # Tipos compartidos
  utils/                      # speech.ts, dailyDigest.ts, notifications.ts, liveStream.ts, ...
  config/youtube.ts           # Lectura de la API key de YouTube

assets/images/                # Iconos (icon-ios, icon-android), splash, logo, header
app.json · eas.json · babel.config.js · metro.config.js · tsconfig.json
```

---

## 🚀 Instalación y desarrollo

**Requisitos:** Node 18+ y la app **Expo Go** (o un emulador Android/iOS).

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env y coloca tu clave de YouTube Data API:
#   EXPO_PUBLIC_YOUTUBE_API_KEY=tu_api_key
# (Sin esta clave, el vivo y los videos de YouTube no cargan.)

# 3. Arrancar el bundler
npm start            # luego escanea el QR con Expo Go
# o directo a un dispositivo/emulador:
npm run android
npm run ios

# Verificar tipos
npm run typecheck
```

> Las variables `EXPO_PUBLIC_*` se inyectan en tiempo de build; si cambias el `.env`,
> reinicia Metro.

---

## 📦 Generar el APK (Android)

El build se hace en la nube con **EAS Build** (perfil `preview` → genera `.apk`
instalable, definido en `eas.json`).

```bash
# Una sola vez: instalar y autenticarse
npm install -g eas-cli
eas login

# Generar el APK
eas build --platform android --profile preview
```

Al terminar, EAS entrega un enlace/QR para descargar e instalar el APK directamente
en el teléfono. Perfiles disponibles en `eas.json`:

- `preview` → APK interno (`distribution: internal`, `buildType: apk`).
- `production` → build de producción (AAB) con auto-incremento de versión.
- `development` → dev client.

```bash
eas build --platform android --profile production   # AAB para Play Store
eas build --platform ios     --profile preview      # iOS (requiere cuenta Apple Dev)
```

### Iconos y assets nativos

Los iconos viven en `assets/images/` y se referencian en `app.json`
(`icon`, `android.adaptiveIcon`, `splash`). Si los cambias, regenera las carpetas
nativas antes de un build local:

```bash
npx expo prebuild --clean
```

(Con EAS Build no hace falta: el prebuild ocurre en la nube.)

---

## 📝 Notas

- **Identificadores:** iOS / Android → `tv.laiguana.app`.
- **Sesión:** se permite navegar como invitado; el login se vuelve obligatorio a las 24 h.
- **TTS:** usa las voces del sistema. Para mejor calidad, instala una voz en español
  "Enhanced/Premium" desde los ajustes de accesibilidad del teléfono. Para un acento
  venezolano real (tonada) haría falta un TTS en la nube (p. ej. Azure `es-VE`).
