import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme, radius } from '@/theme/tokens';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
}

export function Card({ variant = 'default', style, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: variant === 'default' ? theme.bgSecondary : theme.bgPrimary,
        },
        variant === 'elevated' && styles.elevated,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
