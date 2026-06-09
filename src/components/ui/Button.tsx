import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme, radius } from '@/theme/tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  onPress,
  children,
  style,
  disabled,
}: ButtonProps) {
  const theme = useTheme();

  const bg =
    variant === 'primary'
      ? theme.pearl
      : variant === 'secondary'
        ? theme.bgTertiary
        : 'transparent';
  const border =
    variant === 'primary' ? theme.pearlBorder : variant === 'secondary' ? theme.bgTertiary : 'transparent';
  const textColor =
    variant === 'primary' ? theme.primary : theme.textPrimary;

  const dims =
    size === 'sm'
      ? { paddingHorizontal: 12, height: 32, fontSize: 13 }
      : size === 'lg'
        ? { paddingHorizontal: 32, height: 52, fontSize: 17 }
        : { paddingHorizontal: 16, height: 40, fontSize: 15 };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: border,
          height: dims.height,
          paddingHorizontal: dims.paddingHorizontal,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          width: size === 'lg' ? '100%' : undefined,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[{ color: textColor, fontSize: dims.fontSize, fontWeight: '500' }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
