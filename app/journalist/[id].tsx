import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, Plus } from 'lucide-react-native';

import { ImageFallback } from '@/components/ui/ImageFallback';
import { useTheme } from '@/theme/tokens';
import { mockJournalists } from '@/api/mocks';
import { useArticlesStore } from '@/store/useArticlesStore';
import { useFollowStore } from '@/store/useFollowStore';
import { Card } from '@/components/ui/Card';

export default function JournalistProfile() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const byId = useArticlesStore((s) => s.byId);
  const allArticles = React.useMemo(() => Object.values(byId), [byId]);
  const journalist =
    mockJournalists.find((j) => j.id === id) ||
    allArticles.find((a) => a.author.id === id)?.author;
  const articles = allArticles.filter((a) => a.author.id === id);
  const { isFollowingJournalist, toggleJournalist } = useFollowStore();

  if (!journalist) return null;

  const following = isFollowingJournalist(journalist.id);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <View style={[styles.header, { borderBottomColor: theme.borderDefault }]}>
        <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </Pressable>
        <Text style={{ marginLeft: 8, fontWeight: '600', fontSize: 15, color: theme.textPrimary }}>
          Perfil Periodista
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        <View style={{ alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: theme.borderDefault }}>
          <ImageFallback source={journalist.avatarUrl} style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 16 }} />
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: theme.textPrimary,
              marginBottom: 4,
              fontFamily: 'OpenSans_700Bold',
            }}
          >
            {journalist.name}
          </Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary, marginBottom: 24 }}>{journalist.role}</Text>
          <Pressable
            onPress={() => toggleJournalist(journalist.id)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 24,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              backgroundColor: following ? `${theme.accentSecondary}20` : theme.pearl,
              borderColor: following ? `${theme.accentSecondary}40` : theme.pearlBorder,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            {following ? <Check size={18} color={theme.accentSecondary} /> : <Plus size={18} color={theme.primary} />}
            <Text style={{ color: following ? theme.accentSecondary : theme.primary, fontWeight: '600', fontSize: 15 }}>
              {following ? 'Siguiendo' : 'Seguir'}
            </Text>
          </Pressable>
        </View>

        <View style={{ padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.textPrimary, marginBottom: 16 }}>
            Artículos recientes
          </Text>
          <View style={{ gap: 16 }}>
            {articles.map((a) => (
              <Pressable key={a.id} onPress={() => router.push(`/article/${a.id}`)}>
                <Card style={{ flexDirection: 'row', padding: 12, gap: 12 }}>
                  <ImageFallback source={a.imageUrl} style={{ width: 80, height: 80, borderRadius: 8 }} />
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text numberOfLines={2} style={{ fontWeight: '500', fontSize: 15, color: theme.textPrimary, marginBottom: 8 }}>
                      {a.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: theme.textTertiary }}>{a.category.name}</Text>
                  </View>
                </Card>
              </Pressable>
            ))}
            {articles.length === 0 && (
              <Text style={{ color: theme.textTertiary, textAlign: 'center', paddingVertical: 32 }}>
                Este periodista no ha publicado artículos recientes.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
});
