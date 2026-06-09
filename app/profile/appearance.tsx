import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

import { SubHeader } from '@/components/layout/SubHeader';
import { useTheme } from '@/theme/tokens';
import { useSettingsStore, ThemeMode, FontSize } from '@/store/useSettingsStore';

const themes: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
];

const sizes: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Pequeño' },
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Grande' },
  { value: 'extra-large', label: 'Extra grande' },
];

export default function Appearance() {
  const theme = useTheme();
  const { theme: themeMode, setTheme, fontSize, setFontSize } = useSettingsStore();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgSecondary }}>
      <SubHeader title="Apariencia" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200, gap: 16 }}>
        <Section title="Tema visual" theme={theme}>
          {themes.map((t, i) => (
            <Option
              key={t.value}
              theme={theme}
              label={t.label}
              selected={themeMode === t.value}
              onPress={() => setTheme(t.value)}
              divider={i !== themes.length - 1}
            />
          ))}
        </Section>
        <Section title="Tamaño de fuente" theme={theme}>
          {sizes.map((s, i) => (
            <Option
              key={s.value}
              theme={theme}
              label={s.label}
              selected={fontSize === s.value}
              onPress={() => setFontSize(s.value)}
              divider={i !== sizes.length - 1}
            />
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, theme, children }: any) {
  return (
    <View style={{ backgroundColor: theme.bgPrimary, borderRadius: 12, padding: 4 }}>
      <Text
        style={{
          fontWeight: '600',
          fontSize: 14,
          color: theme.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Option({
  theme,
  label,
  selected,
  onPress,
  divider,
}: {
  theme: any;
  label: string;
  selected: boolean;
  onPress: () => void;
  divider?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 14,
          borderBottomWidth: divider ? 1 : 0,
          borderBottomColor: theme.borderDefault,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text style={{ color: theme.textPrimary, fontSize: 15 }}>{label}</Text>
      {selected && <Check size={18} color={theme.accentPrimary} />}
    </Pressable>
  );
}
