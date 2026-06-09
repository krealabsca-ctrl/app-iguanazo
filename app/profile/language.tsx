import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

import { SubHeader } from '@/components/layout/SubHeader';
import { useTheme } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';

const languages = [
  { value: 'es-VE', label: 'Español (Venezuela)' },
  { value: 'es-MX', label: 'Español (México)' },
  { value: 'es-ES', label: 'Español (España)' },
  { value: 'en-US', label: 'English (US)' },
];

export default function Language() {
  const theme = useTheme();
  const { language, setLanguage } = useSettingsStore();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgSecondary }}>
      <SubHeader title="Idioma" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200 }}>
        <View style={{ backgroundColor: theme.bgPrimary, borderRadius: 12 }}>
          {languages.map((l, i) => (
            <Pressable
              key={l.value}
              onPress={() => setLanguage(l.value)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: i !== languages.length - 1 ? 1 : 0,
                borderBottomColor: theme.borderDefault,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 15 }}>{l.label}</Text>
              {language === l.value && <Check size={18} color={theme.accentPrimary} />}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
