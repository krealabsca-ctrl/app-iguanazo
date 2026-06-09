import React from 'react';
import { ImageStyle, StyleProp } from 'react-native';
import { ImageFallback } from './ImageFallback';

interface AvatarProps {
  source?: string | null;
  size?: 'sm' | 'md' | 'lg' | number;
  style?: StyleProp<ImageStyle>;
}

export function Avatar({ source, size = 'md', style }: AvatarProps) {
  const dim = typeof size === 'number' ? size : size === 'sm' ? 32 : size === 'lg' ? 64 : 48;
  return (
    <ImageFallback
      source={source ?? undefined}
      style={[{ width: dim, height: dim, borderRadius: dim / 2 }, style as object]}
    />
  );
}
