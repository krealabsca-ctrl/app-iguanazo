import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Share as RNShare,
  Animated,
  Dimensions,
  BackHandler,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import {
  ChevronDown,
  Play,
  Pause,
  FastForward,
  Rewind,
  MoreHorizontal,
  Share as ShareIcon,
  CheckCircle2,
  Circle,
  ExternalLink,
  AlertCircle,
} from 'lucide-react-native';

import { useRouter } from 'expo-router';

import { useEpisodePlayerStore } from '@/store/useEpisodePlayerStore';
import { useEpisodeProgressStore } from '@/store/useEpisodeProgressStore';
import { useYoutubeStore } from '@/store/useYoutubeStore';
import { buildYoutubePlayerHTML, extractYoutubeVideoId } from '@/utils/youtubeVideo';

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const SPEEDS = [1, 1.25, 1.5, 2];
const YT_STATE = { ended: 0, playing: 1, paused: 2, buffering: 3 } as const;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export function EpisodePlayerModal() {
  const {
    isVisible,
    isExpanded,
    currentEpisode,
    isPlaying,
    pause,
    resume,
    close,
    minimize,
    setPlaying,
  } = useEpisodePlayerStore();
  const setProgress = useEpisodeProgressStore((s) => s.setProgress);
  const markComplete = useEpisodeProgressStore((s) => s.markComplete);
  const completedMap = useEpisodeProgressStore((s) => s.completed);
  const playlists = useYoutubeStore((s) => s.playlists);
  const router = useRouter();

  // Back action: bring the player down AND pop the underlying podcast detail
  // so we land on the screen that opened it (e.g. podcasts list). The mini
  // player stays visible so the episode can be resumed.
  const handleBack = () => {
    minimize();
    if (router.canGoBack()) router.back();
  };

  const webRef = useRef<WebView>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [embedError, setEmbedError] = useState<number | null>(null);

  // Slide animation between expanded (0) and minimized (off-screen) so the
  // WebView stays mounted and audio keeps playing while minimized.
  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  useEffect(() => {
    Animated.timing(slideY, {
      toValue: isExpanded ? 0 : SCREEN_HEIGHT,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isExpanded, slideY]);

  // Android hardware back: behave like the chevron when expanded.
  useEffect(() => {
    if (!isExpanded) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const videoId = currentEpisode ? extractYoutubeVideoId(currentEpisode.videoUrl) : null;
  const programName = currentEpisode
    ? playlists.find((p) => p.id === currentEpisode.programId)?.title || ''
    : '';

  const html = useMemo(() => (videoId ? buildYoutubePlayerHTML(videoId) : null), [videoId]);

  // Reset transient state when the episode changes.
  useEffect(() => {
    setDuration(currentEpisode?.durationSeconds ?? 0);
    setCurrentTime(0);
    setIsReady(false);
    setSpeed(1);
    setEmbedError(null);
  }, [currentEpisode?.id]);

  const injectJs = (js: string) => {
    webRef.current?.injectJavaScript(`${js}; true;`);
  };

  // Mirror store playing state into the iframe player.
  useEffect(() => {
    if (!isReady) return;
    if (isPlaying) injectJs('window.__yt && window.__yt.play()');
    else injectJs('window.__yt && window.__yt.pause()');
  }, [isPlaying, isReady]);

  useEffect(() => {
    if (!isReady) return;
    injectJs(`window.__yt && window.__yt.rate(${speed})`);
  }, [speed, isReady]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ready') {
        setIsReady(true);
        if (typeof msg.d === 'number' && msg.d > 0) setDuration(msg.d);
        return;
      }
      if (msg.type === 'tick') {
        if (typeof msg.d === 'number' && msg.d > 0) setDuration(msg.d);
        if (typeof msg.t === 'number') {
          setCurrentTime(msg.t);
          if (currentEpisode) setProgress(currentEpisode.id, msg.t);
        }
        return;
      }
      if (msg.type === 'state') {
        if (msg.s === YT_STATE.playing) {
          setPlaying(true);
          setEmbedError(null);
        } else if (msg.s === YT_STATE.paused) setPlaying(false);
        else if (msg.s === YT_STATE.ended) {
          if (currentEpisode) markComplete(currentEpisode.id);
          setPlaying(false);
        }
        return;
      }
      if (msg.type === 'error') {
        setEmbedError(typeof msg.code === 'number' ? msg.code : -1);
        setPlaying(false);
      }
    } catch {}
  };

  const openInYoutube = () => {
    if (currentEpisode?.videoUrl) Linking.openURL(currentEpisode.videoUrl);
  };

  const advance = (secs: number) => {
    const next = Math.max(0, Math.min(duration || currentTime + secs, currentTime + secs));
    setCurrentTime(next);
    injectJs(`window.__yt && window.__yt.seek(${next})`);
  };

  const nextSpeed = () => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]);

  const handleShare = async () => {
    if (!currentEpisode) return;
    try {
      await RNShare.share({
        title: currentEpisode.title,
        message: `${currentEpisode.title}\n${currentEpisode.videoUrl}`,
        url: currentEpisode.videoUrl,
      });
    } catch {}
  };

  if (!currentEpisode) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const completed = Boolean(completedMap[currentEpisode.id]);

  if (!isVisible) return null;

  return (
    <Animated.View
      pointerEvents={isExpanded ? 'auto' : 'none'}
      style={[
        StyleSheet.absoluteFillObject,
        styles.fullPlayerLayer,
        { transform: [{ translateY: slideY }] },
      ]}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.6 : 1 })}
            accessibilityLabel="Volver"
          >
            <ChevronDown size={28} color="rgba(255,255,255,0.7)" />
          </Pressable>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={styles.headerEyebrow}>ESTÁS ESCUCHANDO</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {programName || currentEpisode.title}
            </Text>
          </View>
          <Pressable style={{ padding: 6 }}>
            <MoreHorizontal size={24} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>

        <View style={styles.playerWrap}>
          <View style={styles.playerCard}>
            {html ? (
              <WebView
                ref={webRef}
                originWhitelist={['*']}
                source={{ html, baseUrl: 'https://www.youtube-nocookie.com' }}
                style={{ flex: 1, backgroundColor: '#000' }}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                onMessage={onMessage}
                androidLayerType="hardware"
                mixedContentMode="always"
                setSupportMultipleWindows={false}
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)' }}>Video no disponible</Text>
              </View>
            )}

            {embedError !== null && (
              <View style={styles.errorOverlay}>
                <AlertCircle size={32} color="rgba(255,255,255,0.9)" />
                <Text style={styles.errorTitle}>El canal no permite reproducir este video acá</Text>
                <Text style={styles.errorSubtitle}>Podés verlo directamente en YouTube.</Text>
                <Pressable
                  onPress={openInYoutube}
                  style={({ pressed }) => [
                    styles.errorBtn,
                    { opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <ExternalLink size={16} color="#000" />
                  <Text style={styles.errorBtnText}>Ver en YouTube</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={2}>
                {currentEpisode.title}
              </Text>
              {!!programName && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {programName}
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => currentEpisode && markComplete(currentEpisode.id)}
              hitSlop={10}
              style={{ padding: 4 }}
            >
              {completed ? (
                <CheckCircle2 size={26} color="#c82022" />
              ) : (
                <Circle size={26} color="rgba(255,255,255,0.4)" />
              )}
            </Pressable>
          </View>

          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.timesRow}>
            <Text style={styles.time}>{formatTime(currentTime)}</Text>
            <Text style={styles.time}>-{formatTime(Math.max(0, duration - currentTime))}</Text>
          </View>

          <View style={styles.controlsRow}>
            <Pressable onPress={nextSpeed} style={{ width: 50 }}>
              <Text style={styles.speed}>{speed}x</Text>
            </Pressable>
            <Pressable onPress={() => advance(-15)} style={{ padding: 6 }}>
              <Rewind size={32} color="rgba(255,255,255,0.8)" />
            </Pressable>
            <Pressable
              onPress={() => (isPlaying ? pause() : resume())}
              style={({ pressed }) => [styles.playBtn, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
            >
              {isPlaying ? (
                <Pause size={32} color="#000" fill="#000" />
              ) : (
                <Play size={32} color="#000" fill="#000" style={{ marginLeft: 2 }} />
              )}
            </Pressable>
            <Pressable onPress={() => advance(15)} style={{ padding: 6 }}>
              <FastForward size={32} color="rgba(255,255,255,0.8)" />
            </Pressable>
            <Pressable onPress={handleShare} style={{ width: 50, alignItems: 'flex-end' }}>
              <ShareIcon size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullPlayerLayer: {
    backgroundColor: '#121212',
    zIndex: 50,
    elevation: 50,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 37,
    paddingBottom: 12,
  },
  headerEyebrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginTop: 2,
    maxWidth: '90%',
  },
  playerWrap: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  playerCard: {
    aspectRatio: 1,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    maxHeight: 380,
    alignSelf: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  bar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  timesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 32,
  },
  time: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  speed: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    fontSize: 14,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  errorTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  errorSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  errorBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
});
