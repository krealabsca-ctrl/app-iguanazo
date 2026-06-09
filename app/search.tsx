import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ArrowLeft } from 'lucide-react-native';

import { ImageFallback } from '@/components/ui/ImageFallback';
import { useTheme, radius } from '@/theme/tokens';
import { mockJournalists } from '@/api/mocks';
import { useArticlesStore } from '@/store/useArticlesStore';

export default function SearchHome() {
  const theme = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const articles = useArticlesStore((s) => s.articles);
  const articlesAll = useArticlesStore((s) => s.articlesAll);
  const byId = useArticlesStore((s) => s.byId);

  const results = useMemo(() => {
    if (query.trim().length === 0) return [];
    const q = query.toLowerCase();
    const pool = Object.values(byId).length > 0 ? Object.values(byId) : articlesAll.length > 0 ? articlesAll : articles;
    return pool.filter(
      (a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q),
    );
  }, [query, articles, articlesAll, byId]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          padding: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderDefault,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </Pressable>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: theme.pearl, borderColor: theme.pearlBorder },
          ]}
        >
          <Search size={18} color={theme.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar noticias, temas..."
            placeholderTextColor={theme.textTertiary}
            style={{ flex: 1, color: theme.textPrimary, fontSize: 15 }}
            autoFocus
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200 }}>
        {query.length > 0 ? (
          results.length > 0 ? (
            results.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => router.push(`/article/${a.id}`)}
                style={({ pressed }) => ({ flexDirection: 'row', gap: 16, marginBottom: 16, opacity: pressed ? 0.8 : 1 })}
              >
                <ImageFallback source={a.imageUrl} style={{ width: 80, height: 80, borderRadius: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={{ color: theme.textPrimary, fontWeight: '500', fontSize: 15 }}>
                    {a.title}
                  </Text>
                  <Text style={{ color: a.category.color, fontSize: 11, marginTop: 4, fontWeight: '700' }}>
                    {a.category.name.toUpperCase()}
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: theme.textTertiary, marginTop: 40 }}>
              No se encontraron resultados
            </Text>
          )
        ) : (
          <>
            <Section title="Tendencias hoy" theme={theme}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['Venezuela', 'Esequibo', 'BRICS', 'Dólar', 'EEUU'].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setQuery(t)}
                    style={[styles.trendChip, { borderColor: theme.borderDefault }]}
                  >
                    <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </Section>

            <Section title="Voces destacadas" theme={theme}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  {mockJournalists.slice(0, 5).map((j) => (
                    <Pressable
                      key={j.id}
                      onPress={() => router.push(`/journalist/${j.id}`)}
                      style={{ width: 100, alignItems: 'center', gap: 8 }}
                    >
                      <ImageFallback source={j.avatarUrl} style={{ width: 64, height: 64, borderRadius: 32 }} />
                      <Text numberOfLines={2} style={{ color: theme.textPrimary, fontSize: 13, textAlign: 'center', fontWeight: '500' }}>
                        {j.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </Section>

            <Section title="Explorar categorías" theme={theme}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {['Política', 'Economía', 'Análisis', 'Cultura', 'Sucesos', 'Deportes'].map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setQuery(c)}
                    style={{
                      width: '48%',
                      backgroundColor: theme.pearl,
                      borderColor: theme.pearlBorder,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingVertical: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: theme.primary, fontWeight: '500', fontSize: 15 }}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </Section>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, theme }: any) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: theme.textPrimary, marginBottom: 12 }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  trendChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
});
