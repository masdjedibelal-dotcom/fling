import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { FLING_TYPE } from '@/lib/designTokens';

const PREVIEW_LINES = 2;
const CHAR_MORE_HINT = 88;

type Props = {
  bio: string;
  className?: string;
  /** Leichter Blur unter dem Text (TikTok-Feed) */
  blurBelow?: boolean;
};

/**
 * Bio wie TikTok: gekürzt + „mehr“, expandiert nach oben inline — kein Modal-Kasten.
 */
export function BioPreview({ bio, className, blurBelow = true }: Props) {
  const { height: screenH, width: screenW } = useAppDimensions();
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [measureWidth, setMeasureWidth] = useState(0);

  const trimmed = bio.trim();
  const maxExpandedH = Math.round(screenH * 0.34);
  const showMore = truncated || trimmed.length > CHAR_MORE_HINT;

  const onMeasureLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (expanded) return;
      setTruncated(e.nativeEvent.lines.length > PREVIEW_LINES);
    },
    [expanded],
  );

  if (!trimmed) return null;

  const bioStyle = {
    fontSize: FLING_TYPE.body,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: 'Inter_400Regular' as const,
  };

  if (expanded) {
    return (
      <View
        className={className}
        style={[styles.root, { maxWidth: screenW * 0.92 }]}
        onLayout={(e) => setMeasureWidth(e.nativeEvent.layout.width)}
      >
        <View style={[styles.expandedBlock, { maxHeight: maxExpandedH }]}>
          <ScrollView
            style={{ maxHeight: maxExpandedH }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
          >
            <Text style={bioStyle}>{trimmed}</Text>
          </ScrollView>

          <LinearGradient
            pointerEvents="none"
            colors={['transparent', 'rgba(18,10,12,0.55)', 'rgba(18,10,12,0.92)']}
            locations={[0, 0.45, 1]}
            style={styles.textBottomFade}
          />
        </View>

        {blurBelow ? (
          <View style={styles.blurBelowWrap} pointerEvents="none">
            {Platform.OS === 'web' ? (
              <LinearGradient
                colors={['transparent', 'rgba(18,10,12,0.35)', 'rgba(18,10,12,0.7)']}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
            )}
          </View>
        ) : null}

        <Pressable
          onPress={() => setExpanded(false)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Bio einklappen"
          style={styles.moreBtn}
        >
          <Text style={styles.moreLess}>weniger</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      className={className}
      style={[styles.root, { maxWidth: screenW * 0.92 }]}
      onLayout={(e) => setMeasureWidth(e.nativeEvent.layout.width)}
    >
      {measureWidth > 0 ? (
        <View pointerEvents="none" style={styles.measureWrap}>
          <Text
            style={[bioStyle, styles.measureText, { width: measureWidth }]}
            onTextLayout={onMeasureLayout}
          >
            {trimmed}
          </Text>
        </View>
      ) : null}

      <Text style={bioStyle} numberOfLines={PREVIEW_LINES}>
        {trimmed}
      </Text>

      {showMore ? (
        <Pressable
          onPress={() => setExpanded(true)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Bio vollständig anzeigen"
          style={styles.moreBtn}
        >
          <Text style={styles.moreLess}>mehr</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  measureWrap: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    top: 0,
    zIndex: -1,
  },
  measureText: {},
  expandedBlock: {
    position: 'relative',
    overflow: 'hidden',
  },
  textBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
  },
  blurBelowWrap: {
    marginTop: 4,
    marginHorizontal: -12,
    height: 44,
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  moreBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  moreLess: {
    fontSize: FLING_TYPE.caption,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Inter_600SemiBold',
  },
});
