import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AvailabilityFilter } from '@/lib/types';
import { DEFAULT_RADIUS_KM } from '@/lib/constants';
import type { NotificationPrefs } from '@/lib/types';
import { DEFAULT_NOTIFICATION_PREFS } from '@/lib/types';

interface AppState {
  radiusKm: number;
  filter: AvailabilityFilter;
  filterSheetOpen: boolean;
  notificationPrefs: NotificationPrefs;
  setRadiusKm: (km: number) => void;
  setFilter: (f: AvailabilityFilter) => void;
  setFilterSheetOpen: (open: boolean) => void;
  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      radiusKm: DEFAULT_RADIUS_KM,
      filter: 'now',
      filterSheetOpen: false,
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      setRadiusKm: (km) => set({ radiusKm: km }),
      setFilter: (f) => set({ filter: f }),
      setFilterSheetOpen: (open) => set({ filterSheetOpen: open }),
      setNotificationPrefs: (prefs) =>
        set((s) => ({
          notificationPrefs: { ...s.notificationPrefs, ...prefs },
        })),
      resetFilters: () =>
        set({ radiusKm: DEFAULT_RADIUS_KM, filter: 'now' }),
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
