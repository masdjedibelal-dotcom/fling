import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

/** Standort nur per GPS — angezeigte Stadt ist read-only. */
export function ProfileLocationBar({
  city,
  detecting,
  onDetectLocation,
  embedded,
}: {
  city: string;
  detecting: boolean;
  onDetectLocation: () => void;
  embedded?: boolean;
}) {
  const hasCity = Boolean(city.trim());

  return (
    <View className={embedded ? 'mb-4' : 'mb-4 px-1'}>
      <View
        className="rounded-md border border-line-2 px-4 py-3.5 mb-3 min-h-[52px] justify-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        {hasCity ? (
          <View className="flex-row items-center gap-2">
            <FlingIcon name="pin" size={16} color={FLING_COLORS.fg2} />
            <Text
              className="text-white font-semibold flex-1"
              style={{ fontSize: FLING_TYPE.body }}
              numberOfLines={1}
            >
              {city.trim()}
            </Text>
          </View>
        ) : (
          <Text className="text-fg-4" style={{ fontSize: FLING_TYPE.subhead }}>
            Noch kein Standort — unten ermitteln
          </Text>
        )}
      </View>

      <Pressable
        onPress={onDetectLocation}
        disabled={detecting}
        className="flex-row items-center justify-center gap-2 py-3 rounded-pill border border-line-2 bg-white/[0.06]"
        style={{ opacity: detecting ? 0.7 : 1 }}
      >
        {detecting ? (
          <ActivityIndicator size="small" color={FLING_COLORS.accent} />
        ) : (
          <FlingIcon name="pin" size={18} color={FLING_COLORS.accent} />
        )}
        <Text
          className="text-white font-semibold"
          style={{ fontSize: FLING_TYPE.subhead }}
        >
          {detecting
            ? 'Standort wird ermittelt…'
            : hasCity
              ? 'Standort aktualisieren'
              : 'Standort ermitteln'}
        </Text>
      </Pressable>
    </View>
  );
}
