import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  userName: string;
  userImage: string | null;
  setUserName: (name: string) => void;
  setUserImage: (image: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userName: 'Invitado',
      userImage: null,
      setUserName: (userName) => set({ userName }),
      setUserImage: (userImage) => set({ userImage }),
    }),
    { name: 'laiguana-user', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
