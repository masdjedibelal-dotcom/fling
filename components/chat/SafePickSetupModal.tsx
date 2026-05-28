import { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  TextInput,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { DisplayText, BodyText, MetaText } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import {
  SAFE_PICK_AREA_MAX,
  SAFE_PICK_CHECK_IN_DELAYS,
  SAFE_PICK_CONTEXT_MAX,
  SAFE_PICK_MEET_HOURS,
} from '@/lib/constants';
import { buildMeetAtToday, createSafePick } from '@/lib/safePick';
import type { SafePickSession } from '@/lib/types';
import { SafePickMark } from '@/components/graphics';

interface SafePickSetupModalProps {
  visible: boolean;
  matchId: string;
  userId: string;
  defaultArea?: string;
  onClose: () => void;
  onCreated: (session: SafePickSession) => void;
}

export function SafePickSetupModal({
  visible,
  matchId,
  userId,
  defaultArea = '',
  onClose,
  onCreated,
}: SafePickSetupModalProps) {
  const defaultHour = useMemo(() => {
    const h = new Date().getHours();
    const next = SAFE_PICK_MEET_HOURS.find((x) => x > h) ?? SAFE_PICK_MEET_HOURS[0];
    return next;
  }, []);

  const [hour, setHour] = useState(defaultHour);
  const [area, setArea] = useState(defaultArea);
  const [context, setContext] = useState('');
  const [delayMin, setDelayMin] = useState<number>(120);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setSaving(true);
    setError(null);
    const meetAt = buildMeetAtToday(hour);
    const { session, error: err } = await createSafePick({
      matchId,
      userId,
      meetAt,
      areaText: area,
      contextNote: context || undefined,
      checkInDelayMinutes: delayMin,
    });
    setSaving(false);
    if (err || !session) {
      setError(err ?? 'Konnte nicht speichern');
      return;
    }
    onCreated(session);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable className="flex-1 bg-black/60" onPress={onClose} />
      <View className="bg-card border-t border-line-2 rounded-t-3xl max-h-[88%]">
        <ScrollView
          className="px-5 pt-5 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center gap-3 mb-1">
            <SafePickMark size={40} />
            <DisplayText className="text-xl flex-1">Safe Pick</DisplayText>
          </View>
          <BodyText className="text-fg-3 mb-4 leading-5">
            Diskret nur für dich und unser Team. Dein Pick erfährt nichts — wir fragen später
            kurz nach, wie es lief.
          </BodyText>

          <MetaText className="text-fg-4 mb-2 normal-case">Wann triffst du dich?</MetaText>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {SAFE_PICK_MEET_HOURS.map((h) => (
              <Pressable
                key={h}
                onPress={() => setHour(h)}
                className={`px-4 py-2.5 rounded-pill border ${
                  hour === h
                    ? 'bg-accent border-accent'
                    : 'bg-white/5 border-line'
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    hour === h ? 'text-white' : 'text-fg-2'
                  }`}
                >
                  {String(h).padStart(2, '0')}:00
                </Text>
              </Pressable>
            ))}
          </View>

          <MetaText className="text-fg-4 mb-2 normal-case">Wo ungefähr?</MetaText>
          <TextInput
            value={area}
            onChangeText={(t) => setArea(t.slice(0, SAFE_PICK_AREA_MAX))}
            placeholder="z. B. Glockenbachviertel"
            placeholderTextColor="rgba(255,255,255,0.35)"
            className="bg-white/5 border border-line-2 rounded-xl px-4 py-3.5 text-white text-[15px] mb-1 font-body"
          />
          <Text className="font-mono text-fg-4 text-[10px] text-right mb-4">
            {area.length}/{SAFE_PICK_AREA_MAX}
          </Text>

          <MetaText className="text-fg-4 mb-2 normal-case">
            Kurz für uns (optional)
          </MetaText>
          <TextInput
            value={context}
            onChangeText={(t) => setContext(t.slice(0, SAFE_PICK_CONTEXT_MAX))}
            placeholder="z. B. erstes Treffen, Café"
            placeholderTextColor="rgba(255,255,255,0.35)"
            className="bg-white/5 border border-line-2 rounded-xl px-4 py-3.5 text-white text-[15px] mb-4 font-body"
          />

          <MetaText className="text-fg-4 mb-2 normal-case">
            Nachfrage nach Treffen
          </MetaText>
          <View className="flex-row gap-2 mb-5">
            {SAFE_PICK_CHECK_IN_DELAYS.map((m) => (
              <Pressable
                key={m}
                onPress={() => setDelayMin(m)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  delayMin === m
                    ? 'bg-accent/20 border-accent'
                    : 'bg-white/5 border-line'
                }`}
              >
                <Text className="text-white text-[13px] font-semibold">
                  {m / 60}h
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? (
            <BodyText className="text-accent text-center mb-3">{error}</BodyText>
          ) : null}

          {saving ? (
            <ActivityIndicator color="#D11537" className="my-2" />
          ) : (
            <Button label="Safe Pick aktivieren" onPress={onSubmit} />
          )}
          <Button label="Abbrechen" variant="ghost" onPress={onClose} className="mt-2" />
        </ScrollView>
      </View>
    </Modal>
  );
}
