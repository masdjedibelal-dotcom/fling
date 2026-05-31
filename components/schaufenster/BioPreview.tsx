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
          onPress={() => setExpanded(false)}
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
          <CaptionText className="text-fg-3 font-semibold mt-1">weniger</CaptionText>
        </Pressable>
      </View>
    );
  }

  const preview = (
    <>
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

      <CalloutText className="text-white/90" numberOfLines={PREVIEW_LINES}>
        {trimmed}
      </CalloutText>

      {showMore ? (
        <CaptionText className="text-fg-3 font-semibold mt-1">mehr</CaptionText>
      ) : null}
    </>
  );

  return (
    <View
      className={className}
      style={[styles.root, { maxWidth: screenW * 0.92 }]}
      onLayout={(e) => setMeasureWidth(e.nativeEvent.layout.width)}
    >
      {showMore ? (
        <Pressable
          onPress={() => setExpanded(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Bio vollständig anzeigen"
        >
          {preview}
        </Pressable>
      ) : (
        preview
      )}
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
});
