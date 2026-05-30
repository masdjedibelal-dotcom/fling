import { View, Text } from 'react-native';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { formatDistance } from '@/lib/profileStatus';
import { FLING_TYPE } from '@/lib/designTokens';
import type { SchaufensterProfile } from '@/lib/types';

/** Alter · Beruf · Distanz über dem Profilfoto */
export function ProfileMetaPills({ profile }: { profile: SchaufensterProfile }) {
  const age =
    profile.age != null && profile.age > 0 ? String(profile.age) : '—';
  const job = profile.job?.trim() || '—';
  const dist = formatDistance(profile.distance_km);

  return (
    <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1 self-start">
      <MetaChip label={age} />
      <Text className="text-white/35" style={{ fontSize: FLING_TYPE.subhead }}>
        ·
      </Text>
      <MetaChip label={job} />
      <Text className="text-white/35" style={{ fontSize: FLING_TYPE.subhead }}>
        ·
      </Text>
      <View className="flex-row items-center gap-1">
        <FlingIcon name="pin" size={13} color="rgba(255,255,255,0.85)" />
        <Text
          className="text-white font-semibold tracking-tight"
          style={{ fontSize: FLING_TYPE.subhead }}
        >
          {dist}
        </Text>
      </View>
    </View>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <Text
      className="text-white font-semibold tracking-tight"
      style={{ fontSize: FLING_TYPE.subhead }}
    >
      {label}
    </Text>
  );
}
