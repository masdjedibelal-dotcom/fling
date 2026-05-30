import { View, Text } from 'react-native';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { formatDistance } from '@/lib/profileStatus';
import { FLING_TYPE } from '@/lib/designTokens';

/** Distanz über dem Profilfoto — nur Pin + Text */
export function ProfileMetaPills({ distanceKm }: { distanceKm: number }) {
  return (
    <View className="flex-row items-center gap-1.5 self-start">
      <FlingIcon name="pin" size={14} color="#FFFFFF" />
      <Text
        className="text-white font-semibold tracking-tight"
        style={{ fontSize: FLING_TYPE.subhead }}
      >
        {formatDistance(distanceKm)}
      </Text>
    </View>
  );
}
