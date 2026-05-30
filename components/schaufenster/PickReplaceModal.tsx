import { ConfirmModal } from '@/components/ui/Modal';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS } from '@/lib/designTokens';
import { triggerHaptic } from '@/lib/haptics';

type Props = {
  visible: boolean;
  currentPartnerName: string;
  newPartnerName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Bestätigung: aktiven Pick beenden und neuen starten */
export function PickReplaceModal({
  visible,
  currentPartnerName,
  newPartnerName,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <ConfirmModal
      visible={visible}
      title="Du hast einen aktiven Pick"
      message={`Pro Runde ist nur ein Pick möglich. Du bist gerade mit ${currentPartnerName} verbunden. Wenn du ${newPartnerName} picken willst, beenden wir den bisherigen Pick — danach startet ihr einen neuen 24h-Chat.`}
      confirmLabel="Pick wechseln"
      cancelLabel="Beim aktuellen Pick bleiben"
      icon={<FlingIcon name="pick" size={28} color={FLING_COLORS.accent} />}
      onConfirm={() => {
        triggerHaptic('medium');
        onConfirm();
      }}
      onCancel={onCancel}
    />
  );
}
