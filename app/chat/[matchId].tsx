import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/ui/Screen';
import { DisplayText, BodyText, MetaText } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { ConfirmModal } from '@/components/ui/Modal';
import { TimerRing } from '@/components/chat/TimerRing';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { useAuthStore } from '@/stores/authStore';
import { useMatch } from '@/hooks/useMatch';
import { useChat } from '@/hooks/useChat';
import { cancelMatch, submitReport } from '@/lib/api';
import { MAX_MESSAGE_LENGTH, REPORT_REASONS } from '@/lib/constants';
import { useSafePick } from '@/hooks/useSafePick';
import { SafePickSetupModal } from '@/components/chat/SafePickSetupModal';
import { SafePickCheckinModal } from '@/components/chat/SafePickCheckinModal';
import { formatSafePickMeetTime } from '@/lib/safePick';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { useDiscreetScreen } from '@/hooks/useDiscreetScreen';

export default function ChatScreen() {
  useDiscreetScreen();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const userId = useAuthStore((s) => s.userId) ?? 'demo';
  const gender = useAuthStore((s) => s.gender);
  const isFemale = gender === 'female';
  const profile = useAuthStore((s) => s.profile);

  const { match, remainingHours, remainingMinutes, progress, isExpired } =
    useMatch(userId);
  const { visible, blurred, send } = useChat(matchId ?? null, userId, isFemale);

  const [text, setText] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [safePickSetupOpen, setSafePickSetupOpen] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);

  const {
    session: safePick,
    checkInDue,
    refresh: refreshSafePick,
    isActive: safePickActive,
    isCompleted: safePickDone,
  } = useSafePick(matchId ?? null, userId, isFemale);

  useEffect(() => {
    if (checkInDue && safePick?.status === 'active') {
      setCheckInOpen(true);
    }
  }, [checkInDue, safePick?.status]);

  if (isExpired) {
    router.replace('/chat/expired');
    return null;
  }

  const partnerPhoto = isFemale
    ? match?.male_profile?.photos[0]
    : match?.female_profile?.photos[match?.female_profile?.primary_photo_idx ?? 0] ??
      'https://i.pravatar.cc/200?img=5';
  const partnerName = isFemale
    ? match?.male_profile?.display_name ?? match?.male_profile?.job ?? 'Pick'
    : match?.female_profile?.display_name ?? match?.female_display_name ?? 'Anna';

  const openPartnerProfile = () => {
    if (matchId) router.push(`/partner/${matchId}`);
  };

  const timerColor =
    remainingHours < 1 ? '#D11537' : remainingHours < 6 ? '#f0c040' : '#D11537';

  const onSend = async () => {
    if (!text.trim() || text.length > MAX_MESSAGE_LENGTH) return;
    await send(text.trim());
    setText('');
  };

  const onCancel = async () => {
    if (!matchId) return;
    await cancelMatch(matchId);
    setCancelOpen(false);
    router.replace('/(tabs)/pick');
  };

  const onReport = async (reason: string) => {
    const reportedId = isFemale ? match?.male_id : match?.female_id;
    if (reportedId) await submitReport(userId, reportedId, reason);
    setReportOpen(false);
    setMenuOpen(false);
  };

  return (
    <Screen edges={['top', 'bottom']} className="flex-1">
      <View className="flex-row items-center justify-between px-4 pt-0.5 pb-1.5">
        <View className="w-[92px]">
          <BackButton onPress={() => router.back()} />
        </View>
        <View className="flex-1 items-center px-2">
          <Pressable onPress={openPartnerProfile} className="items-center">
            <TimerRing
              photoUri={partnerPhoto ?? 'https://i.pravatar.cc/200?img=32'}
              progress={progress}
              color={timerColor}
            />
            <DisplayText className="text-lg mt-1.5 tracking-tight">{partnerName}</DisplayText>
            <Text className="text-accent text-[11px] font-semibold mt-0.5">
              Profil anschauen
            </Text>
          </Pressable>
          <MetaText className="text-accent text-[10px] mt-0.5 normal-case">
            {remainingHours}h {remainingMinutes}m verbleibend
          </MetaText>
        </View>
        <View className="min-w-[118px] flex-row items-center justify-end gap-2">
          {isFemale ? (
            <Pressable
              onPress={() => {
                if (safePickActive) return;
                if (checkInDue && safePick) {
                  setCheckInOpen(true);
                  return;
                }
                setSafePickSetupOpen(true);
              }}
              hitSlop={8}
              accessibilityLabel="Safe Pick"
              className={`w-9 h-9 rounded-full border items-center justify-center ${
                safePickActive || safePickDone
                  ? 'bg-accent/20 border-accent'
                  : 'bg-white/5 border-line'
              }`}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={safePickActive || safePickDone ? '#D11537' : 'rgba(255,255,255,0.75)'}
              />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => setCancelOpen(true)}
            hitSlop={8}
            accessibilityLabel="Unpick"
            className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-pill bg-accent"
          >
            <FlingIcon name="close" size={14} color="#fff" />
            <Text className="text-white text-[10px] font-bold font-body tracking-wide">
              Unpick
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={8}
            accessibilityLabel="Menü"
            className="w-9 h-9 rounded-full bg-white/5 border border-line items-center justify-center"
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.75)" />
          </Pressable>
        </View>
      </View>

      {isFemale && safePickActive && safePick ? (
        <Pressable
          onPress={() => checkInDue && setCheckInOpen(true)}
          className="mx-4 mb-1.5 px-3.5 py-2 rounded-xl bg-accent/10 border border-accent/25 flex-row items-center gap-2"
        >
          <Ionicons name="shield-checkmark" size={16} color="#D11537" />
          <Text className="text-accent text-[12px] font-semibold flex-1">
            Safe Pick aktiv · {formatSafePickMeetTime(safePick.meet_at)}
            {checkInDue ? ' · Tippe für Nachfrage' : ''}
          </Text>
        </Pressable>
      ) : null}

      {isFemale && safePickDone ? (
        <View className="mx-4 mb-2 px-4 py-2 rounded-xl bg-white/5 border border-line">
          <Text className="text-fg-3 text-[12px] text-center">
            Safe Pick beendet — danke für dein Feedback
          </Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerClassName="flex-grow justify-end">
          <ChatMessages blurred={blurred} visible={visible} />
        </ScrollView>

        <View className="border-t border-line px-4 pt-2 pb-3">
          <Text className="font-mono text-fg-4 text-[10px] uppercase tracking-widest text-right mb-2">
            {text.length} / {MAX_MESSAGE_LENGTH}
          </Text>
          <View className="flex-row items-end gap-2.5">
            <TextInput
              value={text}
              onChangeText={(t) => setText(t.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder={
                isFemale ? 'Schreib eine Nachricht…' : `Antworte ${partnerName}…`
              }
              placeholderTextColor="rgba(255,255,255,0.42)"
              className="flex-1 bg-white/5 border border-line-2 rounded-pill px-5 py-3.5 text-white text-[15px] leading-[22px] font-body min-h-[48px]"
              style={{ fontFamily: 'Inter_500Medium' }}
              multiline
            />
            <Pressable
              onPress={onSend}
              disabled={!text.trim() || text.length > MAX_MESSAGE_LENGTH}
              className={`w-[48px] h-[48px] rounded-full bg-accent items-center justify-center mb-0.5 ${
                text.length >= MAX_MESSAGE_LENGTH ? 'opacity-40' : ''
              }`}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={cancelOpen}
        title="Unpick?"
        message={
          isFemale
            ? 'Du beendest den Pick — du entscheidest. Du siehst diesen Mann 24 Stunden nicht.'
            : 'Du bist wieder in der Auswahl sichtbar. Sie sieht dich 24 Stunden nicht.'
        }
        confirmLabel="Unpick"
        cancelLabel="Weiter chatten"
        onConfirm={onCancel}
        onCancel={() => setCancelOpen(false)}
      />

      <Modal visible={menuOpen} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/55" onPress={() => setMenuOpen(false)} />
        <View className="bg-card border-t border-line-2 rounded-t-3xl p-5 gap-2">
          {isFemale && !safePickActive && !safePickDone ? (
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                setSafePickSetupOpen(true);
              }}
              className="py-4 border-b border-line"
            >
              <BodyText className="text-white text-center font-semibold">Safe Pick</BodyText>
            </Pressable>
          ) : null}
          <Pressable onPress={() => { setMenuOpen(false); setReportOpen(true); }} className="py-4 border-b border-line">
            <BodyText className="text-white text-center font-semibold">Melden</BodyText>
          </Pressable>
          <Pressable onPress={() => setMenuOpen(false)} className="py-4">
            <BodyText className="text-fg-3 text-center">Abbrechen</BodyText>
          </Pressable>
        </View>
      </Modal>

      <Modal visible={reportOpen} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/55" onPress={() => setReportOpen(false)} />
        <View className="bg-card border-t border-line-2 rounded-t-3xl p-5 max-h-[50%]">
          <DisplayText className="text-lg mb-4 text-center">Melden</DisplayText>
          {REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason}
              onPress={() => onReport(reason)}
              className="py-3 border-b border-line"
            >
              <BodyText className="text-white text-center">{reason}</BodyText>
            </Pressable>
          ))}
        </View>
      </Modal>

      {matchId && isFemale ? (
        <>
          <SafePickSetupModal
            visible={safePickSetupOpen}
            matchId={matchId}
            userId={userId}
            defaultArea={profile?.city ?? 'München'}
            onClose={() => setSafePickSetupOpen(false)}
            onCreated={() => {
              setSafePickSetupOpen(false);
              refreshSafePick();
            }}
          />
          {safePick && checkInOpen ? (
            <SafePickCheckinModal
              visible={checkInOpen}
              session={safePick}
              onClose={() => setCheckInOpen(false)}
              onSubmitted={() => {
                setCheckInOpen(false);
                refreshSafePick();
              }}
            />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
