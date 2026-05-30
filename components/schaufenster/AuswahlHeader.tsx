import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { SafeTopChrome } from '@/components/ui/SafeTopChrome';
import { PressableScale } from '@/components/ui/PressableScale';
import { usePulse } from '@/components/graphics/useGraphicMotion';
import { FLING_COLORS, FLING_TYPE, FLING_TOUCH } from '@/lib/designTokens';
import { getChromeHeaderHeight } from '@/lib/safeAreaLayout';
import { useAppStore, type AuswahlViewMode } from '@/stores/appStore';

/** Höhe bis unterhalb der Header-Zeile (Radius-Sheet startet darunter) */
export function getAuswahlHeaderHeight(topInset: number): number {
  return getChromeHeaderHeight(topInset);
}

function LiveDot() {
  const { scale, opacity } = usePulse(2200);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: FLING_COLORS.green,
          shadowColor: FLING_COLORS.green,
          shadowOpacity: 0.8,
          shadowRadius: 6,
        },
        style,
      ]}
    />
  );
}

export function AuswahlHeader({
  activeCount,
  viewMode,
  onNearbyPress,
  onViewModePress,
  overlay,
  showStatus = true,
  loading = false,
}: {
  activeCount: number;
  viewMode: AuswahlViewMode;
  onNearbyPress: () => void;
  onViewModePress: () => void;
  overlay?: boolean;
  showStatus?: boolean;
  loading?: boolean;
}) {
  const radiusKm = useAppStore((s) => s.radiusKm);
  const listIcon = viewMode === 'grid' ? 'list' : 'grid';
  const listLabel =
    viewMode === 'grid' ? 'Listenansicht' : 'Kachelansicht';

  const statusLabel = loading
    ? `— aktiv · innerhalb von ${radiusKm} km`
    : `${activeCount} aktiv · innerhalb von ${radiusKm} km`;

  return (
    <SafeTopChrome
      extendBackground={overlay ? 'transparent' : true}
      className={`flex-row items-center px-3 pb-3 z-30 ${showStatus ? 'justify-between' : 'justify-end'}`}
    >
      {showStatus ? (
        <PressableScale
          onPress={onNearbyPress}
          disabled={loading}
          accessibilityLabel="Radius einstellen"
          className="flex-row items-center gap-2 flex-1 min-w-0"
          hitSlop={8}
          haptic="light"
          scale={0.98}
        >
          <LiveDot />
          <Text
            className={`font-semibold ${loading ? 'text-fg-3' : 'text-white'}`}
            style={{ fontSize: FLING_TYPE.subhead }}
            numberOfLines={1}
          >
            {statusLabel}
          </Text>
        </PressableScale>
      ) : null}

      <PressableScale
        onPress={onViewModePress}
        accessibilityLabel={listLabel}
        haptic="medium"
        scale={0.94}
        className="rounded-full items-center justify-center border"
        style={{
          width: FLING_TOUCH.min,
          height: FLING_TOUCH.min,
          borderColor: 'rgba(255,255,255,0.12)',
          backgroundColor: overlay
            ? 'rgba(0,0,0,0.45)'
            : 'rgba(255,255,255,0.05)',
          zIndex: 50,
          elevation: 50,
        }}
      >
        <FlingIcon name={listIcon} size={20} color={FLING_COLORS.fg2} />
      </PressableScale>
    </SafeTopChrome>
  );
}
