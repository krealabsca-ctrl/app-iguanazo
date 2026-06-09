import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Bell, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/tokens';
import { useNotificationStore } from '@/store/useNotificationStore';

interface Props {
  showBack?: boolean;
  title?: string;
}

export function MainHeader({ showBack, title }: Props) {
  const router = useRouter();
  const theme = useTheme();
  const unread = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.bgPrimary, borderBottomColor: theme.borderDefault },
      ]}
    >
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4, marginRight: 8 })}
          >
            <ArrowLeft size={24} color={theme.textPrimary} />
          </Pressable>
        ) : null}
        {title ? (
          <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <Image
            source={require('../../../assets/images/header.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.right}>
        <Pressable
          onPress={() => router.push('/notifications')}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
        >
          <Bell size={22} color={theme.textPrimary} />
          {unread > 0 && (
            <View
              style={[styles.dot, { backgroundColor: theme.accentPrimary, borderColor: theme.bgPrimary }]}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 80,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 8, overflow: 'hidden' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  logo: { height: 106, width: 230, marginLeft: -20},
  title: { fontSize: 17, fontWeight: '700' },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});
