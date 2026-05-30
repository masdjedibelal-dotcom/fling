import { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Image, type ImageContentFit } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { getProfileMediaUri, isProfileVideo } from '@/lib/profileMedia';

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
}: {
  uri: string;
  isActive: boolean;
  style?: StyleProp<ViewStyle>;
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
      if (play) void play.catch(() => {});
    } else {
      el.pause();
    }
  }, [isActive, uri]);

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

  useEffect(() => {
    if (!isVideo || Platform.OS === 'web') return;
    const player = videoRef.current;
    if (!player) return;
    if (isActive) {
      void player.setIsLoopingAsync(true);
      void player.setIsMutedAsync(true);
      void player.playAsync();
    } else {
      void player.pauseAsync();
    }
  }, [isActive, isVideo, mediaUri]);

  if (isVideo) {
    if (Platform.OS === 'web') {
      return <WebProfileVideo uri={mediaUri} isActive={isActive} style={style} />;
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
          onReadyForDisplay={() => {
            if (!isActive) return;
            void videoRef.current?.setIsLoopingAsync(true);
            void videoRef.current?.setIsMutedAsync(true);
            void videoRef.current?.playAsync();
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
