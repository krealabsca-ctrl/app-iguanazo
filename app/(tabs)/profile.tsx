import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Bookmark,
  Headphones,
  Users,
  Radio,
  Bell,
  Moon,
  Languages,
  Info,
  Heart,
  ChevronRight,
  PlayCircle,
  Mic,
  FolderHeart,
  Clock,
} from 'lucide-react-native';

import { useTheme, radius } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePulsoStore } from '@/store/usePulsoStore';
import { useUserStore } from '@/store/useUserStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useIguanazoStore } from '@/store/useIguanazoStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useFollowStore } from '@/store/useFollowStore';
import { useFollowingStore } from '@/store/useFollowingStore';

export default function Profile() {
  const theme = useTheme();
  const router = useRouter();
  const themeMode = useSettingsStore((s) => s.theme);
  const playPulso = usePulsoStore((s) => s.playPulso);
  const { userName, userImage } = useUserStore();
  const authUser = useAuthStore((s) => s.user);
  const savedCount = useIguanazoStore((s) => s.savedArticles.length);
  const historyCount = useHistoryStore((s) => s.history.length);
  const followedJournalistsCount = useFollowStore((s) => s.followedJournalists.length);
  const followedProgramsCount = useFollowStore((s) => s.followedPrograms.length);
  const followedTopicsCount = useFollowingStore((s) => s.topics.length);

  const initial = (userName || authUser?.name || 'U').charAt(0).toUpperCase();
  const providerLabel = authUser?.provider ? `Conectado con ${authUser.provider}` : 'Cuenta local';

  const items: { icon: any; label: string; route?: string; href?: string; highlight?: boolean }[] = [
    { icon: Bookmark, label: 'Favoritos', route: '/profile/favorites' },
    { icon: Headphones, label: 'Lista de lectura', route: '/profile/reading-list' },
    { icon: Users, label: 'Periodistas que sigo', route: '/profile/following-journalists' },
    { icon: Radio, label: 'Podcasts que sigo', route: '/profile/following-programs' },
    { icon: Bell, label: 'Notificaciones', route: '/profile/notifications' },
    {
      icon: Moon,
      label: `Apariencia · ${themeMode === 'dark' ? 'Oscuro' : themeMode === 'light' ? 'Claro' : 'Sistema'}`,
      route: '/profile/appearance',
    },
    { icon: Languages, label: 'Idioma', route: '/profile/language' },
    { icon: Info, label: 'Acerca de Laiguana.tv', route: '/profile/about' },
    { icon: Heart, label: 'Apoyar a Laiguana', highlight: true, href: 'https://laiguana.tv' },
  ];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        {/* Hero Banner rojo con avatar superpuesto (estilo rediseño) */}
        <View style={{ position: 'relative', marginBottom: 60 }}>
          <View style={{ height: 140, width: '100%', backgroundColor: theme.primary }} />
          <View
            style={{
              position: 'absolute',
              bottom: -48,
              left: '50%',
              marginLeft: -48,
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 4,
              borderColor: theme.bgPrimary,
              backgroundColor: theme.bgSecondary,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {userImage ? (
              <Image source={{ uri: userImage }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text
                style={{
                  color: theme.textPrimary,
                  fontSize: 36,
                  fontWeight: '700',
                  fontFamily: 'OpenSans_700Bold',
                }}
              >
                {initial}
              </Text>
            )}
          </View>
        </View>

        {/* Nombre + correo + pill provider */}
        <View style={{ paddingHorizontal: 20, alignItems: 'center', marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: theme.textPrimary,
              fontFamily: 'OpenSans_700Bold',
              marginBottom: 2,
            }}
          >
            {userName || authUser?.name || 'Usuario'}
          </Text>
          {!!authUser?.email && (
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 12 }}>
              {authUser.email}
            </Text>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: theme.bgSecondary,
              borderWidth: 1,
              borderColor: theme.borderDefault,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: theme.primary,
              }}
            />
            <Text style={{ fontSize: 12, color: theme.textTertiary, fontWeight: '500' }}>
              {providerLabel}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: theme.borderDefault,
              borderRadius: 8,
              paddingHorizontal: 32,
              paddingVertical: 10,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 14 }}>
              Editar perfil
            </Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            paddingHorizontal: 20,
            marginBottom: 32,
          }}
        >
          {[
            { v: savedCount, l: 'GUARDADOS' },
            { v: historyCount, l: 'LEÍDAS' },
            { v: followedTopicsCount, l: 'TEMAS' },
          ].map((s, i) => (
            <React.Fragment key={s.l}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: theme.textPrimary,
                    fontFamily: 'OpenSans_700Bold',
                  }}
                >
                  {s.v}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: theme.textTertiary,
                    fontWeight: '700',
                    letterSpacing: 1,
                    marginTop: 4,
                  }}
                >
                  {s.l}
                </Text>
              </View>
              {i < 2 && (
                <View style={{ width: 1, height: 32, backgroundColor: theme.borderDefault }} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Divisor de sección */}
        <View style={{ height: 8, backgroundColor: theme.bgSecondary, marginBottom: 24 }} />

        {/* Mi actividad — íconos con color de fondo (estilo rediseño) */}
        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: theme.textPrimary,
              fontFamily: 'OpenSans_700Bold',
              marginBottom: 12,
            }}
          >
            Mi actividad
          </Text>
          {[
            {
              icon: Bookmark,
              color: theme.primary,
              title: 'Iguanazos guardados',
              desc: `${savedCount} artículos en tu colección`,
              route: '/(tabs)/iguanazo',
            },
            {
              icon: Users,
              color: '#0891B2',
              title: 'Periodistas que sigo',
              desc: `${followedJournalistsCount} columnistas`,
              route: '/profile/following-journalists',
            },
            {
              icon: Mic,
              color: theme.accentSecondary,
              title: 'Podcasts seguidos',
              desc: `${followedProgramsCount} podcasts`,
              route: '/profile/following-programs',
            },
            {
              icon: FolderHeart,
              color: '#7C3AED',
              title: 'Secciones de interés',
              desc: `${followedTopicsCount} temas activos`,
              route: '/(tabs)/iguanazo',
            },
            {
              icon: Clock,
              color: theme.accentHighlight,
              title: 'Historial de lectura',
              desc: `${historyCount} artículos`,
              route: '/(tabs)/iguanazo',
              last: true,
            },
          ].map((it: any, i) => {
            const Icon = it.icon;
            return (
              <Pressable
                key={i}
                onPress={() => router.push(it.route as any)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingVertical: 12,
                  borderBottomWidth: it.last ? 0 : 1,
                  borderBottomColor: theme.borderDefault,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: `${it.color}1A`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} color={it.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, color: theme.textPrimary, fontWeight: '500' }}>
                    {it.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>
                    {it.desc}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.textTertiary} />
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 8, backgroundColor: theme.bgSecondary, marginVertical: 24 }} />

        <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>

        <Pressable
          onPress={playPulso}
          style={({ pressed }) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              marginBottom: 32,
              backgroundColor: theme.accentPrimary,
              borderRadius: 12,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 22 }}>☕</Text>
            <View>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                Escuchar resumen de noticias
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' }}>
                5 noticias en 2 minutos
              </Text>
            </View>
          </View>
          <PlayCircle size={28} color="#fff" />
        </Pressable>

        <View style={{ gap: 4 }}>
          {items.map((item, idx) => {
            const Icon = item.icon;
            const onPress = () => {
              if (item.href) Linking.openURL(item.href);
              else if (item.route) router.push(item.route as any);
            };
            return (
              <Pressable
                key={idx}
                onPress={onPress}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: item.highlight ? theme.pearl : 'transparent',
                    borderColor: item.highlight ? theme.pearlBorder : 'transparent',
                    borderWidth: item.highlight ? 1 : 0,
                    marginTop: item.highlight ? 16 : 0,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Icon size={22} color={item.highlight ? theme.accentPrimary : theme.textSecondary} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: '500',
                    color: item.highlight ? theme.primary : theme.textPrimary,
                  }}
                >
                  {item.label}
                </Text>
                <ChevronRight size={18} color={theme.textTertiary} />
              </Pressable>
            );
          })}
        </View>

        </View>

        <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 24, borderTopWidth: 1, borderTopColor: theme.borderDefault, marginTop: 8 }}>
          <Text style={{ fontSize: 12, color: theme.textTertiary, fontWeight: '500' }}>
            Laiguana App v1.0.0
          </Text>
          <Text style={{ fontSize: 11, color: theme.textTertiary, marginTop: 4 }}>
            Hecho desde Venezuela
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    borderRadius: radius.card,
  },
});
