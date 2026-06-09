import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Play } from 'lucide-react-native';
import { useTheme } from '@/theme/tokens';

export function YoutubeMissingKey({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.bgSecondary, borderColor: theme.borderDefault }]}>
      <View style={[styles.iconWrap, { backgroundColor: '#FF0000' }]}>
        <Play size={26} color="#fff" fill="#fff" />
      </View>
      <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 16, marginBottom: 6 }}>
        {title}
      </Text>
      <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 18, textAlign: 'center' }}>
        Falta configurar la API key de YouTube Data v3.{'\n'}
        Creá un archivo <Text style={{ fontWeight: '700' }}>.env</Text> en la raíz del proyecto con{' '}
        <Text style={{ fontWeight: '700' }}>EXPO_PUBLIC_YOUTUBE_API_KEY=tu_key</Text> y reiniciá
        Metro (<Text style={{ fontWeight: '700' }}>npx expo start --clear</Text>).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
