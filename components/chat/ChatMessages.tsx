import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Platform, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { AvatarImage } from '@/components/ui/AvatarImage';
import { Audio } from 'expo-av';
import type { Message } from '@/lib/types';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { ViewOncePhotoModal } from '@/components/chat/ViewOncePhotoModal';
import { FLING_RADIUS, FLING_TYPE } from '@/lib/designTokens';

const mediaBlurWeb = {
  filter: 'blur(8px)',
  opacity: 0.55,
  userSelect: 'none',
} as object;

const VIEW_ONCE_W = 200;
const VIEW_ONCE_H = 260;

/** Dauerhafter Blur über Medien (Einmal-Foto in der Liste — nie scharf). */
function PermanentBlurShell({ children }: { children: React.ReactNode }) {
  return (
    <View className="relative overflow-hidden">
      <View
        pointerEvents="none"
        style={Platform.OS === 'web' ? mediaBlurWeb : undefined}
      >
        {children}
      </View>
      {Platform.OS !== 'web' ? (
        <BlurView
          pointerEvents="none"
          intensity={72}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
    </View>
  );
}

function HiddenHistoryShell({
  hidden,
  children,
}: {
  hidden?: boolean;
  children: React.ReactNode;
}) {
  if (!hidden) return <>{children}</>;

  return (
    <View className="relative overflow-hidden">
      <View
        pointerEvents="none"
        style={Platform.OS === 'web' ? mediaBlurWeb : undefined}
      >
        {children}
      </View>
      {Platform.OS !== 'web' ? (
        <BlurView
          pointerEvents="none"
          intensity={56}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View pointerEvents="auto" style={StyleSheet.absoluteFillObject} />
      )}
    </View>
  );
}

const AVATAR = 26;

function MessageAvatar({ uri }: { uri: string }) {
  return (
    <View style={{ marginBottom: 2 }}>
      <AvatarImage
        uri={uri}
        size={AVATAR}
        recyclingKey={`msg-avatar-${uri}`}
        style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.12)' }}
      />
    </View>
  );
}

function VoiceNotePlayer({
  uri,
  durationMs,
  isPartner,
  disabled = false,
}: {
  uri: string;
  durationMs: number;
  isPartner: boolean;
  disabled?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const toggle = async () => {
    if (disabled) return;
    if (playing && soundRef.current) {
      await soundRef.current.stopAsync();
      setPlaying(false);
      return;
    }
    const { sound } = await Audio.Sound.createAsync({ uri });
    soundRef.current = sound;
    setPlaying(true);
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded && s.didJustFinish) {
        setPlaying(false);
      }
    });
    await sound.playAsync();
  };

  const secs = Math.max(1, Math.round(durationMs / 1000));

  return (
    <Pressable
      onPress={() => void toggle()}
      disabled={disabled}
      className="flex-row items-center gap-2.5 min-w-[120px]"
    >
      <View
        className={`w-9 h-9 rounded-full items-center justify-center ${
          isPartner ? 'bg-white/15' : 'bg-accent/30'
        }`}
      >
        <Text
          className="text-white font-bold"
          style={{ fontSize: FLING_TYPE.subhead }}
        >
          {playing ? '❚❚' : '▶'}
        </Text>
      </View>
      <View className="flex-1 h-1 rounded-full bg-white/15 overflow-hidden">
        <View
          className="h-full rounded-full bg-white/50"
          style={{ width: playing ? '70%' : '30%' }}
        />
      </View>
      <Text
        className="text-white/75 font-semibold"
        style={{ fontSize: FLING_TYPE.caption }}
      >
        {secs}s
      </Text>
    </Pressable>
  );
}

function isViewOnceImage(msg: Message): boolean {
  if (msg.message_type !== 'image' || !msg.media_url) return false;
  return msg.view_once !== false;
}

function isPartnerMessage(
  msg: Message,
  viewerId: string,
  viewerIsFemale: boolean,
): boolean {
  if (msg.sender_id) return msg.sender_id !== viewerId;
  return msg.is_female !== viewerIsFemale;
}

function ViewOnceBubble({
  msg,
  isPartner,
  opened,
  hiddenHistory,
  onOpen,
}: {
  msg: Message;
  isPartner: boolean;
  opened: boolean;
  hiddenHistory?: boolean;
  onOpen: () => void;
}) {
  /** Einmal-Foto: in der Liste immer verschwommen; Vollbild nur einmal. */
  const consumed = opened;
  const canOpen = !hiddenHistory && !consumed;
  const uri = msg.media_url ?? '';

  return (
    <Pressable
      onPress={canOpen ? onOpen : undefined}
      disabled={!canOpen}
      accessibilityRole="button"
      accessibilityLabel={
        consumed ? 'Einmal-Foto bereits geöffnet' : 'Einmal-Foto öffnen'
      }
      className="overflow-hidden max-w-[200px]"
      style={{
        borderRadius: FLING_RADIUS.bubble,
        borderBottomLeftRadius: isPartner ? FLING_RADIUS.bubbleTail : FLING_RADIUS.bubble,
        borderBottomRightRadius: isPartner ? FLING_RADIUS.bubble : FLING_RADIUS.bubbleTail,
        opacity: consumed ? 0.92 : 1,
      }}
    >
      <View style={{ width: VIEW_ONCE_W, height: VIEW_ONCE_H }}>
        <PermanentBlurShell>
          <Image
            source={{ uri }}
            style={{ width: VIEW_ONCE_W, height: VIEW_ONCE_H }}
            contentFit="cover"
          />
        </PermanentBlurShell>

        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, styles.viewOnceOverlay]}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
          >
            {consumed ? (
              <FlingIcon name="check" size={18} color="rgba(255,255,255,0.75)" />
            ) : (
              <FlingIcon name="camera" size={20} color="#fff" />
            )}
          </View>
          <Text
            className="font-semibold text-white text-center"
            style={{ fontSize: FLING_TYPE.subhead }}
          >
            {consumed ? 'Geöffnet' : 'Einmal-Foto'}
          </Text>
          <Text
            className="text-center mt-1 px-3"
            style={{
              fontSize: FLING_TYPE.caption2,
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            {hiddenHistory
              ? 'Verlauf unsichtbar'
              : consumed
                ? 'Nicht mehr verfügbar'
                : isPartner
                  ? 'Tippen zum Öffnen'
                  : 'Tippen zum Ansehen'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function Bubble({
  msg,
  hiddenHistory,
  partnerPhotoUri,
  userPhotoUri,
  viewerId,
  viewerIsFemale,
  isMessageOpened,
  onOpenPhoto,
}: {
  msg: Message;
  hiddenHistory?: boolean;
  partnerPhotoUri: string;
  userPhotoUri: string;
  viewerId: string;
  viewerIsFemale: boolean;
  isMessageOpened: (msg: Message) => boolean;
  onOpenPhoto: (msg: Message, isPartner: boolean) => void;
}) {
  const isPartner = isPartnerMessage(msg, viewerId, viewerIsFemale);
  const type = msg.message_type ?? 'text';
  const opened = isMessageOpened(msg);

  let content: React.ReactNode;

  if (isViewOnceImage(msg)) {
    content = (
      <ViewOnceBubble
        msg={msg}
        isPartner={isPartner}
        opened={opened}
        hiddenHistory={hiddenHistory}
        onOpen={() => onOpenPhoto(msg, isPartner)}
      />
    );
  } else if (type === 'image' && msg.media_url) {
    const image = (
      <View className="overflow-hidden rounded-[16px] max-w-[200px]">
        <Image
          source={{ uri: msg.media_url }}
          style={{ width: 200, height: 260 }}
          contentFit="cover"
        />
        {msg.body ? (
          <Text
            className="text-white mt-2 px-1"
            style={{ fontSize: FLING_TYPE.subhead }}
          >
            {msg.body}
          </Text>
        ) : null}
      </View>
    );

    content = hiddenHistory ? (
      <HiddenHistoryShell hidden>{image}</HiddenHistoryShell>
    ) : (
      <Pressable
        onPress={() => onOpenPhoto(msg, isPartner)}
        accessibilityLabel="Foto öffnen"
      >
        {image}
      </Pressable>
    );
  } else if (type === 'voice' && msg.media_url) {
    content = (
      <View
        className={`px-3 py-2.5 ${isPartner ? 'bg-accent' : 'bg-card border border-line'}`}
        style={{
          borderRadius: FLING_RADIUS.bubble,
          borderBottomLeftRadius: isPartner ? FLING_RADIUS.bubbleTail : FLING_RADIUS.bubble,
          borderBottomRightRadius: isPartner ? FLING_RADIUS.bubble : FLING_RADIUS.bubbleTail,
        }}
      >
        <HiddenHistoryShell hidden={hiddenHistory}>
          <VoiceNotePlayer
            uri={msg.media_url}
            durationMs={msg.media_duration_ms ?? 0}
            isPartner={isPartner}
            disabled={hiddenHistory}
          />
        </HiddenHistoryShell>
      </View>
    );
  } else {
    content = (
      <View
        className={`px-3.5 py-2.5 max-w-full ${isPartner ? 'bg-accent' : 'bg-card border border-line'}`}
        style={{
          borderRadius: FLING_RADIUS.bubble,
          borderBottomLeftRadius: isPartner ? FLING_RADIUS.bubbleTail : FLING_RADIUS.bubble,
          borderBottomRightRadius: isPartner ? FLING_RADIUS.bubble : FLING_RADIUS.bubbleTail,
        }}
      >
        <HiddenHistoryShell hidden={hiddenHistory}>
          <Text
            className="font-body text-white font-medium"
            style={{ fontSize: FLING_TYPE.subhead, lineHeight: 20 }}
          >
            {msg.body}
          </Text>
        </HiddenHistoryShell>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(200).springify().damping(18)}
      className={`flex-row items-end gap-1.5 max-w-[78%] ${
        isPartner ? '' : 'self-end flex-row-reverse'
      }`}
    >
      <MessageAvatar uri={isPartner ? partnerPhotoUri : userPhotoUri} />
      {content}
    </Animated.View>
  );
}

export function ChatMessages({
  blurred,
  visible,
  partnerPhotoUri,
  userPhotoUri,
  viewerId,
  viewerIsFemale,
  onMarkViewed,
}: {
  blurred: Message[];
  visible: Message[];
  partnerPhotoUri: string;
  userPhotoUri: string;
  viewerId: string;
  viewerIsFemale: boolean;
  onMarkViewed: (messageId: string) => Promise<void>;
}) {
  const [photoPreview, setPhotoPreview] = useState<{
    id: string;
    uri: string;
  } | null>(null);
  const [openedLocally, setOpenedLocally] = useState<Set<string>>(() => new Set());

  const isMessageOpened = useCallback(
    (msg: Message) => Boolean(msg.viewed_at) || openedLocally.has(msg.id),
    [openedLocally],
  );

  const markViewOnceOpened = useCallback(
    (msg: Message, isPartner: boolean) => {
      if (!isViewOnceImage(msg) || isMessageOpened(msg)) return;
      setOpenedLocally((prev) => {
        const next = new Set(prev);
        next.add(msg.id);
        return next;
      });
      // Server: nur Empfänger markiert viewed_at (sonst wäre es für den Partner schon „verbraucht“)
      if (isPartner) {
        void onMarkViewed(msg.id);
      }
    },
    [isMessageOpened, onMarkViewed],
  );

  const openPhoto = (msg: Message, isPartner: boolean) => {
    if (!msg.media_url) return;

    if (isViewOnceImage(msg) && isMessageOpened(msg)) {
      return;
    }

    if (isViewOnceImage(msg)) {
      markViewOnceOpened(msg, isPartner);
    }

    setPhotoPreview({
      id: msg.id,
      uri: msg.media_url,
    });
  };

  const closePhoto = () => {
    setPhotoPreview(null);
  };

  return (
    <>
      <View className="gap-3 px-4 pb-3 pt-2">
        {blurred.map((m) => (
          <Bubble
            key={m.id}
            msg={m}
            hiddenHistory
            partnerPhotoUri={partnerPhotoUri}
            userPhotoUri={userPhotoUri}
            viewerId={viewerId}
            viewerIsFemale={viewerIsFemale}
            isMessageOpened={isMessageOpened}
            onOpenPhoto={openPhoto}
          />
        ))}

        {blurred.length > 0 && visible.length > 0 ? (
          <View className="flex-row items-center gap-3 my-3">
            <View className="flex-1 h-px bg-line" />
            <Text
              className="text-fg-4 uppercase tracking-[0.18em] font-semibold"
              style={{ fontSize: FLING_TYPE.caption2 }}
            >
              Verlauf unsichtbar
            </Text>
            <View className="flex-1 h-px bg-line" />
          </View>
        ) : null}

        {visible.map((m) => (
          <Bubble
            key={m.id}
            msg={m}
            partnerPhotoUri={partnerPhotoUri}
            userPhotoUri={userPhotoUri}
            viewerId={viewerId}
            viewerIsFemale={viewerIsFemale}
            isMessageOpened={isMessageOpened}
            onOpenPhoto={openPhoto}
          />
        ))}
      </View>

      <ViewOncePhotoModal
        visible={Boolean(photoPreview)}
        uri={photoPreview?.uri ?? ''}
        onClose={closePhoto}
      />
    </>
  );
}

const styles = StyleSheet.create({
  viewOnceOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
});
