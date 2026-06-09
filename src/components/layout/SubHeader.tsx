import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/theme/tokens';

interface Props {
  title: string;
  rightActionLabel?: string;
  onRightAction?: () => void;
}

export function SubHeader({ title, rightActionLabel, onRightAction }: Props) {
  const theme = useTheme();
  const router = useRouter();
  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.bgPrimary, borderBottomColor: theme.borderDefault },
      ]}
    >
      <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
        <ArrowLeft size={24} color={theme.textPrimary} />
      </Pressable>
      <Text style={{ flex: 1, marginLeft: 8, fontSize: 18, fontWeight: '500', color: theme.textPrimary }}>
        {title}
      </Text>
      {rightActionLabel && (
        <Pressable onPress={onRightAction}>
          <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '500' }}>{rightActionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
});
