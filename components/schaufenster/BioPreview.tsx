import { useState, useCallback } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
} from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { CalloutText, CaptionText } from '@/components/ui/Typography';

const PREVIEW_LINES = 2;
const CHAR_MORE_HINT = 88;

type Props = {
  bio: string;
  className?: string;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

/**
 * Bio gekürzt — Tipp auf Text oder „mehr“ klappt auf; erneut tippen oder außerhalb einklappen.
 */
export function BioPreview({
  bio,
  className,
  expanded: expandedProp,
  onExpandedChange,
}: Props) {
  const { height: screenH, width: screenW } = useAppDimensions();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [measureWidth, setMeasureWidth] = useState(0);

  const isControlled = expandedProp !== undefined;
  const expanded = isControlled ? expandedProp : internalExpanded;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  const expand = useCallback(() => setExpanded(true), [setExpanded]);
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);

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

  if (expanded) {
    return (
      <View
        className={className}
        style={[styles.root, { maxWidth: screenW * 0.92 }]}
        onLayout={(e) => setMeasureWidth(e.nativeEvent.layout.width)}
      >
        <Pressable
          onPress={collapse}
          accessibilityRole="button"
          accessibilityLabel="Bio einklappen"
        >
          <ScrollView
            style={{ maxHeight: maxExpandedH }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
          >
            <CalloutText className="text-white/90">{trimmed}</CalloutText>
          </ScrollView>
          <Pressable
            onPress={collapse}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Bio einklappen"
          >
            <CaptionText className="text-fg-3 font-semibold mt-1">weniger</CaptionText>
          </Pressable>
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
          <CalloutText
            className="text-white/90"
            style={[styles.measureText, { width: measureWidth }]}
            onTextLayout={onMeasureLayout}
          >
            {trimmed}
          </CalloutText>
        </View>
      ) : null}

      {showMore ? (
        <Pressable
          onPress={expand}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Bio vollständig anzeigen"
        >
          <CalloutText className="text-white/90" numberOfLines={PREVIEW_LINES}>
            {trimmed}
          </CalloutText>
        </Pressable>
      ) : (
        <CalloutText className="text-white/90" numberOfLines={PREVIEW_LINES}>
          {trimmed}
        </CalloutText>
      )}

      {showMore ? (
        <Pressable
          onPress={expand}
          hitSlop={{ top: 8, bottom: 12, left: 12, right: 24 }}
          accessibilityRole="button"
          accessibilityLabel="Bio vollständig anzeigen"
          style={styles.moreBtn}
        >
          <CaptionText className="text-fg-3 font-semibold mt-1">mehr</CaptionText>
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
  moreBtn: {
    alignSelf: 'flex-start',
  },
});
