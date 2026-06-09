import React from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, Play, Pause, Share as ShareIcon, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { ImageFallback } from '@/components/ui/ImageFallback';
import { useTheme } from '@/theme/tokens';
import { usePulsoStore } from '@/store/usePulsoStore';
import { getGreeting } from '@/utils/dailyDigest';

export function PulsoModal() {
  const theme = useTheme();
  const {
    isModalOpen,
    isPlaying,
    currentArticleIndex,
    topArticles,
    closeModal,
    stopPulso,
    playPulso,
    pausePulso,
    playbackRate,
    setPlaybackRate,
  } = usePulsoStore();

  const handleClose = () => {
    stopPulso();
    closeModal();
  };

  return (
    <Modal visible={isModalOpen} animationType="slide" onRequestClose={closeModal} statusBarTranslucent>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 42, // 30pt extra para no chocar con la barra de estado
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderDefault,
          }}
        >
          <Pressable onPress={closeModal} style={{ padding: 6 }}>
            <ChevronDown size={28} color={theme.textSecondary} />
          </Pressable>
          <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15 }}>
            Las 5 Noticias del Día
          </Text>
          <Pressable onPress={handleClose} style={{ padding: 6 }}>
            <X size={28} color={theme.textSecondary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: theme.textPrimary, textAlign: 'center' }}>
              Las 5 Noticias del Día
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '500', textTransform: 'capitalize', marginTop: 6 }}>
              {format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
            </Text>
            <Text style={{ color: theme.accentPrimary, fontSize: 14, fontWeight: '700', marginTop: 4 }}>
              {getGreeting()}
            </Text>
          </View>

          <View style={{ gap: 12, marginBottom: 32 }}>
            {topArticles.map((article, idx) => {
              const focused = currentArticleIndex === idx;
              return (
                <View
                  key={article.id}
                  style={[
                    styles.item,
                    {
                      backgroundColor: focused ? theme.bgSecondary : 'transparent',
                      borderLeftColor: focused ? theme.accentPrimary : 'transparent',
                      opacity: focused ? 1 : 0.5,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: '700',
                      color: focused ? theme.accentPrimary : theme.textTertiary,
                      width: 36,
                    }}
                  >
                    {idx + 1}
                  </Text>
                  <ImageFallback source={article.imageUrl} style={{ width: 60, height: 60, borderRadius: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text
                      numberOfLines={1}
                      style={{ color: theme.accentPrimary, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}
                    >
                      {article.category.name.toUpperCase()}
                    </Text>
                    <Text numberOfLines={2} style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>
                      {article.title}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Pressable
              onPress={() => (isPlaying ? pausePulso() : playPulso())}
              style={({ pressed }) => ({
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: theme.accentPrimary,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: theme.accentPrimary,
                shadowOpacity: 0.5,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              {isPlaying ? <Pause size={36} color="#fff" fill="#fff" /> : <Play size={36} color="#fff" fill="#fff" />}
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8 }}>
            <Pressable
              onPress={() => {
                const rates = [0.75, 1, 1.25, 1.5, 2];
                const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
                setPlaybackRate(next);
              }}
              style={[
                styles.rateBtn,
                { backgroundColor: theme.bgSecondary, borderColor: theme.borderDefault },
              ]}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>{playbackRate}x</Text>
            </Pressable>
            <Pressable
              style={[
                styles.shareBtn,
                { backgroundColor: theme.bgSecondary, borderColor: theme.borderDefault },
              ]}
            >
              <ShareIcon size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
  },
  rateBtn: {
    width: 50,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
