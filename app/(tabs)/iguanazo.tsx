import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bookmark, Clock, ShieldAlert, Check } from 'lucide-react-native';

import { MainHeader } from '@/components/layout/MainHeader';
import { ImageFallback } from '@/components/ui/ImageFallback';
import { useTheme } from '@/theme/tokens';
import { useIguanazoStore } from '@/store/useIguanazoStore';
import { useFollowStore } from '@/store/useFollowStore';
import { useFollowingStore } from '@/store/useFollowingStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useArticlesStore } from '@/store/useArticlesStore';
import { useYoutubeStore } from '@/store/useYoutubeStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { findJournalist } from '@/utils/journalistRegistry';
import { renderRelativeDate } from '@/utils/dailyDigest';

type Tab = 'secciones' | 'siguiendo' | 'guardados' | 'historial';

type Section = {
  id: string;
  name: string;
  weeklyCount: number;
  imageUrl?: string;
  imageLocal?: number;
  solidColor?: string;
};

const SECTIONS: Section[] = [
  { id: 'politica', name: 'Política y Geopolítica', weeklyCount: 42, imageLocal: require('../../assets/images/sections/politica.jpeg') },
  { id: 'analisis', name: 'Análisis y Opinión', weeklyCount: 35, imageLocal: require('../../assets/images/sections/analisis.jpeg') },
  { id: 'economia', name: 'Economía e Internacional', weeklyCount: 28, imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80' },
  { id: 'internacional', name: 'Internacional', weeklyCount: 56, imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=80' },
  { id: 'bonos', name: 'Bonos y Banca', weeklyCount: 12, imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80' },
  { id: 'dolar', name: 'Dólar y Cambio', weeklyCount: 19, imageLocal: require('../../assets/images/sections/dolar.jpeg') },
  { id: 'petroleo', name: 'Petróleo y Energía', weeklyCount: 24, imageLocal: require('../../assets/images/sections/petroleo.jpeg') },
  { id: 'esequibo', name: 'Esequibo', weeklyCount: 8, solidColor: '#c82022' },
  { id: 'sucesos', name: 'Sucesos y Eventos', weeklyCount: 41, imageLocal: require('../../assets/images/sections/sucesos.jpeg') },
  { id: 'cultura', name: 'Cultura y Tecnología', weeklyCount: 15, imageLocal: require('../../assets/images/sections/cultura.jpeg') },
  { id: 'deportes', name: 'Deportes y Salud', weeklyCount: 33, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80' },
  { id: 'virales', name: 'Virales y Farándula', weeklyCount: 62, imageLocal: require('../../assets/images/sections/virales.jpeg') },
  { id: 'editoriales', name: 'Editoriales', weeklyCount: 7, imageLocal: require('../../assets/images/sections/editoriales.jpeg') },
  { id: 'sociedad', name: 'Sociedad', weeklyCount: 21, imageUrl: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&q=80' },
  { id: 'comunicacion', name: 'Comunicación e Información', weeklyCount: 11, imageLocal: require('../../assets/images/sections/comunicacion.jpeg') },
];

export default function IguanazoHome() {
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('secciones');
  const loadArticles = useArticlesStore((s) => s.load);
  const loadPlaylists = useYoutubeStore((s) => s.loadPlaylists);
  const ytConfigured = useYoutubeStore((s) => s.configured);

  useEffect(() => {
    loadArticles();
    if (ytConfigured) loadPlaylists();
  }, [loadArticles, loadPlaylists, ytConfigured]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <MainHeader />
      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: theme.textPrimary,
            fontFamily: 'OpenSans_700Bold',
            lineHeight: 36,
          }}
        >
          Mi iguana
        </Text>
        <Text style={{ fontSize: 15, color: theme.textSecondary, marginTop: 4 }}>
          Tu espacio personal en Laiguana
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 24, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: theme.borderDefault }}>
        {(['secciones', 'siguiendo', 'guardados', 'historial'] as Tab[]).map((t) => (
          <Pressable key={t} onPress={() => setTab(t)} style={{ paddingBottom: 12 }}>
            <Text
              style={{
                fontWeight: tab === t ? '700' : '400',
                fontSize: 15,
                color: tab === t ? theme.textPrimary : theme.textSecondary,
                textTransform: 'capitalize',
              }}
            >
              {t}
            </Text>
            {tab === t && (
              <View
                style={{
                  height: 2,
                  backgroundColor: theme.accentPrimary,
                  borderRadius: 1,
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                }}
              />
            )}
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
        {tab === 'secciones' && <Secciones />}
        {tab === 'siguiendo' && <Siguiendo />}
        {tab === 'guardados' && <Guardados />}
        {tab === 'historial' && <Historial />}
      </ScrollView>
    </SafeAreaView>
  );
}

function Secciones() {
  const theme = useTheme();
  const router = useRouter();
  const { notifications, toggleCategoryNotification } = useSettingsStore();
  const [editing, setEditing] = useState(false);

  const selectedCount = SECTIONS.filter((s) => !!notifications.categories[s.id]).length;

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
      <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 16 }}>
        {editing
          ? `Tocá las secciones para recibir notificaciones · ${selectedCount} seleccionada${selectedCount === 1 ? '' : 's'}`
          : 'Explorar todas las secciones de Laiguana'}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
        {SECTIONS.map((s) => {
          const selected = !!notifications.categories[s.id];
          return (
            <Pressable
              key={s.id}
              onPress={() => {
                if (editing) toggleCategoryNotification(s.id);
                else router.push('/');
              }}
              style={({ pressed }) => ({
                width: '48.5%',
                height: 160,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: s.solidColor || theme.bgSecondary,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              {(s.imageLocal || s.imageUrl) && (
                <ImageFallback source={s.imageLocal || s.imageUrl} style={StyleSheet.absoluteFill as any} />
              )}
              {/* Bottom-only darkening overlay (sim. gradient) */}
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '70%',
                  backgroundColor: editing && !selected ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.55)',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '40%',
                  height: '30%',
                  backgroundColor: editing && !selected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)',
                }}
              />
              {editing && !selected && (
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(0,0,0,0.35)',
                  }}
                />
              )}
              {editing && selected && (
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.accentSecondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={18} color="#fff" strokeWidth={3} />
                </View>
              )}
              <View style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
                <Text
                  numberOfLines={2}
                  style={{
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: '700',
                    fontFamily: 'OpenSans_700Bold',
                    marginBottom: 4,
                  }}
                >
                  {s.name}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500' }}>
                  {s.weeklyCount} artículos esta semana
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={() => setEditing((v) => !v)}
        style={({ pressed }) => ({
          marginTop: 24,
          paddingVertical: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: editing ? theme.accentSecondary : theme.borderDefault,
          backgroundColor: editing ? theme.accentSecondary : theme.bgSecondary,
          alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            color: editing ? '#fff' : theme.textPrimary,
            fontWeight: '700',
            fontSize: 15,
          }}
        >
          {editing ? 'Listo' : 'Editar mis intereses'}
        </Text>
      </Pressable>
      {editing && (
        <Text style={{ color: theme.textTertiary, fontSize: 12, marginTop: 12, textAlign: 'center' }}>
          Te avisaremos cuando haya noticias nuevas en las secciones que elijas.
        </Text>
      )}
    </View>
  );
}

function Siguiendo() {
  const theme = useTheme();
  const router = useRouter();
  const { followedPrograms } = useFollowStore();
  const { topics } = useFollowingStore();

  const ytPlaylists = useYoutubeStore((s) => s.playlists);
  const programs = ytPlaylists.filter((p) => followedPrograms.includes(p.id));

  return (
    <View style={{ paddingVertical: 24, gap: 32 }}>
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontWeight: '700', fontSize: 18, color: theme.textPrimary, marginBottom: 16 }}>
          Podcasts que sigo
        </Text>
        {programs.length > 0 ? (
          <View style={{ gap: 16 }}>
            {programs.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/programs/${p.id}`)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 16, opacity: pressed ? 0.7 : 1 })}
              >
                <ImageFallback source={p.thumbnailUrl} style={{ width: 56, height: 56, borderRadius: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={2} style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15 }}>
                    {p.title}
                  </Text>
                  <Text style={{ color: theme.textTertiary, fontSize: 13 }}>
                    {p.itemCount} {p.itemCount === 1 ? 'episodio' : 'episodios'}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <EmptyCard onPress={() => router.push('/podcasts')} text="Aún no seguís ningún podcast." cta="Explorar podcasts" />
        )}
      </View>

      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontWeight: '700', fontSize: 18, color: theme.textPrimary, marginBottom: 16 }}>
          Temas que sigo
        </Text>
        {topics.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {topics.map((t) => (
              <View
                key={t}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: theme.bgSecondary,
                  borderWidth: 1,
                  borderColor: theme.borderDefault,
                }}
              >
                <Text style={{ color: theme.textPrimary, fontSize: 13, fontWeight: '600' }}>{t}</Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyCard onPress={() => {}} text="Seguí temas para personalizar tu Inicio." cta="Elegir temas" />
        )}
      </View>
    </View>
  );
}

function Guardados() {
  const theme = useTheme();
  const router = useRouter();
  const { savedArticles, unsave } = useIguanazoStore();
  const byId = useArticlesStore((s) => s.byId);
  const articles = savedArticles.map((id) => byId[id]).filter(Boolean);

  if (articles.length === 0) {
    return (
      <View style={{ paddingVertical: 80, alignItems: 'center', paddingHorizontal: 24 }}>
        <Bookmark size={64} color={theme.textTertiary} />
        <Text style={{ fontSize: 22, fontWeight: '600', color: theme.textPrimary, marginTop: 24, marginBottom: 8 }}>
          Aún no tenés Guardados
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 32 }}>
          Tocá el ícono de Mi Iguana en cualquier noticia para guardarla acá.
        </Text>
        <Pressable
          onPress={() => router.push('/')}
          style={({ pressed }) => ({
            backgroundColor: theme.textPrimary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 999,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: theme.bgPrimary, fontWeight: '700', fontSize: 14 }}>Explorar Inicio</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderDefault,
        }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
          {articles.length} artículos guardados
        </Text>
        <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700', letterSpacing: 1 }}>
          EDITAR
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}
      >
        {['Todos', 'Sin leer', 'Esta semana', 'Política', 'Análisis'].map((f, i) => (
          <View
            key={f}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: i === 0 ? theme.borderStrong : theme.borderDefault,
              backgroundColor: i === 0 ? theme.boneWhite : 'transparent',
            }}
          >
            <Text
              style={{
                color: i === 0 ? theme.textPrimary : theme.textSecondary,
                fontSize: 13,
                fontWeight: '600',
              }}
            >
              {f}
            </Text>
          </View>
        ))}
      </ScrollView>
    <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 20 }}>
      {articles.map((a: any) => (
        <Pressable
          key={a.id}
          onPress={() => router.push(`/article/${a.id}`)}
          style={({ pressed }) => ({ flexDirection: 'row', gap: 16, opacity: pressed ? 0.85 : 1 })}
        >
          <ImageFallback source={a.imageUrl} style={{ width: 100, height: 75, borderRadius: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: a.category.color, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>
              {a.category.name.toUpperCase()}
            </Text>
            <Text numberOfLines={2} style={{ color: theme.textPrimary, fontSize: 15, fontWeight: '700' }}>
              {a.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ color: theme.textTertiary, fontSize: 12 }}>Guardado hace poco</Text>
              <Pressable onPress={() => unsave(a.id)}>
                <Bookmark size={20} color={theme.accentSecondary} fill={theme.accentSecondary} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      ))}
    </View>
    </View>
  );
}

function Historial() {
  const theme = useTheme();
  const router = useRouter();
  const { history, isTrackingEnabled, clear } = useHistoryStore();
  const byId = useArticlesStore((s) => s.byId);

  if (!isTrackingEnabled) {
    return (
      <View style={{ paddingVertical: 80, alignItems: 'center', paddingHorizontal: 24 }}>
        <ShieldAlert size={64} color={theme.textTertiary} />
        <Text style={{ fontSize: 22, fontWeight: '600', color: theme.textPrimary, marginTop: 24, marginBottom: 8 }}>
          Historial desactivado
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 15, textAlign: 'center' }}>
          Activalo en Menú &gt; Guardar historial de lectura.
        </Text>
      </View>
    );
  }

  const items = history
    .map((h) => ({ hist: h, article: byId[h.articleId] }))
    .filter((i) => i.article);

  if (items.length === 0) {
    return (
      <View style={{ paddingVertical: 80, alignItems: 'center', paddingHorizontal: 24 }}>
        <Clock size={64} color={theme.textTertiary} />
        <Text style={{ fontSize: 22, fontWeight: '600', color: theme.textPrimary, marginTop: 24, marginBottom: 8 }}>
          Historial vacío
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 15, textAlign: 'center' }}>
          Tu historial aparecerá acá. Cada artículo que abras se guarda automáticamente.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderDefault,
        }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>Tu actividad reciente</Text>
        <Pressable onPress={clear}>
          <Text style={{ color: theme.accentPrimary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 }}>
            LIMPIAR
          </Text>
        </Pressable>
      </View>
      {items.map(({ hist, article }: any) => (
        <Pressable
          key={hist.articleId}
          onPress={() => router.push(`/article/${article.id}`)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            gap: 16,
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderDefault,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <ImageFallback source={article.imageUrl} style={{ width: 72, height: 72, borderRadius: 8 }} />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ color: theme.textTertiary, fontSize: 11, fontWeight: '500', marginBottom: 4 }}>
              {renderRelativeDate(new Date(hist.openedAt).toISOString())}
            </Text>
            <Text numberOfLines={2} style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>
              {article.title}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function EmptyCard({ text, cta, onPress }: { text: string; cta: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={{
        backgroundColor: theme.bgSecondary,
        borderColor: theme.borderDefault,
        borderWidth: 1,
        borderRadius: 12,
        padding: 20,
      }}
    >
      <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 12 }}>{text}</Text>
      <Pressable onPress={onPress}>
        <Text style={{ color: theme.accentPrimary, fontSize: 14, fontWeight: '700' }}>{cta}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({});
