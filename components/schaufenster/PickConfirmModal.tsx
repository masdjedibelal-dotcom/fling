import { ConfirmModal } from '@/components/ui/Modal';
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
      onConfirm={() => {
        triggerHaptic('success');
        onConfirm();
      }}
      onCancel={onCancel}
    />
  );
}
