import { View } from 'react-native';
import { TitleText, BodyLarge } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { BottomSheet, BottomSheetPanel } from '@/components/ui/BottomSheet';
import { FlingIcon } from '@/components/icons/FlingIcon';
import type { FlingIconName } from '@/components/icons/FlingIcon';
import { FLING_COLORS } from '@/lib/designTokens';

interface PermissionSheetProps {
  visible: boolean;
  icon: FlingIconName;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}

export function PermissionSheet({
  visible,
  icon,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: PermissionSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onSecondary}>
      <BottomSheetPanel withHandle={false} className="items-center pt-6">
        <View
          className="w-[72px] h-[72px] rounded-[20px] items-center justify-center mb-4 border border-accent/30"
          style={{ backgroundColor: 'rgba(225,21,57,0.12)' }}
        >
          <FlingIcon name={icon} size={32} color={FLING_COLORS.accent} />
        </View>
        <TitleText className="text-center leading-tight mb-2">{title}</TitleText>
        <BodyLarge className="text-center max-w-[300px] mb-6 leading-7">
          {description}
        </BodyLarge>
        <View className="w-full gap-2.5">
          <Button label={primaryLabel} onPress={onPrimary} />
          <Button label={secondaryLabel} variant="ghost" onPress={onSecondary} />
        </View>
      </BottomSheetPanel>
    </BottomSheet>
  );
}
