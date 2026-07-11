import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  User,
  Bell,
  Bookmark,
  Type,
  Globe,
  Moon,
  Sun,
  Shield,
  PlayCircle,
  Eye,
  HelpCircle,
  Star,
  FileText,
  Info,
  Globe2,
  X,
  ChevronRight,
  Mic,
} from 'lucide-react-native';

import { useTheme } from '@/theme/tokens';
import { useMenuStore } from '@/store/useMenuStore';
import { useSettingsStore, FontSize, ThemeMode } from '@/store/useSettingsStore';
import { useIguanazoStore } from '@/store/useIguanazoStore';
import { useFollowingStore } from '@/store/useFollowingStore';
import { useFollowStore } from '@/store/useFollowStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { usePulsoStore } from '@/store/usePulsoStore';
import { useUserStore } from '@/store/useUserStore';
import { Toggle } from '@/components/ui/Toggle';
import { KreaLabLogo } from '@/components/ui/KreaLabLogo';

// Versión de la app + contador de build (se incrementa en cada APK generado,
// ver scripts/bump-build.cjs). Se muestra al final del menú: "v1.0.0 (N)".
const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const BUILD_NUMBER = Number((Constants.expoConfig?.extra as { buildNumber?: number })?.buildNumber ?? 0);

export function MenuDrawer() {
  const theme = useTheme();
  const router = useRouter();
  const { isOpen, closeMenu } = useMenuStore();
  const { theme: themeMode, setTheme, fontSize, setFontSize } = useSettingsStore();
  const { isTrackingEnabled, setTrackingEnabled } = useHistoryStore();
  const getIguanazoCount = useIguanazoStore((s) => s.getCount);
  const { topics } = useFollowingStore();
  const { followedJournalists, followedPrograms } = useFollowStore();
  const { playPulso } = usePulsoStore();
  const { userName } = useUserStore();

  const followingCount = followedJournalists.length + followedPrograms.length + topics.length;

  const go = (path: string) => {
    closeMenu();
    router.push(path as any);
  };

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(themeMode) + 1) % order.length];
    setTheme(next);
  };
  const cycleFontSize = () => {
    const order: FontSize[] = ['small', 'normal', 'large', 'extra-large'];
    const next = order[(order.indexOf(fontSize) + 1) % order.length];
    setFontSize(next);
  };

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={closeMenu} transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Pressable style={{ flex: 1 }} onPress={closeMenu} />
        <View style={{ height: '85%', backgroundColor: theme.bgPrimary, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
            <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.borderDefault }} />
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}
            >
              <Pressable
                onPress={() => go('/profile')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: theme.bgSecondary,
                    borderWidth: 1,
                    borderColor: theme.borderDefault,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={24} color={theme.textTertiary} />
                </View>
                <View>
                  <Text style={{ fontWeight: '700', fontSize: 18, color: theme.textPrimary }}>{userName}</Text>
                  <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '500' }}>
                    {userName === 'Invitado' ? 'Iniciar sesión' : 'Mi Cuenta'}
                  </Text>
                </View>
              </Pressable>
              <Pressable onPress={closeMenu} style={{ padding: 8 }}>
                <X size={24} color={theme.textTertiary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
              <SectionTitle title="Mi Cuenta" theme={theme} />
              <Item icon={User} label="Mi Perfil" theme={theme} onPress={() => go('/profile')} />
              <Item icon={Bell} label="Notificaciones" theme={theme} onPress={() => go('/profile/notifications')} />
              <Item
                icon={Bookmark}
                label="Mi iguana"
                theme={theme}
                onPress={() => go('/iguanazo')}
                rightLabel={`${getIguanazoCount()} · ${followingCount}`}
              />

              <SectionTitle title="Apariencia y Experiencia" theme={theme} />
              <Item
                icon={themeMode === 'dark' ? Moon : Sun}
                label="Tema visual"
                theme={theme}
                onPress={cycleTheme}
                rightLabel={themeMode}
              />
              <Item
                icon={Type}
                label="Tamaño de fuente"
                theme={theme}
                onPress={cycleFontSize}
                rightLabel={fontSize}
              />
              <Item icon={Globe} label="Idioma regional" theme={theme} onPress={() => go('/profile/language')} rightLabel="Es-VE" />
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Shield size={20} color={theme.textSecondary} />
                  <Text style={{ color: theme.textPrimary, fontWeight: '500', fontSize: 15 }}>
                    Guardar historial
                  </Text>
                </View>
                <Toggle checked={isTrackingEnabled} onChange={() => setTrackingEnabled(!isTrackingEnabled)} />
              </View>

              <SectionTitle title="Contenido" theme={theme} />
              <Item
                icon={PlayCircle}
                label="Las 5 Noticias del Día"
                theme={theme}
                onPress={() => {
                  closeMenu();
                  playPulso();
                }}
                action
              />
              <Item icon={Mic} label="Mis Podcasts" theme={theme} onPress={() => go('/iguanazo')} />
              <Item icon={Eye} label="Categorías favoritas" theme={theme} onPress={() => go('/search')} />

              <SectionTitle title="Laiguana.tv" theme={theme} />
              <Item icon={Info} label="Acerca de Laiguana" theme={theme} onPress={() => go('/profile/about')} />
              <Item
                icon={Globe2}
                label="Sitio web"
                theme={theme}
                onPress={() => Linking.openURL('https://laiguana.tv')}
              />
              <Item
                icon={PlayCircle}
                label="Canal de YouTube"
                theme={theme}
                onPress={() => Linking.openURL('https://www.youtube.com/@laiguanatv-television')}
              />

              <SectionTitle title="Ayuda y Legal" theme={theme} />
              <Item
                icon={HelpCircle}
                label="Reportar un problema"
                theme={theme}
                onPress={() => Linking.openURL('mailto:contacto@laiguana.tv')}
              />
              <Item icon={Star} label="Calificar la app" theme={theme} onPress={() => {}} />
              <Item icon={FileText} label="Términos y Privacidad" theme={theme} onPress={() => {}} />

              <View style={{ padding: 16, alignItems: 'center', opacity: 0.6 }}>
                <Text style={{ fontSize: 12, color: theme.textSecondary }}>
                  Laiguana App v{APP_VERSION} ({BUILD_NUMBER})
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 5,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ fontSize: 12, color: theme.textTertiary }}>Hecho con</Text>
                  <KreaLabLogo height={15} />
                  <Text style={{ fontSize: 12, color: theme.textTertiary }}>desde Venezuela</Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

function SectionTitle({ title, theme }: { title: string; theme: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: theme.borderDefault }} />
      <Text
        style={{
          color: theme.textTertiary,
          fontSize: 11,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: theme.borderDefault }} />
    </View>
  );
}

function Item({
  icon: Icon,
  label,
  theme,
  onPress,
  rightLabel,
  action,
}: {
  icon: any;
  label: string;
  theme: any;
  onPress: () => void;
  rightLabel?: string;
  action?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.bgSecondary : 'transparent' },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Icon size={20} color={action ? theme.accentPrimary : theme.textSecondary} />
        <Text
          style={{
            color: action ? theme.accentPrimary : theme.textPrimary,
            fontWeight: '500',
            fontSize: 15,
          }}
        >
          {label}
        </Text>
      </View>
      {rightLabel ? (
        <Text style={{ color: theme.textTertiary, fontSize: 13, textTransform: 'capitalize' }}>{rightLabel}</Text>
      ) : (
        <ChevronRight size={18} color={theme.textTertiary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
});
