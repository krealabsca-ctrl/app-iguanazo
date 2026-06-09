import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Share as RNShare,
  Linking,
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
  const article =
    (id ? byId[id] : undefined) ||
    articles.find((a) => a.id === id) ||
    articlesAll.find((a) => a.id === id) ||
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
          {!!article.excerpt && (
            <Text style={{ fontSize: 17, color: theme.textSecondary, lineHeight: 26, marginBottom: 24 }}>
              {article.excerpt}
            </Text>
          )}

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
      <Icon size={22} />
    </Pressable>
  );
}

const SOCIAL_ICONS: Record<SocialPlatform, React.ComponentType<{ size?: number }>> = {
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

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
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
