import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Pause, X, FileText, Headphones, ListOrdered } from 'lucide-react-native';

import { ImageFallback } from '@/components/ui/ImageFallback';
import { useTheme } from '@/theme/tokens';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useEpisodePlayerStore } from '@/store/useEpisodePlayerStore';
import { usePulsoStore } from '@/store/usePulsoStore';

export function MiniPlayer() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tts = usePlayerStore();
  const podcast = useEpisodePlayerStore();
  const pulso = usePulsoStore();

  const ttsActive = tts.isVisible && tts.currentArticle && !tts.isFullPlayerOpen;
  const podcastActive = podcast.isVisible && !podcast.isExpanded && podcast.currentEpisode;
  const pulsoActive = !pulso.isModalOpen && (pulso.isPlaying || pulso.isPaused);

  if (!ttsActive && !podcastActive && !pulsoActive) return null;

  const bottom = 64 + insets.bottom + 8;

  if (pulsoActive) {
    const current = pulso.topArticles[pulso.currentArticleIndex];
    return (
      <Pressable
        onPress={pulso.openModal}
        style={[
          styles.container,
          { bottom, backgroundColor: theme.accentPrimary, shadowColor: theme.accentPrimary },
        ]}
      >
        <ImageFallback
          source="https://images.unsplash.com/photo-1587311929949-8c2cb570530b?auto=format&fit=crop&q=80&w=200"
          style={styles.thumb}
        />
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text numberOfLines={1} style={styles.title}>
            Las 5 Noticias del Día
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ListOrdered size={10} color="rgba(255,255,255,0.8)" />
            <Text numberOfLines={1} style={styles.subtitle}>
              Noticia {pulso.currentArticleIndex + 1} de 5 · {current?.title}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ControlBtn
            onPress={() => (pulso.isPlaying ? pulso.pausePulso() : pulso.playPulso())}
          >
            {pulso.isPlaying ? <Pause size={22} color="#fff" fill="#fff" /> : <Play size={22} color="#fff" fill="#fff" />}
          </ControlBtn>
          <ControlBtn onPress={() => pulso.stopPulso()}>
            <X size={18} color="rgba(255,255,255,0.7)" />
          </ControlBtn>
        </View>
      </Pressable>
    );
  }

  if (podcastActive) {
    const ep = podcast.currentEpisode!;
    return (
      <Pressable
        onPress={() => podcast.expand()}
        style={[styles.container, { bottom, backgroundColor: '#1A1A1A' }]}
      >
        <ImageFallback source={ep.thumbnailUrl} style={styles.thumb} />
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text numberOfLines={1} style={styles.title}>
            {ep.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Headphones size={10} color="rgba(255,255,255,0.5)" />
            <Text style={[styles.subtitle, { letterSpacing: 0.5 }]}>PODCAST</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <ControlBtn
            onPress={() => (podcast.isPlaying ? podcast.pause() : podcast.resume())}
          >
            {podcast.isPlaying ? <Pause size={22} color="#fff" fill="#fff" /> : <Play size={22} color="#fff" fill="#fff" />}
          </ControlBtn>
          <ControlBtn onPress={() => podcast.close()}>
            <X size={18} color="rgba(255,255,255,0.5)" />
          </ControlBtn>
        </View>
      </Pressable>
    );
  }

  // TTS
  const art = tts.currentArticle!;
  return (
    <Pressable
      onPress={tts.toggleFullPlayer}
      style={[styles.container, { bottom, backgroundColor: theme.primary }]}
    >
      <ImageFallback source={art.imageUrl} style={styles.thumb} />
      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        <Text numberOfLines={1} style={styles.title}>
          {art.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <FileText size={10} color="rgba(255,255,255,0.7)" />
          <Text style={styles.subtitle}>{tts.isPlaying ? 'Leyendo artículo...' : 'Pausado'}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <ControlBtn onPress={() => (tts.isPlaying ? tts.pause() : tts.resume())}>
          {tts.isPlaying ? <Pause size={22} color="#fff" fill="#fff" /> : <Play size={22} color="#fff" fill="#fff" />}
        </ControlBtn>
        <ControlBtn onPress={() => tts.closeMiniPlayer()}>
          <X size={18} color="rgba(255,255,255,0.7)" />
        </ControlBtn>
      </View>
    </Pressable>
  );
}

function ControlBtn({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <Pressable
      onPress={(e: any) => {
        e.stopPropagation?.();
        onPress();
      }}
      style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.7 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 60,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 4,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    zIndex: 40,
  },
  thumb: { width: 40, height: 40, borderRadius: 6 },
  title: { color: '#fff', fontWeight: '700', fontSize: 13, marginBottom: 2 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '500' },
  btn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
});
