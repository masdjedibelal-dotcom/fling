import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { TitleText, SectionLabel } from '@/components/ui/Typography';
import { MAX_RADIUS_KM } from '@/lib/constants';
import { FLING_COLORS, FLING_RADIUS, FLING_TYPE } from '@/lib/designTokens';
import { triggerHaptic } from '@/lib/haptics';

const SPRING_OPEN = { damping: 28, stiffness: 320, mass: 0.85 };

function Chip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      scale.value = withSpring(1.04, { damping: 14, stiffness: 320 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [active, scale]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={chipStyle}>
      <PressableScale
        onPress={() => {
          triggerHaptic('light');
          onPress();
        }}
        haptic={false}
        scale={0.96}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? FLING_COLORS.accent : 'rgba(255,255,255,0.12)',
          backgroundColor: active ? FLING_COLORS.accent : 'rgba(255,255,255,0.06)',
        }}
      >
        <Text
          className="text-white font-semibold"
          style={{ fontSize: FLING_TYPE.subhead }}
        >
          {label}
        </Text>
      </PressableScale>
    </Animated.View>
  );
}

/** Radius unter dem Auswahl-Header — ohne Verfügbarkeit. */
export function RadiusSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useAppDimensions();
  const panelHeight = Math.min(320, Math.round(screenH * 0.4));
  const sheetTravel = panelHeight;
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);

  const radiusKm = useAppStore((s) => s.radiusKm);
  const setRadiusKm = useAppStore((s) => s.setRadiusKm);
  const resetFilters = useAppStore((s) => s.resetFilters);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withSpring(1, SPRING_OPEN);
    } else if (mounted) {
      progress.value = withTiming(
        0,
        { duration: 280, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
  }, [visible, mounted, progress]);

  const panelAnim = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [sheetTravel, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  if (!mounted && !visible) return null;

  return (
    <View
      style={[StyleSheet.absoluteFill, styles.sheetHost]}
      pointerEvents={visible || mounted ? 'box-none' : 'none'}
    >
      <Animated.View
        pointerEvents="auto"
        style={[
          styles.panel,
          panelAnim,
          {
            bottom: 0,
            height: panelHeight,
            paddingBottom: Math.max(insets.bottom, 20),
            borderTopLeftRadius: FLING_RADIUS.xl,
            borderTopRightRadius: FLING_RADIUS.xl,
          },
        ]}
      >
        <View style={styles.handle} className="w-10 h-1 rounded self-center bg-white/20" />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View className="flex-row justify-between items-center mb-5">
            <TitleText>Radius</TitleText>
            <Pressable onPress={resetFilters}>
              <Text
                className="text-fg-3 font-semibold"
                style={{ fontSize: FLING_TYPE.subhead }}
              >
                Zurücksetzen
              </Text>
            </Pressable>
          </View>

          <SectionLabel>Entfernung · {radiusKm} km</SectionLabel>
          <View className="flex-row flex-wrap gap-2 mb-2">
            {[1, 5, 10, 25, MAX_RADIUS_KM].map((km) => (
              <Chip
                key={km}
                active={radiusKm === km}
                label={`${km} km`}
                onPress={() => setRadiusKm(km)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Fertig"
            onPress={() => {
              triggerHaptic('light');
              onClose();
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetHost: {
    zIndex: 20,
    elevation: 20,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'column',
    backgroundColor: FLING_COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FLING_COLORS.line2,
    paddingTop: 10,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  handle: {
    flexShrink: 0,
    marginBottom: 16,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: 8,
    flexGrow: 0,
  },
  footer: {
    flexShrink: 0,
    paddingTop: 16,
    backgroundColor: FLING_COLORS.surface,
  },
});
