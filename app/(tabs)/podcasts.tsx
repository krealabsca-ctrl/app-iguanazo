import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

import { MainHeader } from '@/components/layout/MainHeader';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { YoutubeMissingKey } from '@/components/youtube/YoutubeMissingKey';
import { useTheme, radius } from '@/theme/tokens';
import { useYoutubeStore } from '@/store/useYoutubeStore';

// Manual priority order. Titles are matched by case/accent-insensitive regex
// so small variations on YouTube (capitalisation, accents) still get the
// expected position. Unknown playlists are appended in their original order.
const PODCAST_ORDER: RegExp[] = [
  /mediod[ií]as.*iguana/i,
  /cara\s*a\s*cara/i,
  /tubazos/i,
  /podcast.*econom[ií]a|econom[ií]a.*podcast/i,
  /esto\s*no\s*es\s*un\s*misil/i,
  /real\s*pol[ií]ti(k|ca)?/i,
  /mapa\s*de\s*conflicto/i,
  /el\s*sof[áa]/i,
  /chamo.*pelo\s*azul/i,
];

function getPodcastPriority(title: string): number {
  for (let i = 0; i < PODCAST_ORDER.length; i++) {
    if (PODCAST_ORDER[i].test(title)) return i;
  }
  return PODCAST_ORDER.length;
}

export default function PodcastsLibrary() {
  const theme = useTheme();
  const router = useRouter();
  const configured = useYoutubeStore((s) => s.configured);
  const playlists = useYoutubeStore((s) => s.playlists);
  const playlistsStatus = useYoutubeStore((s) => s.playlistsStatus);
  const playlistsError = useYoutubeStore((s) => s.playlistsError);
  const loadPlaylists = useYoutubeStore((s) => s.loadPlaylists);

  useEffect(() => {
    if (configured) loadPlaylists();
  }, [configured, loadPlaylists]);

  if (!configured) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
        <MainHeader />
        <YoutubeMissingKey title="Podcasts necesita acceso a YouTube" />
      </SafeAreaView>
    );
  }

  const isInitialLoading = playlistsStatus === 'loading' && playlists.length === 0;
  const hasError = playlistsStatus === 'error' && playlists.length === 0;

  const orderedPlaylists = React.useMemo(() => {
    return [...playlists]
      .map((p, idx) => ({ p, priority: getPodcastPriority(p.title || ''), idx }))
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.idx - b.idx;
      })
      .map((x) => x.p);
  }, [playlists]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <MainHeader />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 200 }}
        refreshControl={
          <RefreshControl
            refreshing={playlistsStatus === 'loading' && playlists.length > 0}
            onRefresh={() => loadPlaylists(true)}
            tintColor={theme.textTertiary}
          />
        }
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: theme.textPrimary,
              fontFamily: 'OpenSans_700Bold',
              lineHeight: 36,
            }}
          >
            Podcasts
          </Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary, marginTop: 4 }}>
            Análisis y opinión, on-demand.
          </Text>
        </View>

        {isInitialLoading && (
          <View style={{ paddingTop: 60, alignItems: 'center', gap: 12 }}>
            <ActivityIndicator color={theme.accentPrimary} />
            <Text style={{ color: theme.textSecondary }}>Cargando podcasts…</Text>
          </View>
        )}

        {hasError && (
          <View style={{ paddingHorizontal: 20, paddingTop: 32, alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 32 }}>⚠️</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '600', textAlign: 'center' }}>
              No pudimos cargar los podcasts
            </Text>
            {!!playlistsError && (
              <Text style={{ color: theme.textTertiary, fontSize: 12, textAlign: 'center' }}>
                {playlistsError}
              </Text>
            )}
            <Pressable
              onPress={() => loadPlaylists(true)}
              style={({ pressed }) => ({
                marginTop: 8,
                backgroundColor: theme.textPrimary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 999,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: theme.bgPrimary, fontWeight: '700', fontSize: 14 }}>Reintentar</Text>
            </Pressable>
          </View>
        )}

        {orderedPlaylists.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
            {orderedPlaylists.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/programs/${p.id}`)}
                style={({ pressed }) => [
                  styles.programRow,
                  { borderBottomColor: theme.borderDefault, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <ImageFallback source={p.thumbnailUrl} style={styles.programThumb} />
                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 17, marginBottom: 4 }}
                  >
                    {p.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                      {p.itemCount} {p.itemCount === 1 ? 'episodio' : 'episodios'}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={`${theme.textTertiary}80`} />
              </Pressable>
            ))}
          </View>
        )}

        {playlistsStatus === 'success' && playlists.length === 0 && (
          <View style={{ paddingTop: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginBottom: 12 }}>🎙️</Text>
            <Text style={{ color: theme.textSecondary, textAlign: 'center', paddingHorizontal: 24 }}>
              El canal aún no publicó playlists.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  programThumb: { width: 64, height: 64, borderRadius: radius.card },
});
