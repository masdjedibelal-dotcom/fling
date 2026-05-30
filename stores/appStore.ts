import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AvailabilityFilter } from '@/lib/types';
import { DEFAULT_RADIUS_KM } from '@/lib/constants';
import type { NotificationPrefs } from '@/lib/types';
import { DEFAULT_NOTIFICATION_PREFS } from '@/lib/types';

export type AuswahlViewMode = 'grid' | 'feed';

interface AppState {
  radiusKm: number;
  filter: AvailabilityFilter;
  radiusSheetOpen: boolean;
  auswahlViewMode: AuswahlViewMode;
  /** Nach Kachel-Tap: Feed ab diesem Profil öffnen */
  feedStartProfileId: string | null;
  notificationPrefs: NotificationPrefs;
  setRadiusKm: (km: number) => void;
  setFilter: (f: AvailabilityFilter) => void;
  setRadiusSheetOpen: (open: boolean) => void;
  setAuswahlViewMode: (mode: AuswahlViewMode) => void;
  setFeedStartProfileId: (id: string | null) => void;
  toggleAuswahlViewMode: () => void;
  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      radiusKm: DEFAULT_RADIUS_KM,
      filter: 'now',
      radiusSheetOpen: false,
      auswahlViewMode: 'grid',
      feedStartProfileId: null,
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      setRadiusKm: (km) => set({ radiusKm: km }),
      setFilter: (f) => set({ filter: f }),
      setRadiusSheetOpen: (open) => set({ radiusSheetOpen: open }),
      setAuswahlViewMode: (mode) => set({ auswahlViewMode: mode }),
      setFeedStartProfileId: (id) => set({ feedStartProfileId: id }),
      toggleAuswahlViewMode: () =>
        set((s) => ({
          auswahlViewMode: s.auswahlViewMode === 'grid' ? 'feed' : 'grid',
        })),
      setNotificationPrefs: (prefs) =>
        set((s) => ({
          notificationPrefs: { ...s.notificationPrefs, ...prefs },
        })),
      resetFilters: () => set({ radiusKm: DEFAULT_RADIUS_KM }),
    }),
    {
      name: 'fling_app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        radiusKm: s.radiusKm,
        filter: s.filter,
        notificationPrefs: s.notificationPrefs,
      }),
    },
  ),
);
