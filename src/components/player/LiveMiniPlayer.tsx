import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';

import { useLivePlayerStore } from '@/store/useLivePlayerStore';
import { buildYoutubePlayerHTML } from '@/utils/youtubeVideo';

const PIP_WIDTH = 180;
const PIP_HEIGHT = Math.round((PIP_WIDTH * 9) / 16); // ≈101

/**
 * Floating picture-in-picture player for the live stream. Shows automatically
 * whenever a live videoId is active AND the user has navigated away from the
 * En Vivo tab. Tapping the video returns to the tab. An X dismisses it.
 *
 * The live tab unmounts its own WebView when blurred, so only one stream
 * audio source is active at a time.
 */
export function LiveMiniPlayer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const { isActive, videoId, isDismissed, dismiss } = useLivePlayerStore();

  const onLiveTab = pathname === '/live' || pathname.endsWith('/live');
  const shouldRender = isActive && !!videoId && !onLiveTab && !isDismissed;

  const html = useMemo(
    () => (videoId ? buildYoutubePlayerHTML(videoId, { controls: 0, mute: 0, autoplay: 1 }) : null),
    [videoId],
  );

  if (!shouldRender || !html) return null;

  const top = insets.top + 12;

  return (
    <View style={[styles.container, { top }]} pointerEvents="box-none">
      <Pressable
        onPress={() => router.push('/(tabs)/live')}
        style={({ pressed }) => [
          styles.frame,
          { transform: [{ scale: pressed ? 0.97 : 1 }] },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Volver al en vivo"
      >
        <View pointerEvents="none" style={styles.videoBox}>
          <WebView
            source={{ html, baseUrl: 'https://www.youtube-nocookie.com' }}
            style={styles.web}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            androidLayerType="hardware"
            mixedContentMode="always"
            setSupportMultipleWindows={false}
          />
        </View>
        <View pointerEvents="none" style={styles.livePill}>
          <View style={styles.liveDot} />
        </View>
      </Pressable>
      <Pressable
        onPress={dismiss}
        hitSlop={10}
        style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
        accessibilityLabel="Cerrar mini reproductor"
      >
        <X size={14} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    width: PIP_WIDTH,
    zIndex: 60,
    elevation: 60,
  },
  frame: {
    width: PIP_WIDTH,
    height: PIP_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  videoBox: { flex: 1, backgroundColor: '#000' },
  web: { flex: 1, backgroundColor: '#000' },
  livePill: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3B30',
  },
  closeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
