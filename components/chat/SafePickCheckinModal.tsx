import { useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  TextInput,
  Text,
  ActivityIndicator,
} from 'react-native';
import { DisplayText, BodyText, MetaText } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { SAFE_PICK_NOTE_MAX } from '@/lib/constants';
import { submitSafePickFollowUp } from '@/lib/safePick';
import type { SafePickRating, SafePickSession } from '@/lib/types';
import { SafePickMark } from '@/components/graphics';

interface SafePickCheckinModalProps {
  visible: boolean;
  session: SafePickSession;
  onClose: () => void;
  onSubmitted: (session: SafePickSession) => void;
}

export function SafePickCheckinModal({
  visible,
  session,
  onClose,
  onSubmitted,
}: SafePickCheckinModalProps) {
  const [rating, setRating] = useState<SafePickRating | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!rating) {
      setError('Bitte wählen, wie es lief');
      return;
    }
    setSaving(true);
    setError(null);
    const { session: updated, error: err } = await submitSafePickFollowUp(
      session.id,
      rating,
      note,
    );
    setSaving(false);
    if (err || !updated) {
      setError(err ?? 'Speichern fehlgeschlagen');
      return;
    }
    onSubmitted(updated);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/70 items-center justify-center px-5">
        <View className="w-full bg-card border border-line-2 rounded-[22px] p-5">
          <View className="items-center mb-3">
            <SafePickMark size={56} />
          </View>
          <DisplayText className="text-xl text-center mb-1">Wie läuft’s?</DisplayText>
          <BodyText className="text-fg-3 text-center mb-5 leading-5">
            Kurz für uns — dein Pick sieht das nicht.
          </BodyText>

          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={() => setRating('good')}
              className={`flex-1 py-4 rounded-xl border items-center ${
                rating === 'good'
                  ? 'bg-accent/25 border-accent'
                  : 'bg-white/5 border-line'
              }`}
            >
              <Text className="text-2xl mb-1">😊</Text>
              <Text className="text-white font-semibold text-[14px]">Gut</Text>
            </Pressable>
            <Pressable
              onPress={() => setRating('bad')}
              className={`flex-1 py-4 rounded-xl border items-center ${
                rating === 'bad'
                  ? 'bg-accent/25 border-accent'
                  : 'bg-white/5 border-line'
              }`}
            >
              <Text className="text-2xl mb-1">😞</Text>
              <Text className="text-white font-semibold text-[14px]">Schlecht</Text>
            </Pressable>
          </View>

          <MetaText className="text-fg-4 mb-2 normal-case">Optional · kurz</MetaText>
          <TextInput
            value={note}
            onChangeText={(t) => setNote(t.slice(0, SAFE_PICK_NOTE_MAX))}
            placeholder="Was möchtest du uns sagen?"
            placeholderTextColor="rgba(255,255,255,0.35)"
            multiline
            className="bg-white/5 border border-line-2 rounded-xl px-4 py-3 text-white text-[15px] min-h-[80px] mb-1 font-body"
          />
          <Text className="font-mono text-fg-4 text-[10px] text-right mb-4">
            {note.length}/{SAFE_PICK_NOTE_MAX}
          </Text>

          {error ? (
            <BodyText className="text-accent text-center mb-3">{error}</BodyText>
          ) : null}

          {saving ? (
            <ActivityIndicator color="#D11537" />
          ) : (
            <Button label="Absenden" onPress={onSubmit} />
          )}
          <Button label="Später" variant="ghost" onPress={onClose} className="mt-2" />
        </View>
        <Pressable className="absolute inset-0 -z-10" onPress={onClose} />
      </View>
    </Modal>
  );
}
