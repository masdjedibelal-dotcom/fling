import type { ReactNode } from 'react';
import { Modal as RNModal, View, Pressable } from 'react-native';
import { TitleText, BodyLarge } from './Typography';
import { Button } from './Button';
import { accentRgba, FLING_RADIUS, FLING_COLORS } from '@/lib/designTokens';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: ReactNode;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  icon,
}: ConfirmModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade">
      <View
        className="flex-1 items-center justify-center px-5"
        style={{ backgroundColor: FLING_COLORS.overlayScrim }}
      >
        <View
          className="w-full border border-line-2 p-6 items-center"
          style={{ borderRadius: FLING_RADIUS.xl, backgroundColor: FLING_COLORS.card }}
        >
          <View
            className="w-14 h-14 rounded-full items-center justify-center mb-4 border border-accent/30"
            style={{ backgroundColor: accentRgba(0.14) }}
          >
            {icon ?? <TitleText className="text-accent">!</TitleText>}
          </View>
          <TitleText className="text-center mb-2">{title}</TitleText>
          <BodyLarge className="text-center mb-6 leading-7">{message}</BodyLarge>
          <View className="w-full gap-2.5">
            <Button label={confirmLabel} onPress={onConfirm} />
            <Button label={cancelLabel} variant="ghost" onPress={onCancel} />
          </View>
        </View>
        <Pressable className="absolute inset-0 -z-10" onPress={onCancel} />
      </View>
    </RNModal>
  );
}
