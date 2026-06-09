import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  Share as RNShare,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { useIsFocused } from '@react-navigation/native';
import {
  Share,
  Bell,
  Check,
  ExternalLink,
  PlayCircle,
  Radio,
  AlertCircle,
  Play,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { MainHeader } from '@/components/layout/MainHeader';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { YoutubeMissingKey } from '@/components/youtube/YoutubeMissingKey';
import { useTheme, radius } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useYoutubeStore } from '@/store/useYoutubeStore';
import { useLivePlayerStore } from '@/store/useLivePlayerStore';
import { LIVE_CHANNEL_ID } from '@/utils/liveStream';
import { buildYoutubePlayerHTML } from '@/utils/youtubeVideo';

type DailyScheduleEntry = {
  id: string;
  time: string;
  name: string;
  host: string;
};

const DAILY_SCHEDULE: DailyScheduleEntry[] = [
  { id: 'p6', time: '7:00 AM', name: 'Aquí y Ahora', host: 'Equipo Laiguana.tv' },
  { id: 'p7', time: '10:00 AM', name: 'Tubazos', host: 'Equipo Laiguana.tv' },
  { id: 'p1', time: '1:00 PM', name: 'Los Mediodías de La Iguana', host: 'William Castillo' },
  { id: 'p5', time: '4:00 PM', name: 'Desde Donde Sea', host: 'Corresponsales' },
  { id: 'p2', time: '6:00 PM', name: 'La Iguana al Día', host: 'Miguel Pérez Pirela' },
  { id: 'p4', time: '9:00 PM', name: 'El Sofá', host: 'Ernesto Navarro' },
  { id: 'p3', time: '11:00 PM', name: 'Esto No es un Misil', host: 'Alberto Alvarado' },
];

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return `${m}:${s.toString().padStart(2, '0')}`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, '0')}m`;
}

function buildLiveStreamEmbed(channelId: string) {
  return `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;
}

export default function LiveTV() {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const { notifications, toggleNotification, toggleProgramReminder } = useSettingsStore();
  const configured = useYoutubeStore((s) => s.configured);
  const liveStatus = useYoutubeStore((s) => s.liveStatus);
  const liveError = useYoutubeStore((s) => s.liveError);
  const liveData = useYoutubeStore((s) => s.liveData);
  const currentLive = useYoutubeStore((s) => s.currentLive);
  const loadLive = useYoutubeStore((s) => s.loadLive);

  const [embedError, setEmbedError] = useState<number | null>(null);

  useEffect(() => {
    if (configured) loadLive();
  }, [configured, loadLive]);

  // Live videoId priority: scrape > API search > none.
  const liveVideoId = currentLive?.videoId || liveData?.live[0]?.id || null;
  const isCurrentlyLive = Boolean(currentLive?.isLive || liveData?.live[0]);
  const liveTitle = currentLive?.title || liveData?.live[0]?.title || '';
  const channelId = liveData?.channel.channelId || LIVE_CHANNEL_ID;
  const watchUrl = liveVideoId
    ? `https://www.youtube.com/watch?v=${liveVideoId}`
    : `https://www.youtube.com/channel/${channelId}/live`;

  // Reset error when videoId changes.
  useEffect(() => {
    setEmbedError(null);
  }, [liveVideoId]);

  // Publish the current live video metadata to the global store so the
  // floating mini player can render it when the user navigates away.
  const setLive = useLivePlayerStore((s) => s.setLive);
  useEffect(() => {
    if (liveVideoId) {
      const thumb = liveData?.live[0]?.thumbnailUrl || null;
      setLive({ videoId: liveVideoId, title: liveTitle, thumbnailUrl: thumb });
    }
  }, [liveVideoId, liveTitle, liveData?.live, setLive]);

  const playerHtml = useMemo(
    () => (liveVideoId ? buildYoutubePlayerHTML(liveVideoId, { controls: 1, mute: 1, autoplay: 1 }) : null),
    [liveVideoId],
  );

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'error') {
        setEmbedError(typeof msg.code === 'number' ? msg.code : -1);
      } else if (msg.type === 'state' && msg.s === 1) {
        setEmbedError(null);
      }
    } catch {}
  };

  const handleShare = async () => {
    try {
      await RNShare.share({
        title: 'Laiguana.tv En Vivo',
        message: `Señal en vivo 24/7 de Laiguana.tv: ${watchUrl}`,
        url: watchUrl,
      });
    } catch {}
  };

  const onRefresh = () => loadLive(true);

  if (!configured) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
        <MainHeader />
        <YoutubeMissingKey title="En Vivo necesita acceso a YouTube" />
      </SafeAreaView>
    );
  }

  const isLoading = liveStatus === 'loading' && !liveData && !currentLive;
  const completed = liveData?.completed || [];
  const upcoming = liveData?.upcoming || [];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <MainHeader />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
        refreshControl={
          <RefreshControl
            refreshing={liveStatus === 'loading' && (!!liveData || !!currentLive)}
            onRefresh={onRefresh}
            tintColor={theme.textTertiary}
          />
        }
      >
        <View style={styles.videoBox}>
          {isFocused ? (
            playerHtml ? (
              <WebView
                source={{ html: playerHtml, baseUrl: 'https://www.youtube-nocookie.com' }}
                style={{ flex: 1, backgroundColor: '#000' }}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                allowsFullscreenVideo
                onMessage={onMessage}
                androidLayerType="hardware"
                mixedContentMode="always"
                setSupportMultipleWindows={false}
              />
            ) : (
              <WebView
                source={{ uri: buildLiveStreamEmbed(channelId) }}
                style={{ flex: 1, backgroundColor: '#000' }}
                allowsFullscreenVideo
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="always"
              />
            )
          ) : (
            // While blurred the floating LiveMiniPlayer takes over playback.
            <View style={{ flex: 1, backgroundColor: '#000' }} />
          )}

          {embedError !== null && (
            <View style={styles.errorOverlay}>
              <AlertCircle size={32} color="rgba(255,255,255,0.9)" />
              <Text style={styles.errorTitle}>El canal no permite reproducir este live acá</Text>
              <Text style={styles.errorSubtitle}>Lo podés ver directo en YouTube.</Text>
              <Pressable
                onPress={() => Linking.openURL(watchUrl)}
                style={({ pressed }) => [styles.errorBtn, { opacity: pressed ? 0.85 : 1 }]}
              >
                <ExternalLink size={16} color="#000" />
                <Text style={styles.errorBtnText}>Ver en YouTube</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Barra de Estado y Título — estilo rediseño */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24,
            borderBottomWidth: 1,
            borderBottomColor: `${theme.borderDefault}80`,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View
                style={[
                  styles.livePill,
                  {
                    backgroundColor: `${theme.primary}1A`,
                    borderColor: `${theme.primary}33`,
                  },
                ]}
              >
                <LivePingDot color={theme.primary} active={isCurrentlyLive} />
                <Text
                  style={{
                    color: theme.primary,
                    fontWeight: '800',
                    fontSize: 11,
                    letterSpacing: 1,
                  }}
                >
                  EN VIVO
                </Text>
              </View>
              <Text
                numberOfLines={1}
                style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '500', flexShrink: 1 }}
              >
                {isCurrentlyLive ? 'Transmisión en vivo' : 'Sin transmisión activa'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Pressable
                onPress={() => toggleNotification('livePrograms')}
                hitSlop={6}
                style={({ pressed }) => [styles.headerIconBtn, { opacity: pressed ? 0.6 : 1 }]}
                accessibilityLabel="Alertas"
              >
                {notifications.livePrograms ? (
                  <Check size={20} color={theme.accentSecondary} />
                ) : (
                  <Bell size={20} color={theme.textSecondary} />
                )}
              </Pressable>
              <Pressable
                onPress={handleShare}
                hitSlop={6}
                style={({ pressed }) => [styles.headerIconBtn, { opacity: pressed ? 0.6 : 1 }]}
                accessibilityLabel="Compartir"
              >
                <Share size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>

          <Text
            numberOfLines={2}
            style={{
              color: theme.textPrimary,
              fontWeight: '700',
              fontSize: 22,
              lineHeight: 28,
              marginBottom: 4,
            }}
          >
            {liveTitle ||
              (isCurrentlyLive
                ? 'Transmisión en curso'
                : 'No hay transmisión activa ahora')}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
            {isCurrentlyLive ? 'En vivo · Laiguana.tv' : 'Mirá los últimos programas más abajo'}
          </Text>
        </View>

        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            <Pressable
              onPress={() =>
                Linking.openURL(
                  'https://www.youtube.com/@laiguanatv?sub_confirmation=1',
                )
              }
              style={({ pressed }) => [
                styles.subscribeBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Suscribirse al canal de YouTube"
            >
              <View style={styles.subscribeIconBox}>
                <Play size={11} color="#FF0000" fill="#FF0000" style={{ marginLeft: 2 }} />
              </View>
              <Text style={styles.subscribeText} numberOfLines={1}>
                Suscribirse
              </Text>
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL(watchUrl)}
              style={({ pressed }) => [
                styles.openYtBtn,
                {
                  borderColor: theme.borderDefault,
                  opacity: pressed ? 0.7 : 1,
                  backgroundColor: pressed ? `${theme.primary}1A` : 'transparent',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Abrir en YouTube"
            >
              <ExternalLink size={16} color={theme.primary} />
              <Text
                style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}
                numberOfLines={1}
              >
                Abrir en YouTube
              </Text>
            </Pressable>
          </View>

          {isLoading && (
            <View style={{ paddingVertical: 40, alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color={theme.accentPrimary} />
              <Text style={{ color: theme.textSecondary }}>Cargando transmisiones…</Text>
            </View>
          )}

          {liveStatus === 'error' && (
            <View
              style={{
                padding: 16,
                borderWidth: 1,
                borderColor: theme.borderDefault,
                borderRadius: 12,
                marginBottom: 24,
              }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 4 }}>
                No pudimos cargar las transmisiones
              </Text>
              {!!liveError && (
                <Text style={{ color: theme.textTertiary, fontSize: 12 }}>{liveError}</Text>
              )}
            </View>
          )}

          {completed.length > 0 && (
            <>
              <Text style={{ fontWeight: '700', fontSize: 18, color: theme.textPrimary, marginBottom: 16 }}>
                Últimos programas emitidos
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }}>
                <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 16 }}>
                  {completed.map((video) => (
                    <Pressable
                      key={video.id}
                      onPress={() => Linking.openURL(video.videoUrl)}
                      style={({ pressed }) => ({ width: 160, opacity: pressed ? 0.85 : 1 })}
                    >
                      <View style={{ position: 'relative', marginBottom: 8 }}>
                        <ImageFallback
                          source={video.thumbnailUrl}
                          style={{ width: 160, height: 90, borderRadius: 12 }}
                        />
                        <View style={styles.playOverlay}>
                          <PlayCircle size={32} color="#fff" />
                        </View>
                        {!!video.durationSeconds && (
                          <View style={styles.duration}>
                            <Text style={{ color: '#fff', fontSize: 10 }}>
                              {formatDuration(video.durationSeconds)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        numberOfLines={2}
                        style={{ color: theme.textPrimary, fontSize: 13, fontWeight: '700' }}
                      >
                        {video.title}
                      </Text>
                      <Text style={{ color: theme.textTertiary, fontSize: 11, marginTop: 4 }}>
                        {format(new Date(video.publishedAt), "d MMM · HH:mm", { locale: es })}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          <Text
            style={{
              fontWeight: '700',
              fontSize: 18,
              color: theme.textPrimary,
              marginTop: completed.length > 0 ? 32 : 0,
              marginBottom: 16,
            }}
          >
            Próximamente hoy
          </Text>
          {DAILY_SCHEDULE.map((entry, idx) => {
            const reminderOn = !!notifications.programReminders?.[entry.id];
            const isLast = idx === DAILY_SCHEDULE.length - 1;
            return (
              <View
                key={entry.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: theme.borderDefault,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.accentPrimary,
                      fontSize: 13,
                      fontWeight: '700',
                      marginBottom: 2,
                    }}
                  >
                    {entry.time}
                  </Text>
                  <Text
                    style={{
                      color: theme.textPrimary,
                      fontSize: 16,
                      fontWeight: '700',
                      marginBottom: 2,
                    }}
                  >
                    {entry.name}
                  </Text>
                  <Text style={{ color: theme.textTertiary, fontSize: 13 }}>
                    con {entry.host}
                  </Text>
                </View>
                <Pressable
                  onPress={() => toggleProgramReminder(entry.id)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: reminderOn
                        ? `${theme.accentPrimary}20`
                        : theme.bgSecondary,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    reminderOn ? `Quitar recordatorio de ${entry.name}` : `Recordarme ${entry.name}`
                  }
                >
                  {reminderOn ? (
                    <Check size={18} color={theme.accentPrimary} />
                  ) : (
                    <Bell size={18} color={theme.textSecondary} />
                  )}
                </Pressable>
              </View>
            );
          })}

          {upcoming.length > 0 && (
            <>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 18,
                  color: theme.textPrimary,
                  marginTop: 32,
                  marginBottom: 16,
                }}
              >
                Próximas transmisiones
              </Text>
              {upcoming.map((video) => (
                <Pressable
                  key={video.id}
                  onPress={() => Linking.openURL(video.videoUrl)}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      gap: 12,
                      paddingBottom: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.borderDefault,
                      marginBottom: 16,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <ImageFallback
                    source={video.thumbnailUrl}
                    style={{ width: 96, height: 56, borderRadius: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Radio size={14} color={theme.accentPrimary} />
                      <Text
                        style={{ color: theme.accentPrimary, fontWeight: '700', fontSize: 11, letterSpacing: 1 }}
                      >
                        PRÓXIMAMENTE
                      </Text>
                    </View>
                    <Text
                      numberOfLines={2}
                      style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 14 }}
                    >
                      {video.title}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LivePingDot({ color, active }: { color: string; active: boolean }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!active) {
      scale.setValue(0.8);
      opacity.setValue(0.4);
      return;
    }
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 2.2,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, scale, opacity]);

  return (
    <View style={{ width: 8, height: 8, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          transform: [{ scale }],
          opacity,
        }}
      />
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: active ? color : '#999',
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoBox: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', position: 'relative' },
  subscribeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FF0000',
  },
  subscribeIconBox: {
    width: 22,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  openYtBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  liveDot: { width: 12, height: 12, borderRadius: 6 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: { flex: 1, alignItems: 'center', gap: 6 },
  actionCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  duration: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
