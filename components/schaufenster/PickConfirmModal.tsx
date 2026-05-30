import { ConfirmModal } from '@/components/ui/Modal';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS } from '@/lib/designTokens';
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
      title="Pick für 24 Stunden?"
      message={`Du lässt dich auf dein Abenteuer mit ${partnerName} ein. Ein Pick, ein Chat — danach kein Wechsel.`}
      confirmLabel="Abenteuer starten"
      cancelLabel="Noch schauen"
      icon={<FlingIcon name="pick" size={28} color={FLING_COLORS.accent} />}
      onConfirm={() => {
        triggerHaptic('success');
        onConfirm();
      }}
      onCancel={onCancel}
    />
  );
}
