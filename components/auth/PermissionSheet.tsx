import { Modal, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

interface PermissionSheetProps {
  visible: boolean;
  icon: keyof typeof Ionicons.glyphMap;
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
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/55 justify-end">
        <Pressable className="flex-1" onPress={onSecondary} />
        <View className="bg-[#1c1a18] border-t border-line-2 rounded-t-3xl px-6 pt-6 pb-8 items-center gap-3">
          <View className="w-[72px] h-[72px] rounded-[20px] bg-accent/15 border border-accent/30 items-center justify-center mb-1">
            <Ionicons name={icon} size={32} color="#D11537" />
          </View>
          <DisplayText className="text-[22px] text-center leading-tight">
            {title}
          </DisplayText>
          <BodyText className="text-center max-w-[260px]">{description}</BodyText>
          <View className="w-full gap-2 mt-2">
            <Button label={primaryLabel} onPress={onPrimary} />
            <Button label={secondaryLabel} variant="ghost" onPress={onSecondary} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
