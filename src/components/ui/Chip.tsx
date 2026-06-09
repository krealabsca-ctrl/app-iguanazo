import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme, radius } from '@/theme/tokens';

interface ChipProps {
  variant?: 'default' | 'active' | 'category';
  color?: string;
  onPress?: () => void;
  children: string;
  style?: StyleProp<ViewStyle>;
  uppercase?: boolean;
}

export function Chip({ variant = 'default', color, onPress, children, style, uppercase }: ChipProps) {
  const theme = useTheme();
  const isCategory = variant === 'category';
  const isActive = variant === 'active';

  const bg = isCategory
    ? color || theme.accentPrimary
    : isActive
      ? theme.pearl
      : 'transparent';
  const borderColor = isCategory ? 'transparent' : isActive ? theme.pearlBorder : theme.borderDefault;
  const textColor = isCategory ? '#FFFFFF' : isActive ? theme.primary : theme.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: bg, borderColor, transform: [{ scale: pressed ? 0.95 : 1 }] },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor, textTransform: uppercase ? 'uppercase' : 'none' },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.chip,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
