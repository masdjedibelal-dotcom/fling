import { View, Text } from 'react-native';
import { FLING_TYPE } from '@/lib/designTokens';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS } from '@/lib/designTokens';

type Props = {
  label?: string;
  size?: number;
};

export function VerifiedBadge({ label = 'Verifiziert', size = 16 }: Props) {
  return (
    <View className="flex-row items-center gap-1.5">
      <FlingIcon name="verified" size={size} color={FLING_COLORS.accent} />
      <Text
        className="text-fg-3 font-semibold"
        style={{ fontSize: FLING_TYPE.caption }}
      >
        {label}
      </Text>
    </View>
  );
}
