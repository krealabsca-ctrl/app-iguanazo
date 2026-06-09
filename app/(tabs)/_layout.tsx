import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Newspaper, Radio, Mic, Bookmark } from 'lucide-react-native';
import { useTheme } from '@/theme/tokens';
import { useMenuStore } from '@/store/useMenuStore';

export const unstable_settings = {
  initialRouteName: 'live',
};

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      initialRouteName="live"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="live" options={{ title: 'En Vivo' }} />
      <Tabs.Screen name="index" options={{ title: 'Noticias' }} />
      <Tabs.Screen name="podcasts" options={{ title: 'Podcasts' }} />
      <Tabs.Screen name="iguanazo" options={{ title: 'Mi Iguana' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { openMenu } = useMenuStore();

  const tabs = [
    { name: 'live', label: 'En Vivo', Icon: Radio, route: 'live' },
    { name: 'index', label: 'Noticias', Icon: Newspaper, route: 'index' },
    { name: 'podcasts', label: 'Podcasts', Icon: Mic, route: 'podcasts' },
    { name: 'iguanazo', label: 'Mi Iguana', Icon: Bookmark, route: 'iguanazo' },
    { name: 'menu', label: 'Menú', Icon: null, route: null },
  ];

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.bgPrimary,
          borderTopColor: theme.borderDefault,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {tabs.map((tab, i) => {
        const isActive =
          tab.route !== null && state.routes[state.index]?.name === tab.route;
        const Icon = tab.Icon;
        const tintActive = tab.name === 'iguanazo' ? theme.accentSecondary : theme.accentPrimary;
        const tint = isActive ? tintActive : theme.textTertiary;

        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              if (tab.route === null) {
                openMenu();
              } else {
                navigation.navigate(tab.route);
              }
            }}
            style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.6 : 1 }]}
          >
            {Icon ? (
              <Icon size={24} color={tint} fill={isActive ? `${tintActive}20` : 'transparent'} />
            ) : (
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.label, { color: tint, fontWeight: '600' }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  label: {
    fontSize: 11,
  },
});
