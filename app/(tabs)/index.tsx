import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Linking,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Play,
  Pause,
  Bookmark,
  ChevronRight,
  Flame,
  Camera,
  Sparkles,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MainHeader } from '@/components/layout/MainHeader';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { Badge } from '@/components/ui/Badge';
import { useTheme, radius } from '@/theme/tokens';
import { useArticlesStore } from '@/store/useArticlesStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useIguanazoStore } from '@/store/useIguanazoStore';
import { useIguanazosStore } from '@/store/useIguanazosStore';
import { usePulsoStore } from '@/store/usePulsoStore';
import {
  YoutubeIcon,
  XIcon,
  InstagramIcon,
  TiktokIcon,
  FacebookIcon,
  ThreadsIcon,
  TelegramIcon,
  WhatsappIcon,
} from '@/components/ui/SocialIcons';
import { LAIGUANA_SOCIAL, SOCIAL_ORDER, type SocialPlatform } from '@/utils/socialLinks';

const FEED_CATEGORIES = [
  'Para Ti',
  'En Vivo',
  'Política',
  'Economía',
  'Internacional',
  'Sucesos',
  'Cultura',
  'Deportes',
  'Virales',
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CAROUSEL_HORIZONTAL_PADDING = 16;
const CAROUSEL_GAP = 12;
const CAROUSEL_CARD_WIDTH = SCREEN_WIDTH - CAROUSEL_HORIZONTAL_PADDING * 2;
const CAROUSEL_SNAP = CAROUSEL_CARD_WIDTH + CAROUSEL_GAP;

// Post fijado como principal de "El Iguanazo" (Diablos Danzantes de Yare 2026).
const IGUANAZO_PINNED_ID = '1536718';
const IGUANAZO_PINNED_TITLE = /diablos\s+danzantes\s+de\s+yare/i;

// Carrusel coverflow del Iguanazo.
const IG_CARD_W = Math.round(SCREEN_WIDTH * 0.74);
const IG_CARD_SPACING = 4;
const IG_ITEM_SIZE = IG_CARD_W + IG_CARD_SPACING;
const IG_SIDE_PAD = (SCREEN_WIDTH - IG_ITEM_SIZE) / 2;

export default function HomeFeed() {
  const theme = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCat, setSelectedCat] = useState('Para Ti');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const { togglePlay, currentArticle, isPlaying } = usePlayerStore();
  const { isSaved, save, unsave } = useIguanazoStore();
  const {
    showPulsoBar,
    openModal,
    playPulso,
    pausePulso,
    isPlaying: pulsoPlaying,
    checkShouldShowBar,
    lastListenedAt,
  } = usePulsoStore();
  const articles = useArticlesStore((s) => s.articles);
  const articlesStatus = useArticlesStore((s) => s.status);
  const articlesError = useArticlesStore((s) => s.error);
  const loadArticles = useArticlesStore((s) => s.load);
  const refreshArticles = useArticlesStore((s) => s.refresh);
  const loadMoreArticles = useArticlesStore((s) => s.loadMore);
  const hasMore = useArticlesStore((s) => s.hasMore);
  const loadingMore = useArticlesStore((s) => s.loadingMore);

  useEffect(() => {
    checkShouldShowBar();
  }, [checkShouldShowBar]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const filteredArticles = React.useMemo(() => {
    if (selectedCat === 'Para Ti') return articles;
    const matchMap: Record<string, (a: any) => boolean> = {
      Política: (a) => a.category?.name === 'Política y Geopolítica',
      Economía: (a) =>
        a.category?.name === 'Economía e Internacional' ||
        a.tags?.includes('dólar') ||
        a.tags?.includes('petróleo'),
      Internacional: (a) =>
        (a.tags || []).some((x: string) =>
          ['internacional', 'eeuu', 'ee uu', 'europa', 'oriente medio', 'rusia', 'china'].includes(
            x.toLowerCase(),
          ),
        ),
      Sucesos: (a) => a.category?.name === 'Sucesos y Eventos',
      Cultura: (a) => a.category?.name === 'Cultura y Tecnología',
      Deportes: (a) => a.category?.name === 'Deportes y Salud',
      Virales: (a) => a.category?.name === 'Virales y Farándula',
    };
    const fn = matchMap[selectedCat];
    return fn ? articles.filter(fn) : articles;
  }, [articles, selectedCat]);

  const recent = React.useMemo(() => {
    return [...filteredArticles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 3);
  }, [filteredArticles]);

  const recentIds = React.useMemo(() => new Set(recent.map((a) => a.id)), [recent]);
  const others = filteredArticles.filter((a) => !recentIds.has(a.id));

  const handleSelectCat = (cat: string) => {
    if (cat === 'En Vivo') {
      router.push('/(tabs)/live');
      return;
    }
    setSelectedCat(cat);
    setCarouselIndex(0);
  };

  const scrollRef = useRef<ScrollView>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshArticles();
    setRefreshing(false);
  };

  // Al tocar el logo: sube al inicio y recarga las noticias.
  const onLogoPress = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    onRefresh();
  };

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / CAROUSEL_SNAP);
    if (idx !== carouselIndex) setCarouselIndex(idx);
  };

  const isInitialLoading = articlesStatus === 'loading' && articles.length === 0;
  const hasError = articlesStatus === 'error' && articles.length === 0;

  const pulsoSubtitle = (() => {
    if (lastListenedAt) {
      const isToday = new Date().toDateString() === new Date(lastListenedAt).toDateString();
      const under4h = Date.now() - lastListenedAt < 4 * 60 * 60 * 1000;
      if (isToday && under4h) return 'Escuchadas hoy ✓';
    }
    return 'Resumen de hoy · 2 min';
  })();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <MainHeader onLogoPress={onLogoPress} />

      <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.borderDefault }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        >
          {FEED_CATEGORIES.map((cat) => {
            const active = cat === selectedCat;
            return (
              <Pressable
                key={cat}
                onPress={() => handleSelectCat(cat)}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? theme.textPrimary : theme.borderDefault,
                    backgroundColor: active ? theme.textPrimary : 'transparent',
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? theme.bgPrimary : theme.textSecondary,
                    fontWeight: '700',
                    fontSize: 13,
                  }}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {showPulsoBar && (
        <View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
          <Pressable
            onPress={openModal}
            style={({ pressed }) => [
              styles.pulsoBar,
              { backgroundColor: theme.accentPrimary, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  pulsoPlaying ? pausePulso() : playPulso();
                }}
                style={styles.pulsoBtn}
              >
                {pulsoPlaying ? (
                  <Pause size={20} color="#000" fill="#000" />
                ) : (
                  <Play size={20} color="#000" fill="#000" />
                )}
              </Pressable>
              <View>
                <Text style={styles.pulsoTitle}>Las 5 Noticias del Día</Text>
                <Text style={styles.pulsoSubtitle}>{pulsoSubtitle}</Text>
              </View>
            </View>
            <ChevronRight size={24} color="#fff" />
          </Pressable>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1, backgroundColor: theme.bgPrimary }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 200 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.textTertiary}
          />
        }
      >
        {isInitialLoading && (
          <View style={{ paddingTop: 80, alignItems: 'center', gap: 12 }}>
            <ActivityIndicator color={theme.accentPrimary} />
            <Text style={{ color: theme.textSecondary }}>Cargando noticias…</Text>
          </View>
        )}

        {hasError && (
          <View style={{ paddingTop: 80, alignItems: 'center', gap: 12, paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 32 }}>⚠️</Text>
            <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
              No pudimos cargar las noticias
            </Text>
            {!!articlesError && (
              <Text style={{ color: theme.textTertiary, fontSize: 12, textAlign: 'center' }}>
                {articlesError}
              </Text>
            )}
            <Pressable
              onPress={refreshArticles}
              style={({ pressed }) => ({
                marginTop: 8,
                backgroundColor: theme.textPrimary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 999,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: theme.bgPrimary, fontWeight: '700', fontSize: 14 }}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        )}

        {recent.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onCarouselScroll}
              decelerationRate="fast"
              snapToInterval={CAROUSEL_SNAP}
              snapToAlignment="start"
              contentContainerStyle={{ paddingHorizontal: CAROUSEL_HORIZONTAL_PADDING }}
            >
              {recent.map((item, idx) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/article/${item.id}`)}
                  style={({ pressed }) => ({
                    width: CAROUSEL_CARD_WIDTH,
                    marginRight: idx < recent.length - 1 ? CAROUSEL_GAP : 0,
                    opacity: pressed ? 0.9 : 1,
                  })}
                >
                  <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
                    <ImageFallback
                      source={item.imageUrl}
                      style={{ width: '100%', aspectRatio: 16 / 10 }}
                    />
                  </View>
                  <View style={styles.carouselMeta}>
                    <Text
                      style={[
                        styles.carouselCategory,
                        { color: item.isBreaking ? theme.accentPrimary : theme.accentSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {item.isBreaking ? 'ÚLTIMA HORA' : (item.category?.name || 'Noticias').toUpperCase()}
                    </Text>
                    <Text style={[styles.carouselTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            {recent.length > 1 && (
              <View style={styles.dotsRow}>
                {recent.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dotPill,
                      {
                        backgroundColor:
                          i === carouselIndex ? theme.accentPrimary : theme.borderDefault,
                        width: i === carouselIndex ? 20 : 6,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ paddingHorizontal: 16 }}>
          {others.map((a, idx) => {
            const isLive = a.tags?.some((t) => /vivo|directo|en curso/i.test(t)) ?? false;
            return (
              <View key={a.id}>
                <Pressable
                  onPress={() => router.push(`/article/${a.id}`)}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <ImageFallback
                    source={a.imageUrl}
                    style={{ width: 100, height: 100, borderRadius: radius.card }}
                  />
                  <View style={{ flex: 1, gap: 6 }}>
                    {(a.isBreaking || isLive) && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                        {a.isBreaking && (
                          <Badge variant="breaking" dot>
                            Última Hora
                          </Badge>
                        )}
                        {isLive && !a.isBreaking && (
                          <Badge variant="live" dot>
                            En Vivo
                          </Badge>
                        )}
                      </View>
                    )}
                    <Text style={[styles.rowTitle, { color: theme.textPrimary }]} numberOfLines={3}>
                      {a.title}
                    </Text>
                    <View style={styles.rowFooter}>
                      <View style={{ flex: 1 }} />
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <IconButton
                          size={34}
                          active={isSaved(a.id)}
                          onPress={() => (isSaved(a.id) ? unsave(a.id) : save(a.id))}
                          activeColor={theme.accentSecondary}
                        >
                          <Bookmark
                            size={15}
                            color={isSaved(a.id) ? theme.accentSecondary : theme.textSecondary}
                            fill={isSaved(a.id) ? theme.accentSecondary : 'transparent'}
                          />
                        </IconButton>
                        <IconButton
                          size={34}
                          active={currentArticle?.id === a.id && isPlaying}
                          onPress={() => togglePlay(a)}
                          activeColor={theme.accentPrimary}
                          activeBg
                        >
                          {currentArticle?.id === a.id && isPlaying ? (
                            <Pause size={14} color="#fff" fill="#fff" />
                          ) : (
                            <Play
                              size={14}
                              color={theme.textSecondary}
                              fill={theme.textSecondary}
                            />
                          )}
                        </IconButton>
                      </View>
                    </View>
                  </View>
                </Pressable>
                {idx < others.length - 1 && (
                  <View style={{ height: 1, backgroundColor: theme.borderDefault, marginVertical: 16 }} />
                )}
              </View>
            );
          })}

          {!isInitialLoading && !hasError && articles.length === 0 && (
            <View style={{ paddingTop: 80, alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                Aún no hay noticias para mostrar.
              </Text>
            </View>
          )}

          {others.length > 0 && hasMore && (
            <Pressable
              onPress={loadMoreArticles}
              disabled={loadingMore}
              style={({ pressed }) => [
                styles.loadMoreBtn,
                {
                  borderColor: theme.borderDefault,
                  backgroundColor: theme.bgSecondary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {loadingMore ? (
                <ActivityIndicator color={theme.textSecondary} />
              ) : (
                <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>
                  Cargar noticias anteriores
                </Text>
              )}
            </Pressable>
          )}
        </View>

        {articles.length > 0 && (
          <>
            <MostReadSection articles={articles} />
            <LaFotoSection articles={articles} />
            <IguanazoPromoSection />
            <SiguenosSection />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionDot, { backgroundColor: color }]} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{label}</Text>
      </View>
    </View>
  );
}

function MostReadSection({ articles }: { articles: any[] }) {
  const theme = useTheme();
  const router = useRouter();
  const top = React.useMemo(() => {
    // Heurística: priorizar isBreaking, después por reciente. Top 5.
    return [...articles]
      .sort((a, b) => {
        if (Boolean(b.isBreaking) !== Boolean(a.isBreaking)) {
          return Number(b.isBreaking) - Number(a.isBreaking);
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
      .slice(0, 5);
  }, [articles]);

  if (top.length === 0) return null;

  return (
    <View style={styles.sectionWrap}>
      <SectionHeader
        icon={<Flame size={18} color={theme.accentPrimary} />}
        label="Lo más leído"
        color={theme.accentPrimary}
      />
      <View style={{ gap: 14 }}>
        {top.map((a, i) => (
          <Pressable
            key={a.id}
            onPress={() => router.push(`/article/${a.id}`)}
            style={({ pressed }) => [
              styles.mrListRow,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.mrListIndex, { color: theme.accentPrimary }]}>
              {String(i + 1).padStart(2, '')}
            </Text>
            <ImageFallback source={a.imageUrl} style={styles.mrListThumb} />
            <View style={{ flex: 1 }}>
              {a.isBreaking && (
                <Text style={[styles.mrListEyebrow, { color: theme.accentPrimary }]}>
                  ÚLTIMO MINUTO
                </Text>
              )}
              <Text
                numberOfLines={3}
                style={[styles.mrListTitle, { color: theme.textPrimary }]}
              >
                {a.title}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function LaFotoSection({ articles }: { articles: any[] }) {
  const theme = useTheme();
  const router = useRouter();
  // Mejor candidato: el artículo más reciente con imagen y caption (si existe),
  // o simplemente el más reciente con imagen.
  const featured = React.useMemo(() => {
    const withCaption = articles.find((a) => a.imageUrl && a.imageCaption);
    if (withCaption) return withCaption;
    return articles.find((a) => !!a.imageUrl);
  }, [articles]);

  if (!featured) return null;
  const caption = featured.imageCaption || featured.title;

  return (
    <View style={styles.sectionWrap}>
      <SectionHeader
        icon={<Camera size={18} color={theme.accentPrimary} />}
        label="La foto"
        color={theme.accentPrimary}
      />
      <Pressable
        onPress={() => router.push(`/article/${featured.id}`)}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
          <ImageFallback
            source={featured.imageUrl}
            style={{ width: '100%', aspectRatio: 16 / 10 }}
          />
          <View style={[styles.laFotoCaptionBar, { backgroundColor: theme.accentPrimary }]}>
            <Text numberOfLines={2} style={styles.laFotoCaptionText}>
              {caption}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function IguanazoPromoSection() {
  const theme = useTheme();
  const router = useRouter();
  const items = useIguanazosStore((s) => s.items);
  const load = useIguanazosStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  // Todos en un solo carrusel; "Diablos Danzantes de Yare 2026" va de primero
  // (tarjeta central inicial) si está presente. Solo posts con imagen.
  const ordered = React.useMemo(() => {
    const withImages = items.filter((a) => !!a.imageUrl);
    const i = withImages.findIndex(
      (a) => a.id === IGUANAZO_PINNED_ID || IGUANAZO_PINNED_TITLE.test(a.title),
    );
    if (i > 0) {
      const copy = [...withImages];
      copy.unshift(copy.splice(i, 1)[0]);
      return copy;
    }
    return withImages;
  }, [items]);
  if (ordered.length === 0) return null;

  return (
    <View style={styles.sectionWrap}>
      <SectionHeader
        icon={<Sparkles size={18} color={theme.accentSecondary} />}
        label="El Iguanazo"
        color={theme.accentSecondary}
      />

      <IguanazoCarousel
        items={ordered.slice(0, 7)}
        onPress={(id) => router.push(`/article/${id}`)}
      />
    </View>
  );
}

// Carrusel con efecto coverflow: la tarjeta central queda al frente y plana,
// las laterales rotan en perspectiva, se encogen y se atenúan. Mantiene la
// línea gráfica (imagen + degradado + título blanco + acento del Iguanazo).
function IguanazoCarousel({
  items,
  onPress,
}: {
  items: any[];
  onPress: (id: string) => void;
}) {
  const theme = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={IG_ITEM_SIZE}
      decelerationRate="fast"
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingHorizontal: IG_SIDE_PAD, paddingVertical: 18 }}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true },
      )}
    >
      {items.map((a, index) => {
        const inputRange = [
          (index - 1) * IG_ITEM_SIZE,
          index * IG_ITEM_SIZE,
          (index + 1) * IG_ITEM_SIZE,
        ];
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.84, 1, 0.84],
          extrapolate: 'clamp',
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.45, 1, 0.45],
          extrapolate: 'clamp',
        });
        const rotateY = scrollX.interpolate({
          inputRange,
          outputRange: ['32deg', '0deg', '-32deg'],
          extrapolate: 'clamp',
        });
        const translateY = scrollX.interpolate({
          inputRange,
          outputRange: [22, 0, 22],
          extrapolate: 'clamp',
        });
        return (
          <View key={a.id} style={{ width: IG_ITEM_SIZE, alignItems: 'center' }}>
            <Animated.View
              style={{
                width: IG_CARD_W,
                opacity,
                transform: [{ perspective: 1000 }, { rotateY }, { scale }, { translateY }],
              }}
            >
              <Pressable
                onPress={() => onPress(a.id)}
                style={({ pressed }) => [styles.iguanazoCarouselCard, { opacity: pressed ? 0.9 : 1 }]}
              >
                <ImageFallback source={a.imageUrl} style={StyleSheet.absoluteFill as any} />
                <View style={styles.iguanazoGridGradient} />
                <View
                  style={[styles.iguanazoCarouselTag, { backgroundColor: theme.accentSecondary }]}
                >
                  <Text style={styles.iguanazoTagText}>IGUANAZO</Text>
                </View>
                <Text numberOfLines={2} style={styles.iguanazoCarouselTitle}>
                  {a.title}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        );
      })}
    </Animated.ScrollView>
  );
}

const SOCIAL_ICONS: Record<SocialPlatform, React.ComponentType<{ size?: number; color?: string }>> = {
  youtube: YoutubeIcon,
  x: XIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  facebook: FacebookIcon,
  threads: ThreadsIcon,
  telegram: TelegramIcon,
  whatsapp: WhatsappIcon,
};

type SocialEntry = {
  platform: SocialPlatform;
  count: string;
  unit: string;
  cta: string;
};

// Datos públicos aproximados de Laiguana.tv (capturados de la web).
// No hay API en el cliente para fetch en vivo, así que los hardcodeamos.
const SOCIAL_STATS: SocialEntry[] = [
  { platform: 'facebook', count: '582,000', unit: 'Fans', cta: 'ME GUSTA' },
  { platform: 'instagram', count: '381,000', unit: 'Seguidores', cta: 'SEGUIR' },
  { platform: 'tiktok', count: '243,100', unit: 'Seguidores', cta: 'SEGUIR' },
  { platform: 'x', count: '619,900', unit: 'Seguidores', cta: 'SEGUIR' },
  { platform: 'youtube', count: '352,000', unit: 'Suscriptores', cta: 'SUSCRIBIRTE' },
];

function SiguenosSection() {
  const theme = useTheme();
  return (
    <View style={styles.sectionWrap}>
      <SectionHeader icon={null} label="Síguenos" color={theme.accentPrimary} />
      <View style={{ gap: 10 }}>
        {SOCIAL_STATS.map((s) => {
          const Icon = SOCIAL_ICONS[s.platform];
          return (
            <Pressable
              key={s.platform}
              onPress={() => Linking.openURL(LAIGUANA_SOCIAL[s.platform]).catch(() => {})}
              style={({ pressed }) => [
                styles.socialRowItem,
                {
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.borderDefault,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="link"
              accessibilityLabel={`Abrir ${s.platform}`}
            >
              <View style={styles.socialRowLeft}>
                <Icon size={22} color={theme.textPrimary} />
                <Text style={[styles.socialCount, { color: theme.textPrimary }]}>
                  {s.count}
                </Text>
                <Text style={[styles.socialUnit, { color: theme.textSecondary }]}>
                  {s.unit}
                </Text>
              </View>
              <Text style={[styles.socialCta, { color: theme.textPrimary }]}>
                {s.cta}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Resto de redes sin contador visible (Threads, Telegram, WhatsApp) */}
      <View style={[styles.socialIconsRow, { marginTop: 16 }]}>
        {SOCIAL_ORDER.filter((p) => !SOCIAL_STATS.some((s) => s.platform === p)).map((p) => {
          const Icon = SOCIAL_ICONS[p];
          return (
            <Pressable
              key={p}
              onPress={() => Linking.openURL(LAIGUANA_SOCIAL[p]).catch(() => {})}
              style={({ pressed }) => [
                styles.socialBtn,
                {
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.borderDefault,
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
              accessibilityRole="link"
              accessibilityLabel={`Abrir ${p}`}
            >
              <Icon size={22} color={theme.textPrimary} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function IconButton({
  children,
  active,
  activeColor,
  activeBg,
  onPress,
  size = 40,
}: {
  children: React.ReactNode;
  active?: boolean;
  activeColor: string;
  activeBg?: boolean;
  onPress: () => void;
  size?: number;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active && activeBg ? activeColor : theme.bgSecondary,
          borderColor: active ? activeColor : theme.borderDefault,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pulsoBar: {
    height: 64,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  pulsoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsoTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
  pulsoSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
  row: { flexDirection: 'row', gap: 16 },
  rowTitle: { fontSize: 15, fontWeight: '700', lineHeight: 19, fontFamily: 'OpenSans_700Bold' },
  rowFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carouselMeta: {
    paddingTop: 10,
    paddingHorizontal: 2,
  },
  carouselCategory: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 5,
  },
  carouselTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    fontFamily: 'OpenSans_700Bold',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dotPill: {
    height: 6,
    borderRadius: 3,
  },
  sectionWrap: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  loadMoreBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionDot: { width: 4, height: 22, borderRadius: 2 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'OpenSans_700Bold',
  },
  /* Most Read — compact list */
  mrListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mrListIndex: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'OpenSans_700Bold',
    lineHeight: 28,
    width: 32,
    textAlign: 'center',
  },
  mrListThumb: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: '#222',
  },
  mrListEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  mrListTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    fontFamily: 'OpenSans_700Bold',
  },
  /* Shared gradient for banners */
  mrGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  /* La foto */
  laFotoCaptionBar: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  laFotoCaptionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 19,
    fontFamily: 'OpenSans_700Bold',
  },

  /* Iguanazo */
  iguanazoTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  iguanazoGridGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '20%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  iguanazoCarouselCard: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: '#111',
    justifyContent: 'flex-end',
    // Sombra para dar profundidad al efecto coverflow.
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iguanazoCarouselTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  iguanazoCarouselTitle: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    fontFamily: 'OpenSans_700Bold',
    padding: 12,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  /* Síguenos */
  socialRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  socialRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  socialCount: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'OpenSans_700Bold',
  },
  socialUnit: {
    fontSize: 12,
    fontWeight: '500',
  },
  socialCta: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  socialIconsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
