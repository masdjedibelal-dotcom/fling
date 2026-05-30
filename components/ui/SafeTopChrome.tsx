import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FLING_COLORS } from '@/lib/designTokens';
import { SAFE_TOP_CONTENT_GAP } from '@/lib/safeAreaLayout';

type Props = {
  children: ReactNode;
  /**
   * Hintergrundfarbe im Bereich der Statusleiste (nur Fläche, keine Buttons).
   * `true` = surface, `transparent` = durchsichtig (z. B. Feed-Foto).
   */
  extendBackground?: keyof typeof FLING_COLORS | 'transparent' | true;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

function resolveExtendColor(
  extendBackground: Props['extendBackground'],
): string | undefined {
  if (extendBackground == null) return undefined;
  if (extendBackground === true) return FLING_COLORS.bg;
  if (extendBackground === 'transparent') return 'transparent';
  return FLING_COLORS[extendBackground];
}

/**
 * Interaktiver Header-Inhalt strikt unter Statusleiste / Dynamic Island.
 * Oben nur optional Hintergrund — kein Text, keine Buttons.
 */
export function SafeTopChrome({
  children,
  extendBackground,
  style,
  className,
}: Props) {
  const insets = useSafeAreaInsets();
  const extendColor = resolveExtendColor(extendBackground);

  return (
    <View style={style} pointerEvents="box-none">
      {extendColor != null && insets.top > 0 ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: extendColor,
          }}
        />
      ) : null}

      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: 'transparent' }}
        pointerEvents="box-none"
      >
        <View
          className={className}
          style={{ paddingTop: SAFE_TOP_CONTENT_GAP }}
          pointerEvents="auto"
        >
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
