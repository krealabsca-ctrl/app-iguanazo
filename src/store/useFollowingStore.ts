import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FollowingState {
  journalists: string[];
  podcasts: string[];
  topics: string[];
  followJournalist: (id: string) => void;
  unfollowJournalist: (id: string) => void;
  isFollowingJournalist: (id: string) => boolean;
  followPodcast: (id: string) => void;
  unfollowPodcast: (id: string) => void;
  isFollowingPodcast: (id: string) => boolean;
  followTopic: (tag: string) => void;
  unfollowTopic: (tag: string) => void;
  isFollowingTopic: (tag: string) => boolean;
}

export const useFollowingStore = create<FollowingState>()(
  persist(
    (set, get) => ({
      journalists: [],
      podcasts: [],
      topics: [],
      followJournalist: (id) =>
        set((state) => ({
          journalists: state.journalists.includes(id) ? state.journalists : [...state.journalists, id],
        })),
      unfollowJournalist: (id) =>
        set((state) => ({ journalists: state.journalists.filter((x) => x !== id) })),
      isFollowingJournalist: (id) => get().journalists.includes(id),
      followPodcast: (id) =>
        set((state) => ({
          podcasts: state.podcasts.includes(id) ? state.podcasts : [...state.podcasts, id],
        })),
      unfollowPodcast: (id) => set((state) => ({ podcasts: state.podcasts.filter((x) => x !== id) })),
      isFollowingPodcast: (id) => get().podcasts.includes(id),
      followTopic: (tag) =>
        set((state) => ({
          topics: state.topics.includes(tag) ? state.topics : [...state.topics, tag],
        })),
      unfollowTopic: (tag) => set((state) => ({ topics: state.topics.filter((x) => x !== tag) })),
      isFollowingTopic: (tag) => get().topics.includes(tag),
    }),
    { name: 'iguanazo-following', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
