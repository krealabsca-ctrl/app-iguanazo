import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/tokens';

export function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onChange}
      style={[
        styles.track,
        {
          backgroundColor: checked ? theme.primary : theme.bgTertiary,
        },
      ]}
    >
      <View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: checked ? 20 : 0 }],
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
