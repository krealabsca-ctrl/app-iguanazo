import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Play, Pause, FastForward, Rewind, Share as ShareIcon, List } from 'lucide-react-native';

import { ImageFallback } from '@/components/ui/ImageFallback';
import { Chip } from '@/components/ui/Chip';
import { useTheme, radius } from '@/theme/tokens';
import { usePlayerStore } from '@/store/usePlayerStore';

export function TTSModal() {
  const theme = useTheme();
  const { isFullPlayerOpen, currentArticle, isPlaying, pause, resume, toggleFullPlayer, rate, setRate } =
    usePlayerStore();

  if (!currentArticle) return null;

  return (
    <Modal
      visible={isFullPlayerOpen}
      animationType="slide"
      onRequestClose={toggleFullPlayer}
      transparent={false}
      statusBarTranslucent
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56 }}>
          <Pressable onPress={toggleFullPlayer} style={{ padding: 6 }}>
            <ChevronDown size={32} color={theme.textPrimary} />
          </Pressable>
        </View>

        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <ImageFallback
              source={currentArticle.imageUrl}
              style={{ width: 280, height: 280, borderRadius: radius.card, marginBottom: 32 }}
            />
            <Chip variant="category" color={currentArticle.category.color} style={{ marginBottom: 16 }} uppercase>
              {currentArticle.category.name}
            </Chip>
            <Text
              numberOfLines={3}
              style={{
                fontSize: 26,
                fontWeight: '700',
                color: theme.textPrimary,
                textAlign: 'center',
                lineHeight: 30,
                marginBottom: 8,
              }}
            >
              {currentArticle.title}
            </Text>
            <Text style={{ color: theme.textTertiary, fontSize: 15 }}>{currentArticle.author.name}</Text>
          </View>

          <View style={{ width: '100%', paddingBottom: 24 }}>
            <View
              style={{
                width: '100%',
                height: 4,
                backgroundColor: theme.bgSecondary,
                borderRadius: 2,
                marginBottom: 32,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: isPlaying ? '40%' : '10%',
                  backgroundColor: theme.accentPrimary,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, marginBottom: 32 }}>
              <Pressable style={{ padding: 12 }}>
                <Rewind size={32} color={theme.textPrimary} />
              </Pressable>
              <Pressable
                onPress={() => (isPlaying ? pause() : resume())}
                style={({ pressed }) => [
                  {
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                {isPlaying ? (
                  <Pause size={40} color="#fff" fill="#fff" />
                ) : (
                  <Play size={40} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                )}
              </Pressable>
              <Pressable style={{ padding: 12 }}>
                <FastForward size={32} color={theme.textPrimary} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, alignItems: 'center' }}>
              <Pressable
                onPress={() => setRate(rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1)}
                style={[styles.rateBtn, { backgroundColor: theme.bgSecondary, borderColor: theme.borderDefault }]}
              >
                <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{rate}x</Text>
              </Pressable>
              <Pressable style={{ padding: 8 }}>
                <ShareIcon size={24} color={theme.textSecondary} />
              </Pressable>
              <Pressable style={{ padding: 8 }}>
                <List size={24} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  rateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center',
  },
});
