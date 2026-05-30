import { View, Text } from 'react-native';
import { FLING_TYPE } from '@/lib/designTokens';
import { FlingIcon } from '@/components/icons/FlingIcon';

type Props = {
  label?: string;
  size?: number;
};

export function VerifiedBadge({ label = 'Verifiziert', size = 16 }: Props) {
  return (
    <View className="flex-row items-center gap-1.5">
      <FlingIcon name="verified" size={size} color="#E11539" />
      <Text
        className="text-fg-3 font-semibold"
        style={{ fontSize: FLING_TYPE.caption }}
      >
        {label}
      </Text>
    </View>
  );
}
