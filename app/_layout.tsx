import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { setAudioModeAsync } from 'expo-audio';
import {
  useFonts,
  OpenSans_400Regular,
  OpenSans_500Medium,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';

import { SplashScreen } from '@/components/layout/SplashScreen';
import { useTheme, useThemeName, fonts } from '@/theme/tokens';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { LiveMiniPlayer } from '@/components/player/LiveMiniPlayer';
import { TTSModal } from '@/components/player/TTSModal';
import { EpisodePlayerModal } from '@/components/player/EpisodePlayerModal';
import { PulsoModal } from '@/components/player/PulsoModal';
import { ListeningTracker } from '@/components/ListeningTracker';
import { MenuDrawer } from '@/components/layout/MenuDrawer';
import { useAuthStore } from '@/store/useAuthStore';
import { useArticlesStore } from '@/store/useArticlesStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSeenArticlesStore } from '@/store/useSeenArticlesStore';
import { preloadFriendlyVoice } from '@/utils/speech';
import {
  configureNotificationHandler,
  ensureAndroidChannel,
  ensureNotificationPermissions,
  notifyNewArticle,
  WP_SLUG_TO_SECTION,
} from '@/utils/notifications';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <RootShell />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootShell() {
  const [splash, setSplash] = useState(true);
  const [landedOnLive, setLandedOnLive] = useState(false);
  const theme = useTheme();
  const themeName = useThemeName();
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    const TextAny = Text as any;
    const TextInputAny = TextInput as any;
    const baseTextProps = TextAny.defaultProps || {};
    TextAny.defaultProps = {
      ...baseTextProps,
      style: [{ fontFamily: fonts.regular }, baseTextProps.style],
    };
    const baseInputProps = TextInputAny.defaultProps || {};
    TextInputAny.defaultProps = {
      ...baseInputProps,
      style: [{ fontFamily: fonts.regular }, baseInputProps.style],
    };
  }, [fontsLoaded]);

  useEffect(() => {
    preloadFriendlyVoice();
    configureNotificationHandler();
    ensureAndroidChannel();
    // Permite que la voz (y demás audio) suene aunque el teléfono esté en
    // modo silencio. Sin esto, expo-speech queda mudo con el switch de silencio.
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    }).catch(() => {});
  }, []);

  useNewArticleNotifications();

  // Guard: si no hay sesión Y ya pasaron 24h desde la primera apertura,
  // redirige a /(auth)/login. Antes de las 24h se permite uso como invitado.
  // Si la sesión está iniciada y el usuario aterrizó en /auth, sale al tab live.
  useEffect(() => {
    if (!isHydrated || splash) return;
    const inAuthGroup = segments[0] === '(auth)';
    const loginRequired = useAuthStore.getState().isLoginRequired();
    if (!isAuthenticated && !inAuthGroup && loginRequired) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)/live');
    }
  }, [isAuthenticated, isHydrated, segments, splash, router]);

  // Cold-start: siempre aterrizar en /(tabs)/live. Esto corre una sola vez
  // por sesión, así que no interfiere con la navegación posterior del usuario.
  useEffect(() => {
    if (!isHydrated || splash || landedOnLive) return;
    const inAuthGroup = segments[0] === '(auth)';
    const loginRequired = useAuthStore.getState().isLoginRequired();
    const mustGoToLogin = !isAuthenticated && loginRequired;
    if (inAuthGroup || mustGoToLogin) {
      // Si toca el login, el otro guard ya maneja la redirección.
      setLandedOnLive(true);
      return;
    }
    router.replace('/(tabs)/live');
    setLandedOnLive(true);
  }, [isHydrated, splash, landedOnLive, isAuthenticated, segments, router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bgPrimary },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="article/[id]" />
        <Stack.Screen
          name="programs/[id]"
          options={{
            animation: 'slide_from_bottom',
            gestureEnabled: true,
            gestureDirection: 'vertical',
          }}
        />
        <Stack.Screen name="journalist/[id]" />
        <Stack.Screen name="search" options={{ animation: 'fade' }} />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="profile/favorites" />
        <Stack.Screen name="profile/reading-list" />
        <Stack.Screen name="profile/following-journalists" />
        <Stack.Screen name="profile/following-programs" />
        <Stack.Screen name="profile/notifications" />
        <Stack.Screen name="profile/appearance" />
        <Stack.Screen name="profile/language" />
        <Stack.Screen name="profile/about" />
      </Stack>

      {isAuthenticated && (
        <>
          <MiniPlayer />
          <LiveMiniPlayer />
          <TTSModal />
          <EpisodePlayerModal />
          <PulsoModal />
        </>
      )}
      {!isAuthenticated && <LiveMiniPlayer />}
      <MenuDrawer />
      <ListeningTracker />

      {splash && <SplashScreen onComplete={() => setSplash(false)} />}
    </View>
  );
}

function useNewArticleNotifications() {
  const articles = useArticlesStore((s) => s.articles);

  useEffect(() => {
    if (articles.length === 0) return;

    const seenState = useSeenArticlesStore.getState();
    if (!seenState.initialized) {
      seenState.initializeWith(articles.map((a) => a.id));
      return;
    }

    const newArticles = articles.filter((a) => !seenState.seen[a.id]);
    if (newArticles.length === 0) return;

    const subs = useSettingsStore.getState().notifications.categories;
    const toNotify = newArticles.filter((a) => {
      const sectionId = WP_SLUG_TO_SECTION[a.category.slug];
      return sectionId && subs[sectionId];
    });

    (async () => {
      try {
        if (toNotify.length > 0) {
          const granted = await ensureNotificationPermissions();
          if (granted) {
            for (const a of toNotify.slice(0, 5)) {
              await notifyNewArticle({
                sectionName: a.category.name,
                title: a.title,
                articleId: a.id,
              });
            }
          }
        }
      } finally {
        seenState.markSeen(newArticles.map((a) => a.id));
      }
    })();
  }, [articles]);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
