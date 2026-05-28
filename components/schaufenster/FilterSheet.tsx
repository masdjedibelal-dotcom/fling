import { Modal, View, Pressable, Text } from 'react-native';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import type { AvailabilityFilter } from '@/lib/types';
import { MAX_RADIUS_KM } from '@/lib/constants';

const FILTERS: { key: AvailabilityFilter; label: string }[] = [
  { key: 'now', label: 'Jetzt' },
  { key: 'today', label: 'Heute' },
  { key: 'all', label: 'Alle' },
];

export function FilterSheet({
  visible,
  onClose,
  maleCount,
}: {
  visible: boolean;
  onClose: () => void;
  maleCount: number;
}) {
  const radiusKm = useAppStore((s) => s.radiusKm);
  const filter = useAppStore((s) => s.filter);
  const setRadiusKm = useAppStore((s) => s.setRadiusKm);
  const setFilter = useAppStore((s) => s.setFilter);
  const resetFilters = useAppStore((s) => s.resetFilters);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable className="flex-1 bg-black/55" onPress={onClose} />
      <View className="bg-[#181614] border-t border-line-2 rounded-t-3xl px-5 pt-3 pb-8">
        <View className="w-10 h-1 bg-white/20 rounded self-center mb-4" />
        <View className="flex-row justify-between items-center mb-5">
          <DisplayText className="text-xl">Filter</DisplayText>
          <Pressable onPress={resetFilters}>
            <Text className="text-fg-3 text-sm font-semibold">Zurücksetzen</Text>
          </Pressable>
        </View>

        <View className="mb-5">
          <View className="flex-row justify-between mb-2">
            <BodyText>Radius</BodyText>
            <BodyText className="text-white font-mono">{radiusKm} km</BodyText>
          </View>
          <View className="flex-row gap-2">
            {[1, 5, 10, 25, MAX_RADIUS_KM].map((km) => (
              <Pressable
                key={km}
                onPress={() => setRadiusKm(km)}
                className={`px-3 py-2 rounded-pill border ${
                  radiusKm === km ? 'bg-accent border-accent' : 'border-line'
                }`}
              >
                <Text className="text-white text-xs font-semibold">{km}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mb-6">
          <BodyText className="mb-2">Verfügbarkeit</BodyText>
          <View className="flex-row gap-2">
            {FILTERS.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                className={`flex-1 py-2.5 rounded-pill border items-center ${
                  filter === f.key ? 'bg-accent border-accent' : 'border-line'
                }`}
              >
                <Text className="text-white text-xs font-semibold">
                  {f.key === 'now' ? '● ' : ''}
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          label={`${maleCount} Männer anzeigen`}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}
