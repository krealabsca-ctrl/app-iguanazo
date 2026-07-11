import * as Speech from 'expo-speech';
import { setAudioModeAsync } from 'expo-audio';

// Re-asegura una sesión de audio apta para reproducir voz. Otros reproductores
// (live/podcast en WebView) pueden dejar la sesión en un estado que silencia el
// TTS, así que la fijamos justo antes de hablar.
async function ensurePlaybackAudio() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
  } catch {}
}

let cachedVoice: string | undefined;
let cachedLang: string | undefined;
let voiceLoadPromise: Promise<string | undefined> | null = null;

// Nombres de voces latinoamericanas conocidas (suenan más cálidas/naturales).
const FRIENDLY_NAME_HINTS = [
  'paulina',
  'angelica',
  'lupe',
  'marisol',
  'isabela',
  'juan',
  'jorge',
  'carlos',
];

async function loadFriendlyVoice(): Promise<string | undefined> {
  try {
    const voices = (await Speech.getAvailableVoicesAsync()) || [];
    const spanish = voices.filter((v) => (v.language || '').toLowerCase().startsWith('es'));
    if (spanish.length === 0) return undefined;
    const score = (v: Speech.Voice) => {
      const id = `${v.identifier || ''} ${v.name || ''}`.toLowerCase();
      const lang = (v.language || '').toLowerCase();
      let s = 0;
      // 1) La CALIDAD es lo más importante para que no suene robótica.
      if (v.quality === 'Enhanced') s += 20;
      if (/enhanced|premium|neural|siri/.test(id)) s += 18;
      // 2) Acento: priorizar caribeño/venezolano, dejar España de último.
      if (lang.startsWith('es-ve')) s += 12;
      else if (lang.startsWith('es-co')) s += 10;
      else if (lang.startsWith('es-us') || lang.startsWith('es-419')) s += 8;
      else if (lang.startsWith('es-mx')) s += 6;
      else if (lang.startsWith('es-es')) s += 1;
      // 3) Desempate por voces latinoamericanas conocidas.
      if (FRIENDLY_NAME_HINTS.some((h) => id.includes(h))) s += 3;
      return s;
    };
    const best = [...spanish].sort((a, b) => score(b) - score(a))[0];
    cachedVoice = best?.identifier;
    cachedLang = best?.language;
    return cachedVoice;
  } catch {
    return undefined;
  }
}

export function preloadFriendlyVoice(): Promise<string | undefined> {
  if (cachedVoice) return Promise.resolve(cachedVoice);
  if (!voiceLoadPromise) voiceLoadPromise = loadFriendlyVoice();
  return voiceLoadPromise;
}

export function friendlyOptions(rate = 1): Speech.SpeechOptions {
  return {
    // Usa el idioma de la voz elegida; si no hay, español genérico (más
    // compatible entre equipos que un acento específico como es-VE).
    language: cachedLang || 'es',
    rate: 0.92 * rate, // un pelín más lento = más nítido y natural
    pitch: 1.0, // tono neutro (1.08 sonaba más artificial)
    voice: cachedVoice,
  };
}

export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?…])\s+/)
    .flatMap((s) => {
      const trimmed = s.trim();
      if (trimmed.length <= 240) return [trimmed];
      return trimmed.split(/(?<=,|;|:)\s+/).map((c) => c.trim());
    })
    .filter(Boolean);
}

export interface SpeechChunk {
  text: string;
  meta?: Record<string, unknown>;
}

export class SpeechQueue {
  private chunks: SpeechChunk[] = [];
  private index = 0;
  private active = false;
  private rate = 1;
  private onProgress?: (chunk: SpeechChunk, index: number) => void;
  private onComplete?: () => void;
  private onError?: (err: unknown) => void;

  start(chunks: SpeechChunk[], opts: {
    rate?: number;
    onProgress?: (chunk: SpeechChunk, index: number) => void;
    onComplete?: () => void;
    onError?: (err: unknown) => void;
  }) {
    this.stop();
    this.chunks = chunks.filter((c) => c.text && c.text.trim().length > 0);
    if (this.chunks.length === 0) {
      opts.onComplete?.();
      return;
    }
    this.index = 0;
    this.rate = opts.rate ?? 1;
    this.onProgress = opts.onProgress;
    this.onComplete = opts.onComplete;
    this.onError = opts.onError;
    this.active = true;
    void ensurePlaybackAudio().finally(() =>
      preloadFriendlyVoice().finally(() => this.speakCurrent()),
    );
  }

  private speakCurrent(retryNoVoice = false) {
    if (!this.active) return;
    if (this.index >= this.chunks.length) {
      this.active = false;
      this.onComplete?.();
      return;
    }
    const chunk = this.chunks[this.index];
    this.onProgress?.(chunk, this.index);
    const opts = friendlyOptions(this.rate);
    // Si una voz específica falla, reintentamos sin voz (voz por defecto del
    // sistema), que es lo que evita que el TTS quede mudo en algunos equipos.
    if (retryNoVoice) opts.voice = undefined;
    Speech.speak(chunk.text, {
      ...opts,
      onDone: () => {
        if (!this.active) return;
        this.index += 1;
        this.speakCurrent();
      },
      onStopped: () => {},
      onError: (err) => {
        if (!this.active) return;
        if (!retryNoVoice && opts.voice) {
          // Reintenta el MISMO fragmento sin la voz específica.
          this.speakCurrent(true);
          return;
        }
        this.onError?.(err);
        this.index += 1;
        this.speakCurrent();
      },
    });
  }

  pause() {
    if (!this.active) return;
    this.active = false;
    Speech.stop();
  }

  resume() {
    if (this.active) return;
    if (this.chunks.length === 0) return;
    if (this.index >= this.chunks.length) return;
    this.active = true;
    this.speakCurrent();
  }

  setRate(rate: number) {
    this.rate = rate;
    if (this.active) {
      Speech.stop();
      this.speakCurrent();
    }
  }

  stop() {
    this.active = false;
    this.chunks = [];
    this.index = 0;
    Speech.stop();
  }

  get isActive() {
    return this.active;
  }

  get hasContent() {
    return this.chunks.length > 0;
  }

  get currentIndex() {
    return this.index;
  }
}
