import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/tokens';

type Variant = 'live' | 'breaking' | 'new' | 'error';

export function Badge({
  children,
  variant = 'new',
  dot = false,
}: {
  children: string;
  variant?: Variant;
  dot?: boolean;
}) {
  const theme = useTheme();
  const bg =
    variant === 'live' || variant === 'breaking' || variant === 'error'
      ? theme.accentPrimary
      : theme.accentSecondary;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {dot && <View style={styles.dot} />}
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
