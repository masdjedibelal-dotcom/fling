import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

/** Feste Höhe der oberen Zeile — Filter-Sheet startet direkt darunter */
export function getAuswahlHeaderHeight(topInset: number): number {
  return topInset + 6 + 40 + 12;
}

export function AuswahlHeader({
  activeCount,
  onFilterPress,
  filterActive,
}: {
  activeCount: number;
  onFilterPress: () => void;
  /** Filter-Sheet offen — Icon hervorheben */
  filterActive?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-3 pb-3 z-10"
      style={{
        paddingTop: insets.top + 6,
        backgroundColor: FLING_COLORS.bg,
      }}
    >
      <View className="flex-row items-center gap-2 flex-1">
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: FLING_COLORS.green,
            shadowColor: FLING_COLORS.green,
            shadowOpacity: 0.8,
            shadowRadius: 6,
          }}
        />
        <Text
          className="text-white font-semibold"
          style={{ fontSize: FLING_TYPE.subhead }}
        >
          {activeCount} aktiv · in der Nähe
        </Text>
      </View>
      <Pressable
        onPress={onFilterPress}
        accessibilityLabel="Filter"
        className="w-10 h-10 rounded-full items-center justify-center border"
        style={{
          borderColor: filterActive ? FLING_COLORS.accent : 'rgba(255,255,255,0.12)',
          backgroundColor: filterActive ? 'rgba(225,21,57,0.2)' : 'rgba(255,255,255,0.05)',
        }}
      >
        <FlingIcon
          name="filter"
          size={20}
          color={filterActive ? FLING_COLORS.accent : FLING_COLORS.fg2}
        />
      </Pressable>
    </View>
  );
}
