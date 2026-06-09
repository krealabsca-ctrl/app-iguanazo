import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FollowState {
  followedPrograms: string[];
  followedJournalists: string[];
  toggleProgram: (programId: string) => void;
  toggleJournalist: (journalistId: string) => void;
  isFollowingProgram: (programId: string) => boolean;
  isFollowingJournalist: (journalistId: string) => boolean;
}

export const useFollowStore = create<FollowState>()(
  persist(
    (set, get) => ({
      followedPrograms: [],
      followedJournalists: [],
      toggleProgram: (programId) =>
        set((state) => ({
          followedPrograms: state.followedPrograms.includes(programId)
            ? state.followedPrograms.filter((id) => id !== programId)
            : [programId, ...state.followedPrograms],
        })),
      toggleJournalist: (journalistId) =>
        set((state) => ({
          followedJournalists: state.followedJournalists.includes(journalistId)
            ? state.followedJournalists.filter((id) => id !== journalistId)
            : [journalistId, ...state.followedJournalists],
        })),
      isFollowingProgram: (programId) => get().followedPrograms.includes(programId),
      isFollowingJournalist: (journalistId) => get().followedJournalists.includes(journalistId),
    }),
    { name: 'laiguana-follows', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
