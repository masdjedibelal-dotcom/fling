import { useState } from 'react';
import {
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BodyText, TitleText } from '@/components/ui/Typography';
import { ConfirmModal } from '@/components/ui/Modal';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { useAuthStore } from '@/stores/authStore';
import { useMatch } from '@/hooks/useMatch';
import { useChat } from '@/hooks/useChat';
import { cancelMatch, submitReport } from '@/lib/api';
import { MAX_MESSAGE_LENGTH, REPORT_REASONS } from '@/lib/constants';
import {
  chatPartnerName,
  formatChatPartnerMeta,
} from '@/lib/profileDisplay';
import { useDiscreetScreen } from '@/hooks/useDiscreetScreen';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { FLING_COLORS } from '@/lib/designTokens';

export default function ChatScreen() {
  useDiscreetScreen();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const userId = useAuthStore((s) => s.userId) ?? 'demo';
  const gender = useAuthStore((s) => s.gender);
  const isFemale = gender === 'female';
  const profile = useAuthStore((s) => s.profile);

  const { match, remainingHours, remainingMinutes, progress, isExpired } =
    useMatch(userId);
  const { visible, blurred, send, sendMedia, markViewed } = useChat(
    matchId ?? null,
    userId,
    isFemale,
  );

  const [text, setText] = useState('');
  const {
    keyboardVisible,
    keyboardInsetBottom,
    onInputFocus,
    onInputBlur,
  } = useKeyboardVisible();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (isExpired) {
    router.replace('/chat/expired');
    return null;
  }

  const partnerProfile = isFemale ? match?.male_profile : match?.female_profile;
  const partnerPhoto =
    partnerProfile?.photos[partnerProfile.primary_photo_idx ?? 0] ??
    partnerProfile?.photos[0] ??
    'https://i.pravatar.cc/200?img=32';
  const userPhoto =
    profile?.photos[profile.primary_photo_idx ?? 0] ??
    profile?.photos[0] ??
    'https://i.pravatar.cc/200?img=5';

  const partnerName = isFemale
    ? chatPartnerName(partnerProfile?.display_name, 'Pick')
    : chatPartnerName(
        match?.female_display_name ?? partnerProfile?.display_name,
        'Anna',
      );

  const metaLine = partnerProfile
    ? formatChatPartnerMeta(
        partnerProfile,
        isFemale ? undefined : { city: match?.female_city },
      )
    : '—';

  const openPartnerProfile = () => {
    if (matchId) router.push(`/partner/${matchId}`);
  };

  const timerColor =
    remainingHours < 1
      ? FLING_COLORS.accent
      : remainingHours < 6
        ? FLING_COLORS.gold
        : FLING_COLORS.accent;

  const onSendText = async () => {
    if (!text.trim() || text.length > MAX_MESSAGE_LENGTH) return;
    await send(text.trim());
    setText('');
  };

  const onSendImage = async (uri: string) => {
    await sendMedia({
      message_type: 'image',
      media_url: uri,
      view_once: true,
      body: '',
    });
  };

  const onSendVoice = async (uri: string, durationMs: number) => {
    await sendMedia({
      message_type: 'voice',
      media_url: uri,
      media_duration_ms: durationMs,
      body: '',
    });
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
  };

  return (
    <Screen edges={['top']} className="flex-1">
      <ChatHeader
        partnerPhoto={partnerPhoto}
        partnerName={partnerName}
        metaLine={metaLine}
        progress={progress}
        timerColor={timerColor}
        remainingHours={remainingHours}
        remainingMinutes={remainingMinutes}
        isFemale={isFemale}
        onBack={() => router.back()}
        onOpenProfile={openPartnerProfile}
        onEndPick={() => setCancelOpen(true)}
        onReport={() => setReportOpen(true)}
      />

      {Platform.OS === 'web' ? (
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow justify-end"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            <ChatMessages
              blurred={blurred}
              visible={visible}
              partnerPhotoUri={partnerPhoto}
              userPhotoUri={userPhoto}
              viewerIsFemale={isFemale}
              onMarkViewed={async (id) => {
                await markViewed(id);
              }}
            />
          </ScrollView>
          <ChatComposer
            text={text}
            onChangeText={setText}
            onSendText={() => void onSendText()}
            onSendImage={onSendImage}
            onSendVoice={onSendVoice}
            keyboardVisible={keyboardVisible}
            keyboardInsetBottom={keyboardInsetBottom}
            onInputFocus={onInputFocus}
            onInputBlur={onInputBlur}
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior="padding"
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 2 : 0}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow justify-end"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <ChatMessages
              blurred={blurred}
              visible={visible}
              partnerPhotoUri={partnerPhoto}
              userPhotoUri={userPhoto}
              viewerIsFemale={isFemale}
              onMarkViewed={async (id) => {
                await markViewed(id);
              }}
            />
          </ScrollView>
          <ChatComposer
            text={text}
            onChangeText={setText}
            onSendText={() => void onSendText()}
            onSendImage={onSendImage}
            onSendVoice={onSendVoice}
            keyboardVisible={keyboardVisible}
            onInputFocus={onInputFocus}
            onInputBlur={onInputBlur}
          />
        </KeyboardAvoidingView>
      )}

      <ConfirmModal
        visible={cancelOpen}
        title="Pick beenden?"
        message={
          isFemale
            ? 'Du beendest den Pick. Du siehst diesen Mann 24 Stunden nicht in der Auswahl.'
            : 'Du bist wieder sichtbar. Sie sieht dich 24 Stunden nicht.'
        }
        confirmLabel="Beenden"
        cancelLabel="Weiter chatten"
        onConfirm={onCancel}
        onCancel={() => setCancelOpen(false)}
      />

      <Modal visible={reportOpen} transparent animationType="slide">
        <Pressable className="flex-1 bg-black/55" onPress={() => setReportOpen(false)} />
        <View className="bg-card border-t border-line-2 rounded-t-3xl p-5 max-h-[50%]">
          <TitleText className="mb-4 text-center">Melden</TitleText>
          {REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason}
              onPress={() => onReport(reason)}
              className="py-3.5 border-b border-line"
            >
              <BodyText className="text-white text-center">{reason}</BodyText>
            </Pressable>
          ))}
          <Pressable onPress={() => setReportOpen(false)} className="py-4 mt-1">
            <BodyText className="text-fg-3 text-center">Abbrechen</BodyText>
          </Pressable>
        </View>
      </Modal>
    </Screen>
  );
}
