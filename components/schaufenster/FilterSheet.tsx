import { useEffect, useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useAppDimensions } from '@/hooks/useAppDimensions';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/stores/appStore';
import { Button } from '@/components/ui/Button';
import { TitleText, SectionLabel } from '@/components/ui/Typography';
import type { AvailabilityFilter } from '@/lib/types';
import { MAX_RADIUS_KM } from '@/lib/constants';
import { getAuswahlHeaderHeight } from '@/components/schaufenster/AuswahlHeader';
import { FLING_COLORS, FLING_RADIUS, FLING_TYPE } from '@/lib/designTokens';

const FILTERS: { key: AvailabilityFilter; label: string }[] = [
  { key: 'now', label: 'Jetzt' },
  { key: 'today', label: 'Heute' },
  { key: 'all', label: 'Alle' },
];

const SPRING_OPEN = { damping: 28, stiffness: 320, mass: 0.85 };

function Chip({
  active,
  label,
  onPress,
  className,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={className}
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
    </Pressable>
  );
}

/**
 * Vollflächig unter der Header-Zeile — schiebt von unten hoch / wieder runter.
 */
export function FilterSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useAppDimensions();
  const headerH = getAuswahlHeaderHeight(insets.top);
  const sheetTravel = screenH - headerH;
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);

  const radiusKm = useAppStore((s) => s.radiusKm);
  const filter = useAppStore((s) => s.filter);
  const setRadiusKm = useAppStore((s) => s.setRadiusKm);
  const setFilter = useAppStore((s) => s.setFilter);
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
  }, [visible, mounted]);

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
      style={StyleSheet.absoluteFill}
      pointerEvents={visible || mounted ? 'auto' : 'none'}
    >
      <Animated.View
        style={[
          styles.panel,
          panelAnim,
          {
            top: headerH,
            height: sheetTravel,
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
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <View className="flex-row justify-between items-center mb-5">
            <TitleText>Filter</TitleText>
            <Pressable onPress={resetFilters}>
              <Text
                className="text-fg-3 font-semibold"
                style={{ fontSize: FLING_TYPE.subhead }}
              >
                Zurücksetzen
              </Text>
            </Pressable>
          </View>

          <SectionLabel>Radius · {radiusKm} km</SectionLabel>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {[1, 5, 10, 25, MAX_RADIUS_KM].map((km) => (
              <Chip
                key={km}
                active={radiusKm === km}
                label={`${km} km`}
                onPress={() => setRadiusKm(km)}
              />
            ))}
          </View>

          <SectionLabel>Verfügbarkeit</SectionLabel>
          <View className="flex-row gap-2 mb-2">
            {FILTERS.map((f) => (
              <Chip
                key={f.key}
                active={filter === f.key}
                label={f.label}
                onPress={() => setFilter(f.key)}
                className="flex-1 items-center"
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Profile anzeigen" onPress={onClose} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    flex: 1,
    minHeight: 0,
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
