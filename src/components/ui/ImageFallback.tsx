import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageStyle, StyleProp } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { useTheme } from '@/theme/tokens';

interface Props {
  source?: string | number | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: ImageContentFit;
  transition?: number;
  accessibilityLabel?: string;
}

export function ImageFallback({
  source,
  style,
  contentFit = 'cover',
  transition = 200,
  accessibilityLabel,
}: Props) {
  const theme = useTheme();
  const [error, setError] = useState(false);

  if (error || !source) {
    return (
      <View style={[styles.fallback, { backgroundColor: theme.bgSecondary }, style as object]}>
        <ImageOff size={24} color={theme.textTertiary} />
        <Text style={[styles.fallbackText, { color: theme.textTertiary }]}>LAIGUANA</Text>
      </View>
    );
  }

  return (
    <Image
      source={typeof source === 'number' ? source : { uri: source }}
      style={style}
      contentFit={contentFit}
      transition={transition}
      onError={() => setError(true)}
      accessibilityLabel={accessibilityLabel}
      cachePolicy="memory-disk"
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 4,
  },
  fallbackText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.5,
  },
});
