import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, PlayCircle, Check, Plus } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { ImageFallback } from '@/components/ui/ImageFallback';
import { useTheme } from '@/theme/tokens';
import { useFollowStore } from '@/store/useFollowStore';
import { useYoutubeStore } from '@/store/useYoutubeStore';
import { useEpisodePlayerStore } from '@/store/useEpisodePlayerStore';
import { useEpisodeProgressStore } from '@/store/useEpisodeProgressStore';
import { YoutubeVideo } from '@/api/youtube';
import { Episode } from '@/types';

function toEpisode(v: YoutubeVideo, playlistId: string): Episode {
  return {
    id: v.id,
    programId: playlistId,
    title: v.title,
    description: v.description,
    publishedAt: v.publishedAt,
    videoUrl: v.videoUrl,
    thumbnailUrl: v.thumbnailUrl,
    durationSeconds: v.durationSeconds ?? 0,
  };
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, '0')}m`;
}

export default function ProgramDetail() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const configured = useYoutubeStore((s) => s.configured);
  const playlists = useYoutubeStore((s) => s.playlists);
  const itemsByPlaylist = useYoutubeStore((s) => s.itemsByPlaylist);
  const itemsStatusByPlaylist = useYoutubeStore((s) => s.itemsStatusByPlaylist);
  const itemsErrorByPlaylist = useYoutubeStore((s) => s.itemsErrorByPlaylist);
  const loadPlaylists = useYoutubeStore((s) => s.loadPlaylists);
  const loadPlaylistItems = useYoutubeStore((s) => s.loadPlaylistItems);

  const { isFollowingProgram, toggleProgram } = useFollowStore();
  const playEpisode = useEpisodePlayerStore((s) => s.play);
  const { getProgress } = useEpisodeProgressStore();

  useEffect(() => {
    if (configured && playlists.length === 0) loadPlaylists();
  }, [configured, playlists.length, loadPlaylists]);

  useEffect(() => {
    if (configured && id) loadPlaylistItems(id);
  }, [configured, id, loadPlaylistItems]);

  const playlist = playlists.find((p) => p.id === id);
  const episodes = id ? itemsByPlaylist[id] || [] : [];
  const itemsStatus = id ? itemsStatusByPlaylist[id] : undefined;
  const itemsError = id ? itemsErrorByPlaylist[id] : undefined;
  const isLoading = itemsStatus === 'loading' && episodes.length === 0;

  const headerLabel = playlist?.title || 'Podcast';

  const renderTopBar = () => (
    <View style={[styles.playerBar, { paddingTop: insets.top + 10 }]}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        style={({ pressed }) => [styles.chevronBtn, { opacity: pressed ? 0.6 : 1 }]}
        accessibilityLabel="Cerrar"
      >
        <ChevronDown size={26} color={theme.textPrimary} />
      </Pressable>
      <View style={styles.playerBarTitleWrap}>
        <Text
          style={{
            color: theme.textTertiary,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 2,
            textAlign: 'center',
          }}
        >
          ESCUCHANDO
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: theme.textPrimary,
            fontSize: 13,
            fontWeight: '700',
            textAlign: 'center',
            marginTop: 2,
          }}
        >
          {headerLabel}
        </Text>
      </View>
      <View style={styles.chevronBtn} />
    </View>
  );

  if (!configured) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
        {renderTopBar()}
        <Text style={{ padding: 24, color: theme.textPrimary }}>
          Configurá la API key de YouTube para ver los podcasts.
        </Text>
      </View>
    );
  }

  const following = id ? isFollowingProgram(id) : false;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      {renderTopBar()}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
        refreshControl={
          <RefreshControl
            refreshing={itemsStatus === 'loading' && episodes.length > 0}
            onRefresh={() => id && loadPlaylistItems(id, true)}
            tintColor={theme.textTertiary}
          />
        }
      >
        <View
          style={{
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 32,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderDefault,
          }}
        >
          <ImageFallback
            source={playlist?.thumbnailUrl}
            style={{ width: 240, height: 240, borderRadius: 16, marginBottom: 24 }}
          />
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: theme.textPrimary,
              textAlign: 'center',
              marginBottom: 6,
              fontFamily: 'OpenSans_700Bold',
              lineHeight: 32,
            }}
          >
            {playlist?.title || 'Cargando…'}
          </Text>
          <Text
            style={{
              color: theme.textTertiary,
              fontSize: 13,
              fontWeight: '600',
              letterSpacing: 1,
              marginBottom: 20,
              textTransform: 'uppercase',
            }}
          >
            {playlist ? `${playlist.itemCount} ${playlist.itemCount === 1 ? 'episodio' : 'episodios'}` : ''}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
            <Pressable
              onPress={() => episodes[0] && id && playEpisode(toEpisode(episodes[0], id))}
              disabled={episodes.length === 0}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: theme.accentPrimary,
                borderRadius: 999,
                paddingVertical: 10,
                opacity: pressed || episodes.length === 0 ? 0.6 : 1,
              })}
            >
              <PlayCircle size={20} color="#fff" />
              <Text
                style={{ color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 }}
              >
                REPRODUCIR
              </Text>
            </Pressable>
            <Pressable
              onPress={() => id && toggleProgram(id)}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: following ? 'transparent' : theme.bgSecondary,
                borderWidth: 1,
                borderColor: following ? theme.borderDefault : theme.borderStrong,
                borderRadius: 999,
                paddingVertical: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              {following ? (
                <Check size={16} color={theme.textSecondary} />
              ) : (
                <Plus size={16} color={theme.textPrimary} />
              )}
              <Text
                style={{
                  color: following ? theme.textSecondary : theme.textPrimary,
                  fontWeight: '700',
                  fontSize: 14,
                  letterSpacing: 0.5,
                }}
              >
                {following ? 'SIGUIENDO' : 'SEGUIR'}
              </Text>
            </Pressable>
          </View>

          {!!playlist?.description && (
            <Text
              style={{ color: theme.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 24 }}
              numberOfLines={4}
            >
              {playlist.description}
            </Text>
          )}
        </View>

        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.textPrimary, marginBottom: 16 }}>
            Episodios
          </Text>

          {isLoading && (
            <View style={{ paddingVertical: 40, alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color={theme.accentPrimary} />
              <Text style={{ color: theme.textSecondary }}>Cargando episodios…</Text>
            </View>
          )}

          {itemsStatus === 'error' && (
            <View
              style={{
                padding: 16,
                borderWidth: 1,
                borderColor: theme.borderDefault,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 4 }}>
                No pudimos cargar los episodios
              </Text>
              {!!itemsError && (
                <Text style={{ color: theme.textTertiary, fontSize: 12 }}>{itemsError}</Text>
              )}
            </View>
          )}

          <View style={{ gap: 24 }}>
            {episodes.map((ep) => {
              const p = getProgress(ep.id);
              const total = ep.durationSeconds ?? 0;
              const percent = total > 0 ? Math.min(100, (p / total) * 100) : 0;
              const open = () => id && playEpisode(toEpisode(ep, id));
              return (
                <View
                  key={ep.id}
                  style={{ paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: theme.borderDefault }}
                >
                  <Pressable onPress={open}>
                    <View style={{ position: 'relative', marginBottom: 12 }}>
                      <ImageFallback
                        source={ep.thumbnailUrl}
                        style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 12 }}
                      />
                      <View pointerEvents="none" style={styles.playOverlay}>
                        <PlayCircle size={56} color="#fff" />
                      </View>
                    </View>
                    <Text style={{ fontWeight: '700', fontSize: 15, color: theme.textPrimary, marginBottom: 6 }}>
                      {ep.title}
                    </Text>
                    {!!ep.description && (
                      <Text
                        numberOfLines={2}
                        style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 12 }}
                      >
                        {ep.description}
                      </Text>
                    )}
                  </Pressable>
                  {percent > 0 && percent < 100 && (
                    <View
                      style={{
                        height: 4,
                        backgroundColor: theme.bgSecondary,
                        borderRadius: 2,
                        overflow: 'hidden',
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{ height: '100%', width: `${percent}%`, backgroundColor: theme.accentPrimary }}
                      />
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text
                      style={{
                        color: theme.textTertiary,
                        fontSize: 13,
                        fontWeight: '500',
                        textTransform: 'uppercase',
                      }}
                    >
                      {format(new Date(ep.publishedAt), 'd MMM yyyy', { locale: es })}
                      {ep.durationSeconds ? ` · ${formatDuration(ep.durationSeconds)}` : ''}
                    </Text>
                    <Pressable
                      onPress={open}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: theme.borderDefault,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <PlayCircle size={22} color={theme.textPrimary} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  playerBar: {
    paddingHorizontal: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerBarTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
});
