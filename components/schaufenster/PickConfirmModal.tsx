import { ConfirmModal } from '@/components/ui/Modal';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS } from '@/lib/designTokens';
import { PICK_CONFIRM_FEMALE } from '@/lib/marketingCopy';
import { triggerHaptic } from '@/lib/haptics';

type Props = {
  visible: boolean;
  partnerName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function PickConfirmModal({
  visible,
  partnerName,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <ConfirmModal
      visible={visible}
      title={PICK_CONFIRM_FEMALE.title}
      message={PICK_CONFIRM_FEMALE.message(partnerName)}
      confirmLabel={PICK_CONFIRM_FEMALE.confirm}
      cancelLabel={PICK_CONFIRM_FEMALE.cancel}
      icon={<FlingIcon name="pick" size={28} color={FLING_COLORS.accent} />}
      onConfirm={() => {
        triggerHaptic('success');
        onConfirm();
      }}
      onCancel={onCancel}
    />
  );
}
