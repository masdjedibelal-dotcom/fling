import { useState, useEffect, useRef } from 'react';
import {
  Keyboard,
  Platform,
  ScrollView,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { ConfirmModal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessages } from '@/components/chat/ChatMessages';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { useAuthStore } from '@/stores/authStore';
import { useMatch } from '@/hooks/useMatch';
import { useChat } from '@/hooks/useChat';
import { blockUser, cancelMatch, submitReport } from '@/lib/api';
import { MAX_MESSAGE_LENGTH } from '@/lib/constants';
import {
  chatPartnerName,
  formatChatPartnerMeta,
  profilePseudonym,
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
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<ScrollViewType>(null);
  const lastMsgId = visible[visible.length - 1]?.id;

  useEffect(() => {
    if (!lastMsgId) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, [lastMsgId]);

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
    ? chatPartnerName(
        partnerProfile?.display_name,
        profilePseudonym(partnerProfile?.pseudonym, 'Pick'),
      )
    : chatPartnerName(
        match?.female_display_name ?? partnerProfile?.display_name,
        profilePseudonym(partnerProfile?.pseudonym, 'Anna'),
      );

  const metaLine = partnerProfile
    ? formatChatPartnerMeta(
        partnerProfile,
        isFemale ? undefined : { city: match?.female_city },
      )
    : '—';

  const reportedId = isFemale ? match?.male_id : match?.female_id;

  const dismissKeyboard = () => Keyboard.dismiss();

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

  const onReport = async () => {
    if (!reportedId) {
      setToast('Melden ist gerade nicht möglich.');
      return;
    }
    const { error } = await submitReport(userId, reportedId, 'Belästigung');
    setToast(
      error ? `Melden fehlgeschlagen: ${error}` : 'Gemeldet. Danke für deine Meldung.',
    );
  };

  const onBlock = async () => {
    if (!reportedId) {
      setToast('Blockieren ist gerade nicht möglich.');
      return;
    }
    const { error } = await blockUser(userId, reportedId);
    if (error) {
      setToast(`Blockieren fehlgeschlagen: ${error}`);
      return;
    }
    if (matchId) await cancelMatch(matchId);
    setToast('Nutzer blockiert.');
    setTimeout(() => router.replace('/(tabs)/pick'), 1200);
  };

  const composer = (
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
  );

  return (
    <Screen edges={['top']} className="flex-1">
      <Toast message={toast} onHidden={() => setToast(null)} />

      <ChatHeader
        partnerPhoto={partnerPhoto}
        partnerName={partnerName}
        metaLine={metaLine}
        progress={progress}
        timerColor={
          remainingHours < 1
            ? FLING_COLORS.accent
            : remainingHours < 6
              ? FLING_COLORS.gold
              : FLING_COLORS.accent
        }
        remainingHours={remainingHours}
        remainingMinutes={remainingMinutes}
        isFemale={isFemale}
        onBack={() => {
          if (router.canGoBack()) router.back();
          else router.replace('/(tabs)/pick');
        }}
        onOpenProfile={() => matchId && router.push(`/partner/${matchId}`)}
        onEndPick={() => setCancelOpen(true)}
        onReport={() => void onReport()}
        onBlock={() => void onBlock()}
      />

      <View className="flex-1">
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="flex-grow justify-end"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={Platform.OS === 'web' ? 'always' : 'handled'}
          keyboardDismissMode={Platform.OS === 'web' ? 'none' : 'on-drag'}
          onScrollBeginDrag={Platform.OS === 'web' ? undefined : dismissKeyboard}
        >
            <ChatMessages
              blurred={blurred}
              visible={visible}
              partnerPhotoUri={partnerPhoto}
              userPhotoUri={userPhoto}
              viewerId={userId}
              onMarkViewed={async (id) => {
                await markViewed(id);
              }}
            />
        </ScrollView>
        {composer}
      </View>

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
    </Screen>
  );
}
