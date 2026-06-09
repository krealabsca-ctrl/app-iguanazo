import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bookmark } from 'lucide-react-native';

import { SubHeader } from '@/components/layout/SubHeader';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/tokens';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useArticlesStore } from '@/store/useArticlesStore';

export default function Favorites() {
  const theme = useTheme();
  const router = useRouter();
  const { favorites } = useFavoritesStore();
  const byId = useArticlesStore((s) => s.byId);
  const list = favorites.map((id) => byId[id]).filter(Boolean);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgSecondary }}>
      <SubHeader title="Favoritos" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200, gap: 16 }}>
        {list.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80, opacity: 0.5 }}>
            <Bookmark size={48} color={theme.textTertiary} />
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 16, paddingHorizontal: 16 }}>
              Aún no tenés favoritos. Tocá el ícono de bookmark en cualquier artículo para guardarlo aquí.
            </Text>
          </View>
        ) : (
          list.map((a) => (
            <Pressable key={a.id} onPress={() => router.push(`/article/${a.id}`)}>
              <Card style={{ flexDirection: 'row', padding: 12, gap: 12 }}>
                <ImageFallback source={a.imageUrl} style={{ width: 96, height: 96, borderRadius: 8 }} />
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ color: theme.textTertiary, fontSize: 11, fontWeight: '500', letterSpacing: 1, marginBottom: 4 }}>
                    {a.category.name.toUpperCase()}
                  </Text>
                  <Text numberOfLines={3} style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 15 }}>
                    {a.title}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
