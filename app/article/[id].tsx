import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Share as RNShare,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Share,
  Bookmark,
  Headphones,
  Play,
  Pause,
} from 'lucide-react-native';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { ImageFallback } from '@/components/ui/ImageFallback';
import { useTheme, radius } from '@/theme/tokens';
import { useArticlesStore } from '@/store/useArticlesStore';
import { useIguanazosStore } from '@/store/useIguanazosStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useReadingListStore } from '@/store/useReadingListStore';
import { useIguanazoStore } from '@/store/useIguanazoStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useActivityStatsStore } from '@/store/useActivityStatsStore';
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
import {
  extractSocialLinks,
  cleanArticleBody,
  type SocialPlatform,
} from '@/utils/socialLinks';

export default function ArticleDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const articles = useArticlesStore((s) => s.articles);
  const articlesAll = useArticlesStore((s) => s.articlesAll);
  const byId = useArticlesStore((s) => s.byId);
  const iguanazos = useIguanazosStore((s) => s.items);
  const article =
    (id ? byId[id] : undefined) ||
    articles.find((a) => a.id === id) ||
    articlesAll.find((a) => a.id === id) ||
    iguanazos.find((a) => a.id === id) ||
    articles[0] ||
    articlesAll[0];

  const { play, currentArticle, isPlaying } = usePlayerStore();
  const { add: addReading } = useReadingListStore();
  const { isSaved, save, unsave } = useIguanazoStore();
  const recordOpen = useHistoryStore((s) => s.recordOpen);
  const recordArticleRead = useActivityStatsStore((s) => s.recordArticleRead);

  useEffect(() => {
    if (article) {
      recordOpen(article.id);
      recordArticleRead(article.id);
    }
  }, [article, recordOpen, recordArticleRead]);

  const articleBody = article?.body || '';
  const socials = useMemo(() => extractSocialLinks(articleBody), [articleBody]);
  const cleanedBody = useMemo(() => cleanArticleBody(articleBody), [articleBody]);

  if (!article) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
        <View style={[styles.header, { borderBottomColor: theme.borderDefault }]}>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <ArrowLeft size={24} color={theme.textPrimary} />
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
            Esta nota no está disponible.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const saved = isSaved(article.id);
  const isCurrent = currentArticle?.id === article.id && isPlaying;
  const relatedSource = articlesAll.length > 0 ? articlesAll : articles;
  const sameCategory = relatedSource
    .filter((a) => a.id !== article.id && a.category.id === article.category.id)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const fallback = relatedSource
    .filter((a) => a.id !== article.id && !sameCategory.some((s) => s.id === a.id))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const related = [...sameCategory, ...fallback].slice(0, 5);

  const handleTTS = () => {
    addReading(article.id);
    play(article);
  };

  const handleShare = async () => {
    try {
      await RNShare.share({
        title: article.title,
        message: `${article.title}\n${article.excerpt}\n\nLeé más en Laiguana.tv`,
      });
    } catch {}
  };

  const toggleSave = () => (saved ? unsave(article.id) : save(article.id));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <View style={[styles.header, { borderBottomColor: theme.borderDefault }]}>
        <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </Pressable>
        <View style={styles.headerLogoWrap} pointerEvents="none">
          <Image
            source={require('../../assets/images/header.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={toggleSave} style={{ padding: 6 }}>
            <Bookmark
              size={24}
              color={saved ? theme.accentSecondary : theme.textPrimary}
              fill={saved ? theme.accentSecondary : 'transparent'}
            />
          </Pressable>
          <Pressable onPress={handleShare} style={{ padding: 6 }}>
            <Share size={24} color={theme.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', marginBottom: 14 }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 4,
                backgroundColor: theme.bgSecondary,
              }}
            >
              <Text
                style={{
                  color: article.category.color,
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 1,
                }}
              >
                {article.category.name.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '600',
              color: theme.textPrimary,
              lineHeight: 34,
              marginBottom: 12,
              fontFamily: 'OpenSans_700Bold',
            }}
          >
            {article.title}
          </Text>

          <Pressable
            onPress={handleTTS}
            style={({ pressed }) => [
              styles.ttsBtn,
              {
                borderColor: `${theme.primary}30`,
                backgroundColor: `${theme.primary}10`,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Headphones size={20} color="#fff" />
              </View>
              <View>
                <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15 }}>Escuchar artículo</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                  {article.readingTimeMinutes} min de audio
                </Text>
              </View>
            </View>
            {isCurrent ? <Pause size={22} color={theme.primary} /> : <Play size={22} color={theme.primary} />}
          </Pressable>

          <ImageFallback
            source={article.imageUrl}
            style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 12, marginVertical: 24 }}
          />

          <Text style={{ color: theme.textPrimary, fontSize: 17, lineHeight: 28 }}>{cleanedBody}</Text>

          {!!article.instagramEmbeds?.length &&
            article.instagramEmbeds.map((permalink) => (
              <InstagramEmbed key={permalink} permalink={permalink} />
            ))}

          {socials.length > 0 && (
            <View style={{ marginTop: 28, paddingTop: 20, borderTopWidth: 1, borderTopColor: theme.borderDefault }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.textTertiary,
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 2,
                  marginBottom: 14,
                }}
              >
                SÍGUENOS EN
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 14,
                }}
              >
                {socials.map((s) => (
                  <SocialButton
                    key={s.platform}
                    platform={s.platform}
                    url={s.url}
                    bg={theme.bgSecondary}
                    border={theme.borderDefault}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={{ marginTop: 40, paddingTop: 24, borderTopWidth: 1, borderTopColor: theme.borderDefault }}>
            <Text style={{ textAlign: 'center', color: theme.textPrimary, fontWeight: '700', marginBottom: 20 }}>
              ¿Te pareció interesante? Compártelo
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
              <Pressable onPress={handleShare} style={{ alignItems: 'center', gap: 6 }}>
                <View style={[styles.shareCircle, { backgroundColor: theme.bgSecondary, borderColor: theme.borderDefault }]}>
                  <Share size={24} color={theme.textPrimary} />
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '600' }}>COMPARTIR</Text>
              </Pressable>
              <Pressable onPress={toggleSave} style={{ alignItems: 'center', gap: 6 }}>
                <View style={[styles.shareCircle, { backgroundColor: theme.bgSecondary, borderColor: theme.borderDefault }]}>
                  <Bookmark
                    size={24}
                    color={saved ? theme.accentSecondary : theme.textPrimary}
                    fill={saved ? theme.accentSecondary : 'transparent'}
                  />
                </View>
                <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '600' }}>
                  {saved ? 'GUARDADO' : 'GUARDAR'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {related.length > 0 && (
          <View
            style={{
              backgroundColor: theme.bgSecondary,
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: theme.borderDefault,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <View style={{ width: 6, height: 24, backgroundColor: theme.accentPrimary, borderRadius: 3 }} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: theme.textPrimary, fontFamily: 'OpenSans_700Bold' }}>
                Te puede interesar
              </Text>
            </View>
            <View style={{ gap: 16 }}>
              {related.map((rel) => (
                <Pressable
                  key={rel.id}
                  onPress={() => router.replace(`/article/${rel.id}`)}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      gap: 16,
                      backgroundColor: theme.bgPrimary,
                      borderRadius: radius.card,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: theme.borderDefault,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <ImageFallback source={rel.imageUrl} style={{ width: 80, height: 80, borderRadius: 8 }} />
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text numberOfLines={2} style={{ fontWeight: '700', fontSize: 15, color: theme.textPrimary }}>
                      {rel.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.textTertiary, marginTop: 4 }}>
                      {format(new Date(rel.publishedAt), 'dd MMM yyyy', { locale: es })}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SocialButton({
  platform,
  url,
  bg,
  border,
}: {
  platform: SocialPlatform;
  url: string;
  bg: string;
  border: string;
}) {
  const theme = useTheme();
  const Icon = SOCIAL_ICONS[platform];
  const label = SOCIAL_LABELS[platform];
  return (
    <Pressable
      onPress={() => Linking.openURL(url).catch(() => {})}
      style={({ pressed }) => [
        styles.socialCircle,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <Icon size={22} color={theme.textPrimary} />
    </Pressable>
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

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  youtube: 'Abrir en YouTube',
  x: 'Abrir en X',
  instagram: 'Abrir en Instagram',
  tiktok: 'Abrir en TikTok',
  facebook: 'Abrir en Facebook',
  threads: 'Abrir en Threads',
  telegram: 'Abrir en Telegram',
  whatsapp: 'Abrir en WhatsApp',
};

// Datos mínimos que extraemos del embed de Instagram para armar una tarjeta
// nativa propia: imagen, cuenta que publicó, avatar y proporción de la imagen.
interface IgData {
  imageUrl: string;
  username: string;
  avatarUrl: string;
  aspectRatio: number;
}

function decodeIgEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function parseInstagramEmbed(html: string): IgData | null {
  const imgTag = html.match(/<img[^>]*class="EmbeddedMediaImage"[^>]*>/i)?.[0];
  if (!imgTag) return null;
  const imageUrl = decodeIgEntities(imgTag.match(/src="([^"]+)"/i)?.[1] || '');
  if (!imageUrl) return null;

  let username = html.match(/class="UsernameText"[^>]*>([^<]+)</i)?.[1]?.trim() || '';
  if (!username) {
    const alt = decodeIgEntities(imgTag.match(/alt="([^"]*)"/i)?.[1] || '');
    username = alt.match(/@([A-Za-z0-9._]+)/)?.[1] || '';
  }

  const avatarUrl = decodeIgEntities(
    html.match(/https:\/\/[^"'\\]*cdninstagram[^"'\\]*s150x150[^"'\\]*/i)?.[0] || '',
  );

  const pb = parseFloat(
    html.match(/class="Content EmbedFrame"[^>]*style="[^"]*padding-bottom:\s*([\d.]+)%/i)?.[1] ||
      '100',
  );
  const aspectRatio = pb > 0 ? 100 / pb : 1;

  return { imageUrl, username, avatarUrl, aspectRatio };
}

const IG_PINK = '#E1306C';

// Tarjeta nativa de un post de Instagram: muestra SOLO la imagen y la cuenta
// que publicó, con un diseño limpio. Al tocar, redirige al post en Instagram.
function InstagramEmbed({ permalink }: { permalink: string }) {
  const theme = useTheme();
  const [data, setData] = useState<IgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    fetch(`${permalink}embed/`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    })
      .then((r) => r.text())
      .then((html) => {
        if (cancelled) return;
        const parsed = parseInstagramEmbed(html);
        if (parsed) setData(parsed);
        else setFailed(true);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [permalink]);

  const open = () => Linking.openURL(permalink).catch(() => {});

  // Fallback: si no se pudo leer el embed, un botón simple que abre Instagram.
  if (failed) {
    return (
      <Pressable
        onPress={open}
        style={({ pressed }) => [
          styles.igFallback,
          { borderColor: theme.borderDefault, backgroundColor: theme.bgSecondary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <InstagramIcon size={22} color={IG_PINK} />
        <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>
          Ver publicación en Instagram
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={open}
      accessibilityRole="link"
      accessibilityLabel={data ? `Ver publicación de @${data.username} en Instagram` : 'Abrir Instagram'}
      style={({ pressed }) => [
        styles.igCard,
        { backgroundColor: theme.bgSecondary, borderColor: theme.borderDefault, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      {/* Cabecera: avatar + cuenta */}
      <View style={styles.igHeader}>
        <View style={[styles.igAvatarRing, { borderColor: IG_PINK }]}>
          {data?.avatarUrl ? (
            <ImageFallback source={data.avatarUrl} style={styles.igAvatar} />
          ) : (
            <View style={[styles.igAvatar, styles.igAvatarPlaceholder, { backgroundColor: theme.bgTertiary }]}>
              <InstagramIcon size={16} color={IG_PINK} />
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>
            {data?.username ? `@${data.username}` : ' '}
          </Text>
          <Text style={{ color: theme.textTertiary, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 }}>
            Instagram
          </Text>
        </View>
        <InstagramIcon size={20} color={IG_PINK} />
      </View>

      {/* Imagen del post */}
      <View
        style={{
          width: '100%',
          aspectRatio: data?.aspectRatio || 1,
          backgroundColor: theme.bgTertiary,
        }}
      >
        {data?.imageUrl ? (
          <ImageFallback source={data.imageUrl} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.textTertiary} />
          </View>
        )}
      </View>

      {/* Pie sutil con llamado a la acción */}
      <View style={styles.igFooter}>
        <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
          {loading ? 'Cargando publicación…' : 'Ver en Instagram'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLogoWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: { width: 120, height: 34 },
  igCard: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  igHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  igAvatarRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  igAvatar: { width: 30, height: 30, borderRadius: 15 },
  igAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  igFooter: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  igFallback: {
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ttsBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shareCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  socialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
