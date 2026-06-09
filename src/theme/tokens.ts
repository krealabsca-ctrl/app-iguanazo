import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';

export const BRAND_RED = '#c82022';

export const palette = {
  light: {
    primary: BRAND_RED,
    bgPrimary: '#FFFFFF',
    bgSecondary: '#FAFAFA',
    bgTertiary: '#F4F4F5',
    bgInverse: '#0A0A0A',
    textPrimary: '#0A0A0A',
    textSecondary: '#525252',
    textTertiary: '#A3A3A3',
    textInverse: '#FAFAFA',
    borderDefault: '#E5E5E5',
    borderStrong: '#0A0A0A',
    accentPrimary: BRAND_RED,
    accentSecondary: BRAND_RED,
    accentHighlight: '#EAB308',
    boneWhite: '#F5F1E8',
    pearl: '#FAFAFA',
    pearlBorder: '#F0EFEB',
  },
  dark: {
    primary: BRAND_RED,
    bgPrimary: '#0A0A0A',
    bgSecondary: '#171717',
    bgTertiary: '#262626',
    bgInverse: '#FFFFFF',
    textPrimary: '#FAFAFA',
    textSecondary: '#A3A3A3',
    textTertiary: '#737373',
    textInverse: '#0A0A0A',
    borderDefault: '#262626',
    borderStrong: '#FAFAFA',
    accentPrimary: BRAND_RED,
    accentSecondary: BRAND_RED,
    accentHighlight: '#FACC15',
    boneWhite: '#1F1B14',
    pearl: '#171717',
    pearlBorder: '#262626',
  },
};

export type ThemeName = 'light' | 'dark';
export type Palette = typeof palette.light;

export const fonts = {
  regular: 'OpenSans_400Regular',
  medium: 'OpenSans_500Medium',
  semibold: 'OpenSans_600SemiBold',
  bold: 'OpenSans_700Bold',
};

export const typography = {
  display: { fontFamily: fonts.bold, size: 32 },
  h1: { size: 26 },
  h2: { size: 22 },
  h3: { size: 18 },
  bodyLg: { size: 17 },
  body: { size: 15 },
  caption: { size: 13 },
  micro: { size: 11 },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const radius = {
  card: 12,
  button: 8,
  chip: 999,
  image: 8,
};

export function useTheme(): Palette {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.theme);
  const effective: ThemeName =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;
  return palette[effective];
}

export function useThemeName(): ThemeName {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.theme);
  return themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;
}
