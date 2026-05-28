import { Modal as RNModal, View, Pressable } from 'react-native';
import { DisplayText, BodyText } from './Typography';
import { Button } from './Button';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/65 items-center justify-center px-5">
        <View className="w-full bg-card border border-line-2 rounded-[22px] p-5 items-center">
          <View className="w-[54px] h-[54px] rounded-full bg-accent/15 border border-accent/30 items-center justify-center mb-3">
            <DisplayText className="text-accent text-2xl">!</DisplayText>
          </View>
          <DisplayText className="text-[22px] text-center mb-2">{title}</DisplayText>
          <BodyText className="text-center mb-4">{message}</BodyText>
          <View className="w-full gap-2">
            <Button label={confirmLabel} onPress={onConfirm} />
            <Button label={cancelLabel} variant="ghost" onPress={onCancel} />
          </View>
        </View>
        <Pressable className="absolute inset-0 -z-10" onPress={onCancel} />
      </View>
    </RNModal>
  );
}
