import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { SubHeader } from '@/components/layout/SubHeader';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { useTheme } from '@/theme/tokens';
import { useFollowStore } from '@/store/useFollowStore';
import { useYoutubeStore } from '@/store/useYoutubeStore';

export default function FollowingPrograms() {
  const theme = useTheme();
  const router = useRouter();
  const { followedPrograms, toggleProgram } = useFollowStore();
  const playlists = useYoutubeStore((s) => s.playlists);
  const loadPlaylists = useYoutubeStore((s) => s.loadPlaylists);
  const ytConfigured = useYoutubeStore((s) => s.configured);
  useEffect(() => {
    if (ytConfigured) loadPlaylists();
  }, [ytConfigured, loadPlaylists]);
  const list = playlists.filter((p) => followedPrograms.includes(p.id));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgSecondary }}>
      <SubHeader title="Podcasts que sigo" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200, gap: 16 }}>
        {list.length === 0 && (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            Aún no sigues ningún podcast.
          </Text>
        )}
        {list.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => router.push(`/programs/${p.id}`)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              backgroundColor: theme.bgPrimary,
              padding: 12,
              borderRadius: 12,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <ImageFallback source={p.thumbnailUrl} style={{ width: 56, height: 56, borderRadius: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15 }} numberOfLines={2}>
                {p.title}
              </Text>
              <Text style={{ color: theme.textTertiary, fontSize: 13 }}>
                {p.itemCount} {p.itemCount === 1 ? 'episodio' : 'episodios'}
              </Text>
            </View>
            <Pressable
              onPress={() => toggleProgram(p.id)}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: theme.borderDefault }}
            >
              <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '700' }}>Dejar</Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
