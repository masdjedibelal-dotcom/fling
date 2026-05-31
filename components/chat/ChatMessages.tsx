import { useEffect, useRef, useState } from 'react';
import { View, Text, Platform, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
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
    <View
      className="rounded-full overflow-hidden bg-card border border-line"
      style={{ width: AVATAR, height: AVATAR, marginBottom: 2 }}
    >
      <Image
        source={{ uri }}
        style={{ width: AVATAR, height: AVATAR }}
        contentFit="cover"
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

function ViewOnceBubble({
  msg,
  isPartner,
  hiddenHistory,
  onOpen,
}: {
  msg: Message;
  isPartner: boolean;
  hiddenHistory?: boolean;
  onOpen: () => void;
}) {
  const opened = Boolean(msg.viewed_at);
  /** Empfangenes Einmal-Foto: nach dem Öffnen nicht erneut. Eigene Sendung: jederzeit. */
  const consumed = msg.view_once && isPartner && opened;
  const canOpen = !hiddenHistory && Boolean(msg.media_url) && !consumed;

  return (
    <Pressable
      onPress={canOpen ? onOpen : undefined}
      disabled={!canOpen}
      className={`px-3.5 py-2.5 ${
        isPartner ? 'bg-accent' : 'bg-card border border-line'
      }`}
      style={{
        borderRadius: FLING_RADIUS.bubble,
        borderBottomLeftRadius: isPartner ? FLING_RADIUS.bubbleTail : FLING_RADIUS.bubble,
        borderBottomRightRadius: isPartner ? FLING_RADIUS.bubble : FLING_RADIUS.bubbleTail,
        opacity: consumed ? 0.5 : 1,
        backgroundColor: consumed
          ? isPartner
            ? 'rgba(196, 30, 58, 0.45)'
            : 'rgba(255,255,255,0.06)'
          : undefined,
      }}
    >
      <HiddenHistoryShell hidden={hiddenHistory}>
        <View className="flex-row items-center gap-2.5">
          <View
            className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <FlingIcon name="camera" size={18} color="#fff" />
          </View>
          <View>
            <Text
              className="text-white font-semibold"
              style={{ fontSize: FLING_TYPE.subhead }}
            >
              Foto
            </Text>
            <Text
              className="text-white/60 mt-0.5"
              style={{ fontSize: FLING_TYPE.caption2 }}
            >
              {hiddenHistory
                ? 'Verlauf unsichtbar'
                : consumed
                  ? 'Geöffnet'
                  : isPartner
                    ? 'Tippen zum Öffnen'
                    : 'Tippen zum Ansehen'}
            </Text>
          </View>
        </View>
      </HiddenHistoryShell>
    </Pressable>
  );
}

function isPartnerMessage(msg: Message, viewerId: string): boolean {
  if (msg.sender_id) return msg.sender_id !== viewerId;
  return false;
}

function Bubble({
  msg,
  hiddenHistory,
  partnerPhotoUri,
  userPhotoUri,
  viewerId,
  onOpenPhoto,
}: {
  msg: Message;
  hiddenHistory?: boolean;
  partnerPhotoUri: string;
  userPhotoUri: string;
  viewerId: string;
  onOpenPhoto: (msg: Message, isPartner: boolean) => void;
}) {
  const isPartner = isPartnerMessage(msg, viewerId);
  const type = msg.message_type ?? 'text';

  let content: React.ReactNode;

  if (type === 'image' && msg.view_once) {
    content = (
      <ViewOnceBubble
        msg={msg}
        isPartner={isPartner}
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
  onMarkViewed,
}: {
  blurred: Message[];
  visible: Message[];
  partnerPhotoUri: string;
  userPhotoUri: string;
  viewerId: string;
  onMarkViewed: (messageId: string) => Promise<void>;
}) {
  const [photoPreview, setPhotoPreview] = useState<{
    id: string;
    uri: string;
  } | null>(null);

  const openPhoto = (msg: Message, isPartner: boolean) => {
    if (!msg.media_url) return;
    if (msg.view_once && isPartner && msg.viewed_at) return;

    if (msg.view_once && isPartner && !msg.viewed_at) {
      void onMarkViewed(msg.id);
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
