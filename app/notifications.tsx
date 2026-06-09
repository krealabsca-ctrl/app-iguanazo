import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, BookOpen, Trophy } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/tokens';
import { useNotificationStore } from '@/store/useNotificationStore';
import {
  useActivityStatsStore,
  formatListenTime,
} from '@/store/useActivityStatsStore';

export default function Notifications() {
  const theme = useTheme();
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const hasUnread = notifications.some((n) => !n.read);

  const articleIdsToday = useActivityStatsStore((s) => s.articleIdsToday);
  const listenSecondsToday = useActivityStatsStore((s) => s.listenSecondsToday);
  const rolloverIfNeeded = useActivityStatsStore((s) => s.rolloverIfNeeded);

  // Asegura que si pasó la medianoche, los contadores se reseteen al abrir esta pantalla.
  useEffect(() => {
    rolloverIfNeeded();
  }, [rolloverIfNeeded]);

  const articlesReadCount = articleIdsToday.length;
  const listenLabel = formatListenTime(listenSecondsToday);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgSecondary }}>
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
          Notificaciones
        </Text>
        {hasUnread && (
          <Pressable onPress={markAllAsRead}>
            <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '500' }}>Marcar leídas</Text>
          </Pressable>
        )}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200, gap: 12 }}>
        <View
          style={{
            backgroundColor: theme.bgPrimary,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.borderDefault,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginBottom: 4,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${theme.primary}1A`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <BookOpen size={22} color={theme.primary} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: theme.textPrimary, fontFamily: 'OpenSans_700Bold' }}>
              {articlesReadCount}
            </Text>
            <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600', letterSpacing: 1, marginTop: 2 }}>
              {articlesReadCount === 1 ? 'Artículo hoy' : 'Artículos hoy'}
            </Text>
          </View>
          <View style={{ width: 1, height: 56, backgroundColor: theme.borderDefault }} />
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: `${theme.accentHighlight}1A`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <Trophy size={22} color={theme.accentHighlight} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: theme.textPrimary, fontFamily: 'OpenSans_700Bold' }}>
              {listenLabel}
            </Text>
            <Text style={{ fontSize: 11, color: theme.textSecondary, fontWeight: '600', letterSpacing: 1, marginTop: 2 }}>
              Escuchadas hoy
            </Text>
          </View>
        </View>
        {notifications.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80, opacity: 0.5 }}>
            <Bell size={48} color={theme.textTertiary} />
            <Text style={{ marginTop: 16, color: theme.textSecondary }}>No tienes notificaciones</Text>
          </View>
        ) : (
          notifications.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => {
                markAsRead(n.id);
                if (n.link) {
                  router.push(n.link as any);
                }
              }}
            >
              <Card
                style={[
                  { padding: 16 },
                  !n.read && { borderLeftWidth: 4, borderLeftColor: theme.primary },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color:
                        n.type === 'breaking'
                          ? theme.accentPrimary
                          : n.type === 'live'
                            ? theme.primary
                            : theme.textTertiary,
                    }}
                  >
                    {n.title}
                  </Text>
                  <Text style={{ fontSize: 10, color: theme.textTertiary }}>{n.time}</Text>
                </View>
                <Text style={{ color: theme.textPrimary, fontSize: 14, lineHeight: 20 }}>{n.body}</Text>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
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
