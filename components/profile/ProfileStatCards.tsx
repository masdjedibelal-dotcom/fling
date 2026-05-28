import { View, Text } from 'react-native';

function StatCard({
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
      className={`flex-1 items-center py-3 px-1 ${isLast ? '' : 'border-r border-line'}`}
    >
      <Text className="text-white text-[17px] font-bold tracking-tight text-center" numberOfLines={1}>
        {value || '—'}
      </Text>
      <Text className="text-fg-3 text-[10px] uppercase tracking-wider font-semibold mt-1">
        {label}
      </Text>
    </View>
  );
}

export function ProfileStatCards({
  job,
  age,
  city,
}: {
  job: string;
  age: string;
  city: string;
}) {
  return (
    <View className="flex-row rounded-xl overflow-hidden bg-card/80 border border-white/10 mb-2">
      <StatCard label="Beruf" value={job} />
      <StatCard label="Alter" value={age} />
      <StatCard label="Ort" value={city} isLast />
    </View>
  );
}
