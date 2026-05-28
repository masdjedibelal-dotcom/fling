import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { ReactNode } from 'react';

function StoryProgressDots({
  count,
  activeIndex,
  onSelect,
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  if (count <= 1) return null;

  return (
    <View className="flex-row gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Pressable key={i} onPress={() => onSelect(i)} className="flex-1" hitSlop={6}>
          <View
            style={{
              height: 3,
              borderRadius: 2,
              backgroundColor:
                i === activeIndex ? '#ffffff' : 'rgba(255,255,255,0.28)',
            }}
          />
        </Pressable>
      ))}
    </View>
  );
}

export function ProfilePhotoViewer({
  photos,
  photoIdx,
  onIndexChange,
  height,
  topInset,
  header,
  footer,
}: {
  photos: string[];
  photoIdx: number;
  onIndexChange: (index: number) => void;
  height: number;
  topInset: number;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const photo = photos[photoIdx] ?? photos[0];
  const count = photos.length;
  const hasStories = count > 1;
  const headerTop = topInset + (hasStories ? 20 : 8);

  const goPrev = () => onIndexChange(Math.max(0, photoIdx - 1));
  const goNext = () => onIndexChange(Math.min(count - 1, photoIdx + 1));

  const pan = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .onEnd((e) => {
      if (e.translationX < -36) goNext();
      else if (e.translationX > 36) goPrev();
    });

  return (
    <View style={{ height }} className="relative bg-black overflow-hidden">
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          <Image source={{ uri: photo }} className="w-full h-full" contentFit="cover" />
        </View>
      </GestureDetector>

      {hasStories ? (
        <View
          className="absolute left-0 right-0 z-20 px-4"
          style={{ top: topInset + 6 }}
          pointerEvents="box-none"
        >
          <StoryProgressDots
            count={count}
            activeIndex={photoIdx}
            onSelect={onIndexChange}
          />
        </View>
      ) : null}

      {header ? (
        <View
          className="absolute left-0 right-0 z-20 px-4"
          style={{ top: headerTop }}
          pointerEvents="box-none"
        >
          {header}
        </View>
      ) : null}

      <Pressable
        onPress={goPrev}
        disabled={photoIdx === 0}
        className="absolute left-0 top-0 bottom-0 z-10"
        style={{ width: width * 0.28, opacity: photoIdx === 0 ? 0.3 : 1 }}
        accessibilityLabel="Vorheriges Foto"
      />
      <Pressable
        onPress={goNext}
        disabled={photoIdx >= count - 1}
        className="absolute right-0 top-0 bottom-0 z-10"
        style={{ width: width * 0.28, opacity: photoIdx >= count - 1 ? 0.3 : 1 }}
        accessibilityLabel="Nächstes Foto"
      />

      {footer}
    </View>
  );
}
