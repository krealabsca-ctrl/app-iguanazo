import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'normal' | 'large' | 'extra-large';

interface SettingsState {
  theme: ThemeMode;
  fontSize: FontSize;
  language: string;
  notifications: {
    breakingNews: boolean;
    livePrograms: boolean;
    dailySummaryAM: boolean;
    categories: Record<string, boolean>;
    programReminders: Record<string, boolean>;
  };
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  setLanguage: (lang: string) => void;
  toggleNotification: (key: 'breakingNews' | 'livePrograms' | 'dailySummaryAM') => void;
  toggleCategoryNotification: (categoryId: string) => void;
  toggleProgramReminder: (programId: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      fontSize: 'normal',
      language: 'es-VE',
      notifications: {
        breakingNews: true,
        livePrograms: true,
        dailySummaryAM: true,
        categories: { '1': true, '2': true, '3': true, '4': true, '5': true, '6': true, '7': true },
        programReminders: {},
      },
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLanguage: (language) => set({ language }),
      toggleNotification: (key) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: !state.notifications[key] },
        })),
      toggleCategoryNotification: (categoryId) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            categories: {
              ...state.notifications.categories,
              [categoryId]: !state.notifications.categories[categoryId],
            },
          },
        })),
      toggleProgramReminder: (programId) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            programReminders: {
              ...state.notifications.programReminders,
              [programId]: !state.notifications.programReminders?.[programId],
            },
          },
        })),
    }),
    {
      name: 'laiguana-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
