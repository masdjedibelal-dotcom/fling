import { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { ProfileMediaSlide } from '@/components/schaufenster/ProfileMediaSlide';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { ReactNode } from 'react';
import { SafeTopChrome } from '@/components/ui/SafeTopChrome';

const STORY_SEGMENT_W = 28;
const STORY_SEGMENT_GAP = 4;
const STORY_BAR_H = 2.5;

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

  const barWidth =
    count * STORY_SEGMENT_W + Math.max(0, count - 1) * STORY_SEGMENT_GAP;

  return (
    <View className="items-center w-full" pointerEvents="box-none">
      <View className="flex-row" style={{ width: barWidth, gap: STORY_SEGMENT_GAP }}>
        {Array.from({ length: count }).map((_, i) => (
          <Pressable
            key={i}
            onPress={() => onSelect(i)}
            hitSlop={8}
            style={{ width: STORY_SEGMENT_W }}
          >
            <View
              style={{
                height: STORY_BAR_H,
                borderRadius: 2,
                backgroundColor:
                  i === activeIndex ? '#ffffff' : 'rgba(255,255,255,0.32)',
              }}
            />
          </Pressable>
        ))}
      </View>
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
  overlay,
}: {
  photos: string[];
  photoIdx: number;
  onIndexChange: (index: number) => void;
  /** Gesamthöhe inkl. Bereich unter der Statusleiste */
  height: number;
  topInset: number;
  header?: ReactNode;
  overlay?: ReactNode;
}) {
  const { width } = useAppDimensions();
  const photo = photos[photoIdx] ?? photos[0];
  const count = photos.length;
  const hasStories = count > 1;
  const extendTop = topInset > 0 ? topInset : 0;

  const goPrev = useCallback(
    () => onIndexChange(Math.max(0, photoIdx - 1)),
    [photoIdx, onIndexChange],
  );
  const goNext = useCallback(
    () => onIndexChange(Math.min(count - 1, photoIdx + 1)),
    [photoIdx, count, onIndexChange],
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .failOffsetY([-28, 28])
    .onEnd((e) => {
      if (e.translationX < -36) runOnJS(goNext)();
      else if (e.translationX > 36) runOnJS(goPrev)();
    });

  return (
    <View
      style={{
        height,
        marginTop: extendTop > 0 ? -extendTop : 0,
      }}
      className="relative overflow-hidden"
    >
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          <ProfileMediaSlide uri={photo} isActive />
        </View>
      </GestureDetector>

      {hasStories || header ? (
        <View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}
          pointerEvents="box-none"
        >
          <SafeTopChrome extendBackground="transparent">
            {hasStories ? (
              <View className="items-center px-12 mb-2" pointerEvents="box-none">
                <StoryProgressDots
                  count={count}
                  activeIndex={photoIdx}
                  onSelect={onIndexChange}
                />
              </View>
            ) : null}
            {header ? <View className="px-4">{header}</View> : null}
          </SafeTopChrome>
        </View>
      ) : null}

      {overlay ? (
        <View
          className="absolute left-0 right-0 bottom-0 z-10"
          pointerEvents="box-none"
        >
          {overlay}
        </View>
      ) : null}

      {hasStories ? (
        <>
          <Pressable
            onPress={goPrev}
            disabled={photoIdx === 0}
            className="absolute left-0 top-0 bottom-0"
            style={{ width: width * 0.28, opacity: photoIdx === 0 ? 0.3 : 1, zIndex: 25 }}
            accessibilityLabel="Vorheriges Foto"
          />
          <Pressable
            onPress={goNext}
            disabled={photoIdx >= count - 1}
            className="absolute right-0 top-0 bottom-0"
            style={{
              width: width * 0.28,
              opacity: photoIdx >= count - 1 ? 0.3 : 1,
              zIndex: 25,
            }}
            accessibilityLabel="Nächstes Foto"
          />
        </>
      ) : null}
    </View>
  );
}
