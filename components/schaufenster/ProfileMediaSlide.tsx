import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image, type ImageContentFit } from 'expo-image';
import { Audio, Video, ResizeMode, type AVPlaybackStatus } from 'expo-av';
import { getProfileMediaUri, isProfileVideo } from '@/lib/profileMedia';
import { FLING_TYPE } from '@/lib/designTokens';

type Props = {
  uri: string;
  /** Video startet nur wenn sichtbar (aktuelle Story-Seite). */
  isActive?: boolean;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
  contentPosition?: 'top' | 'center' | 'bottom';
};

function WebProfileVideo({
  uri,
  isActive,
  style,
  onError,
}: {
  uri: string;
  isActive: boolean;
  style?: StyleProp<ViewStyle>;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.loop = true;
    el.muted = true;
    el.playsInline = true;
    if (isActive) {
      const play = el.play();
      if (play) void play.catch(() => onError());
    } else {
      el.pause();
    }
  }, [isActive, uri, onError]);

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <video
        ref={videoRef}
        key={uri}
        src={uri}
        autoPlay={isActive}
        loop
        muted
        playsInline
        onError={onError}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </View>
  );
}

export function ProfileMediaSlide({
  uri,
  isActive = true,
  style,
  contentFit = 'cover',
  contentPosition = 'top',
}: Props) {
  const videoRef = useRef<Video>(null);
  const isVideo = isProfileVideo(uri);
  const mediaUri = getProfileMediaUri(uri);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    setVideoFailed(false);
  }, [mediaUri]);

  const markFailed = useCallback(() => setVideoFailed(true), []);

  const playNativeVideo = useCallback(async () => {
    if (!isActive) return;
    const player = videoRef.current;
    if (!player) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
      });
      await player.setIsLoopingAsync(true);
      await player.setIsMutedAsync(true);
      const status = await player.getStatusAsync();
      if (status.isLoaded) {
        await player.playAsync();
      }
    } catch {
      markFailed();
    }
  }, [isActive, markFailed]);

  useEffect(() => {
    if (!isVideo || Platform.OS === 'web') return;
    const player = videoRef.current;
    if (!player) return;
    if (isActive) {
      void playNativeVideo();
    } else {
      void player.pauseAsync();
    }
  }, [isActive, isVideo, mediaUri, playNativeVideo]);

  const onPlaybackStatus = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if ('error' in status && status.error) markFailed();
        return;
      }
      if (isActive && !status.isPlaying) {
        void playNativeVideo();
      }
    },
    [isActive, markFailed, playNativeVideo],
  );

  if (isVideo) {
    if (videoFailed) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            style,
            styles.videoFallback,
          ]}
        >
          <Text style={styles.videoFallbackIcon}>▶</Text>
          <Text style={styles.videoFallbackText}>
            Video nicht verfügbar
          </Text>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <WebProfileVideo
          uri={mediaUri}
          isActive={isActive}
          style={style}
          onError={markFailed}
        />
      );
    }

    return (
      <View style={[StyleSheet.absoluteFill, style]}>
        <Video
          key={mediaUri}
          ref={videoRef}
          source={{ uri: mediaUri }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted
          shouldPlay={isActive}
          progressUpdateIntervalMillis={400}
          onPlaybackStatusUpdate={onPlaybackStatus}
          onError={markFailed}
          onLoad={() => {
            if (isActive) void playNativeVideo();
          }}
          onReadyForDisplay={() => {
            if (isActive) void playNativeVideo();
          }}
        />
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <Image
        source={{ uri: mediaUri }}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        contentPosition={contentPosition}
        transition={180}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  videoFallback: {
    backgroundColor: '#1a1012',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  videoFallbackIcon: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 32,
  },
  videoFallbackText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: FLING_TYPE.caption,
    fontFamily: 'Inter_500Medium',
  },
});
