import { View } from 'react-native';
import { BodyText } from '@/components/ui/Typography';
import { VerifiedStamp } from './VerifiedStamp';

type Props = {
  label?: string;
  size?: number;
};

export function VerifiedBadge({ label = 'Verifiziert', size = 20 }: Props) {
  return (
    <View className="flex-row items-center gap-1.5">
      <VerifiedStamp size={size} />
      <BodyText className="text-fg-3 text-[11px] font-semibold uppercase tracking-wider">
        {label}
      </BodyText>
    </View>
  );
}
