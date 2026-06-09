import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubHeader } from '@/components/layout/SubHeader';
import { Toggle } from '@/components/ui/Toggle';
import { useTheme } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';
import { mockCategories } from '@/api/mocks';

export default function NotificationSettings() {
  const theme = useTheme();
  const { notifications, toggleNotification, toggleCategoryNotification } = useSettingsStore();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgSecondary }}>
      <SubHeader title="Notificaciones" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200, gap: 16 }}>
        <View style={{ backgroundColor: theme.bgPrimary, borderRadius: 12, padding: 16 }}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: theme.textPrimary, marginBottom: 16 }}>
            Generales
          </Text>

          <Row
            theme={theme}
            label="Último Minuto"
            description="Noticias urgentes y de gran impacto"
            checked={notifications.breakingNews}
            onChange={() => toggleNotification('breakingNews')}
            divider
          />
          <Row
            theme={theme}
            label="Podcasts en vivo"
            description="Avisos cuando inician los programas"
            checked={notifications.livePrograms}
            onChange={() => toggleNotification('livePrograms')}
            divider
          />
          <Row
            theme={theme}
            label="Resumen diario AM"
            description="Las noticias clave para arrancar el día"
            checked={notifications.dailySummaryAM}
            onChange={() => toggleNotification('dailySummaryAM')}
          />
        </View>

        <View style={{ backgroundColor: theme.bgPrimary, borderRadius: 12, padding: 16 }}>
          <Text style={{ fontWeight: '600', fontSize: 15, color: theme.textPrimary, marginBottom: 16 }}>
            Categorías
          </Text>
          {mockCategories.map((c, idx) => (
            <Row
              key={c.id}
              theme={theme}
              label={c.name}
              checked={!!notifications.categories[c.id]}
              onChange={() => toggleCategoryNotification(c.id)}
              divider={idx !== mockCategories.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  theme,
  label,
  description,
  checked,
  onChange,
  divider,
}: {
  theme: any;
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  divider?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: theme.borderDefault,
      }}
    >
      <View style={{ flex: 1, paddingRight: 16 }}>
        <Text style={{ color: theme.textPrimary, fontWeight: '500', fontSize: 15 }}>{label}</Text>
        {description && <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>{description}</Text>}
      </View>
      <Toggle checked={checked} onChange={onChange} />
    </View>
  );
}
