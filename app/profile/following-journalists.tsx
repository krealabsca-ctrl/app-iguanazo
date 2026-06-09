import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { SubHeader } from '@/components/layout/SubHeader';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { useTheme } from '@/theme/tokens';
import { useFollowStore } from '@/store/useFollowStore';
import { useArticlesStore } from '@/store/useArticlesStore';
import { findJournalist } from '@/utils/journalistRegistry';

export default function FollowingJournalists() {
  const theme = useTheme();
  const router = useRouter();
  const { followedJournalists, toggleJournalist } = useFollowStore();
  const byId = useArticlesStore((s) => s.byId);
  const loadArticles = useArticlesStore((s) => s.load);
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);
  const list = followedJournalists
    .map((id) => findJournalist(id, byId))
    .filter((j): j is NonNullable<typeof j> => Boolean(j));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgSecondary }}>
      <SubHeader title="Periodistas que sigo" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200, gap: 16 }}>
        {list.length === 0 && (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            Aún no sigues a ningún periodista.
          </Text>
        )}
        {list.map((j) => (
          <Pressable
            key={j.id}
            onPress={() => router.push(`/journalist/${j.id}`)}
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
            <ImageFallback source={j.avatarUrl} style={{ width: 56, height: 56, borderRadius: 28 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15 }}>{j.name}</Text>
              <Text style={{ color: theme.textTertiary, fontSize: 13 }}>{j.role}</Text>
            </View>
            <Pressable
              onPress={() => toggleJournalist(j.id)}
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
