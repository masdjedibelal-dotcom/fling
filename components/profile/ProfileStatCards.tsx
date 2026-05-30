import { View, Text } from 'react-native';
import { FLING_RADIUS, FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

function StatCell({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-1 items-center py-4 px-2 ${isLast ? '' : 'border-r border-line'}`}
    >
      <Text
        className="text-white font-bold text-center tracking-tight"
        style={{ fontSize: FLING_TYPE.title, lineHeight: 24 }}
        numberOfLines={1}
      >
        {value || '—'}
      </Text>
      <Text
        className="text-fg-3 font-semibold mt-1.5 uppercase tracking-wide"
        style={{ fontSize: FLING_TYPE.caption2 }}
      >
        {label}
      </Text>
    </View>
  );
}

export function ProfileStatCards({
  pseudonym,
  age,
  job,
}: {
  pseudonym: string;
  age: string;
  job: string;
}) {
  return (
    <View
      className="flex-row mb-4 border border-line overflow-hidden"
      style={{ borderRadius: FLING_RADIUS.md, backgroundColor: FLING_COLORS.card }}
    >
      <StatCell label="Pseudonym" value={pseudonym.trim()} />
      <StatCell label="Alter" value={age.trim()} />
      <StatCell label="Beruf" value={job.trim()} isLast />
    </View>
  );
}
