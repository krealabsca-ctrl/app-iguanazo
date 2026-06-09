import React from 'react';
import { View, Text, ScrollView, Image, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubHeader } from '@/components/layout/SubHeader';
import { useTheme } from '@/theme/tokens';

export default function AboutSettings() {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgSecondary }}>
      <SubHeader title="Acerca de Laiguana.tv" />
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', paddingBottom: 200 }}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 120, height: 120, marginVertical: 24 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 24, fontWeight: '700', color: theme.textPrimary, marginBottom: 8 }}>
          Laiguana.tv
        </Text>
        <Text style={{ fontSize: 13, color: theme.textTertiary, marginBottom: 24 }}>Versión 1.0.0</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 15, lineHeight: 24, textAlign: 'center', paddingHorizontal: 16 }}>
          Laiguana.tv es un medio multiplataforma venezolano comprometido con la verdad. Análisis,
          opinión y la noticia con contexto, las 24 horas del día.
        </Text>
        <Pressable
          onPress={() => Linking.openURL('https://laiguana.tv')}
          style={({ pressed }) => ({
            backgroundColor: theme.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 999,
            marginTop: 32,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Visitar sitio web</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
