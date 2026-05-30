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

const textBlurWeb = {
  filter: 'blur(6px)',
  opacity: 0.65,
  userSelect: 'none',
} as object;

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
}: {
  uri: string;
  durationMs: number;
  isPartner: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const toggle = async () => {
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
  onOpen,
}: {
  msg: Message;
  isPartner: boolean;
  onOpen: () => void;
}) {
  const opened = Boolean(msg.viewed_at);
  const canOpen = isPartner && !opened && Boolean(msg.media_url);

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
        opacity: opened ? 0.72 : 1,
      }}
    >
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
            {opened
              ? 'Geöffnet'
              : isPartner
                ? 'Tippen zum Öffnen'
                : 'Noch nicht geöffnet'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function Bubble({
  msg,
  blurText,
  partnerPhotoUri,
  userPhotoUri,
  viewerIsFemale,
  onViewOnce,
}: {
  msg: Message;
  blurText?: boolean;
  partnerPhotoUri: string;
  userPhotoUri: string;
  viewerIsFemale: boolean;
  onViewOnce: (msg: Message) => void;
}) {
  const isPartner = viewerIsFemale ? !msg.is_female : msg.is_female;
  const type = msg.message_type ?? 'text';

  let content: React.ReactNode;

  if (type === 'image' && msg.view_once) {
    content = (
      <ViewOnceBubble msg={msg} isPartner={isPartner} onOpen={() => onViewOnce(msg)} />
    );
  } else if (type === 'image' && msg.media_url) {
    content = (
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
        <VoiceNotePlayer
          uri={msg.media_url}
          durationMs={msg.media_duration_ms ?? 0}
          isPartner={isPartner}
        />
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
        <View className="relative overflow-hidden">
          <Text
            className="font-body text-white font-medium"
            style={[
              { fontSize: FLING_TYPE.subhead, lineHeight: 20 },
              blurText && Platform.OS === 'web' ? textBlurWeb : undefined,
            ]}
          >
            {msg.body}
          </Text>
          {blurText && Platform.OS !== 'web' ? (
            <BlurView
              pointerEvents="none"
              intensity={56}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
          ) : null}
        </View>
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
  viewerIsFemale,
  onMarkViewed,
}: {
  blurred: Message[];
  visible: Message[];
  partnerPhotoUri: string;
  userPhotoUri: string;
  viewerIsFemale: boolean;
  onMarkViewed: (messageId: string) => Promise<void>;
}) {
  const [viewOnce, setViewOnce] = useState<{ id: string; uri: string } | null>(null);

  const openViewOnce = (msg: Message) => {
    if (!msg.media_url || msg.viewed_at) return;
    setViewOnce({ id: msg.id, uri: msg.media_url });
  };

  const closeViewOnce = async () => {
    if (viewOnce) {
      await onMarkViewed(viewOnce.id);
      setViewOnce(null);
    }
  };

  return (
    <>
      <View className="gap-3 px-4 pb-3 pt-2">
        {blurred.map((m) => (
          <Bubble
            key={m.id}
            msg={m}
            blurText
            partnerPhotoUri={partnerPhotoUri}
            userPhotoUri={userPhotoUri}
            viewerIsFemale={viewerIsFemale}
            onViewOnce={openViewOnce}
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
            viewerIsFemale={viewerIsFemale}
            onViewOnce={openViewOnce}
          />
        ))}
      </View>

      <ViewOncePhotoModal
        visible={Boolean(viewOnce)}
        uri={viewOnce?.uri ?? ''}
        onClose={() => void closeViewOnce()}
      />
    </>
  );
}
