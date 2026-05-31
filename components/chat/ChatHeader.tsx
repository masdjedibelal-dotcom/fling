import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { BackButton } from '@/components/ui/BackButton';
import { ChatPartnerName } from '@/components/ui/Typography';
import { TimerRing } from '@/components/chat/TimerRing';
import {
  FLING_COLORS,
  FLING_TOUCH,
  FLING_TYPE,
  formatChatTimerRemaining,
} from '@/lib/designTokens';

type Props = {
  partnerPhoto: string;
  partnerName: string;
  metaLine: string;
  progress: number;
  timerColor: string;
  remainingHours: number;
  remainingMinutes: number;
  isFemale: boolean;
  keyboardHeight: SharedValue<number>;
  onBack: () => void;
  onOpenProfile: () => void;
  onEndPick: () => void;
  onReport: () => void;
  onBlock: () => void;
};

const HEADER_BTN = FLING_TOUCH.min;
/** Tastaturhöhe ab der der Header vollständig kompakt ist */
const COLLAPSE_RANGE = 100;

export function ChatHeader({
  partnerPhoto,
  partnerName,
  metaLine,
  progress,
  timerColor,
  remainingHours,
  remainingMinutes,
  isFemale,
  keyboardHeight,
  onBack,
  onOpenProfile,
  onEndPick,
  onReport,
  onBlock,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compactActive, setCompactActive] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useAnimatedReaction(
    () => keyboardHeight.value > 28,
    (compact, prev) => {
      if (prev === null || compact !== prev) {
        runOnJS(setCompactActive)(compact);
        if (compact) runOnJS(closeMenu)();
      }
    },
    [keyboardHeight],
  );

  useEffect(() => {
    if (compactActive) setMenuOpen(false);
  }, [compactActive]);

  const centerStyle = useAnimatedStyle(() => {
    const h = keyboardHeight.value;
    return {
      opacity: interpolate(h, [0, COLLAPSE_RANGE * 0.65], [1, 0], Extrapolation.CLAMP),
      maxHeight: interpolate(h, [0, COLLAPSE_RANGE], [240, 0], Extrapolation.CLAMP),
      marginTop: interpolate(h, [0, COLLAPSE_RANGE], [4, 0], Extrapolation.CLAMP),
      overflow: 'hidden' as const,
    };
  });

  const compactAvatarStyle = useAnimatedStyle(() => {
    const h = keyboardHeight.value;
    return {
      opacity: interpolate(h, [8, COLLAPSE_RANGE * 0.55], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          scale: interpolate(h, [8, COLLAPSE_RANGE * 0.55], [0.82, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <View style={styles.root}>
      {menuOpen ? (
        <Pressable
          style={styles.menuBackdrop}
          onPress={closeMenu}
          accessibilityLabel="Menü schließen"
        />
      ) : null}

      <View style={styles.topRow} className="flex-row items-center justify-between px-4 pt-1 pb-1">
        <BackButton onPress={onBack} />

        <Animated.View
          style={[styles.compactAvatarWrap, compactAvatarStyle]}
          pointerEvents={compactActive ? 'auto' : 'none'}
        >
          <Pressable
            onPress={onOpenProfile}
            accessibilityLabel="Partnerprofil"
            hitSlop={8}
          >
            <TimerRing
              photoUri={partnerPhoto}
              progress={progress}
              color={timerColor}
              variant="compact"
            />
          </Pressable>
        </Animated.View>

        <View className="flex-row items-center gap-2" style={styles.actions}>
          <View style={styles.menuAnchor}>
            <Pressable
              onPress={() => setMenuOpen((v) => !v)}
              hitSlop={10}
              className="rounded-full bg-white/5 items-center justify-center"
              style={{ width: HEADER_BTN, height: HEADER_BTN }}
              accessibilityLabel="Mehr"
            >
              <Text
                className="text-fg-3 leading-none"
                style={{ fontSize: FLING_TYPE.title, marginTop: -2 }}
              >
                ⋯
              </Text>
            </Pressable>

            {menuOpen ? (
              <View style={styles.menuDropdown}>
                <Pressable
                  onPress={() => {
                    closeMenu();
                    onReport();
                  }}
                  className="px-4 py-3.5 border-b border-line"
                >
                  <Text
                    className="text-white font-semibold"
                    style={{ fontSize: FLING_TYPE.subhead }}
                  >
                    Melden
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    closeMenu();
                    onBlock();
                  }}
                  className="px-4 py-3.5 border-b border-line"
                >
                  <Text
                    className="text-white font-semibold"
                    style={{ fontSize: FLING_TYPE.subhead }}
                  >
                    Blockieren
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    closeMenu();
                    onEndPick();
                  }}
                  className="px-4 py-3.5"
                >
                  <Text
                    className="text-accent font-semibold"
                    style={{ fontSize: FLING_TYPE.subhead }}
                  >
                    {isFemale ? 'Pick beenden' : 'Unpick'}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={onEndPick}
            hitSlop={8}
            accessibilityLabel={isFemale ? 'Pick beenden' : 'Unpick'}
            className="rounded-full bg-accent items-center justify-center"
            style={{ width: HEADER_BTN, height: HEADER_BTN }}
          >
            <FlingIcon name="close" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      <Animated.View
        className="items-center px-6 pb-2"
        style={[styles.centerBlock, centerStyle]}
        pointerEvents={compactActive ? 'none' : 'auto'}
      >
        <Pressable onPress={onOpenProfile} accessibilityLabel="Partnerprofil">
          <TimerRing
            photoUri={partnerPhoto}
            progress={progress}
            color={timerColor}
            variant="large"
          />
        </Pressable>
        <ChatPartnerName className="mt-2">{partnerName}</ChatPartnerName>
        <Text
          className="text-fg-3 font-medium mt-1"
          style={{ fontSize: FLING_TYPE.caption }}
        >
          {metaLine}
        </Text>
        <Text
          className="text-accent font-bold mt-1"
          style={{ fontSize: FLING_TYPE.meta, fontFamily: 'Inter_600SemiBold' }}
        >
          {formatChatTimerRemaining(remainingHours, remainingMinutes)}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 20,
    elevation: 20,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  topRow: {
    zIndex: 30,
    elevation: 30,
    position: 'relative',
  },
  compactAvatarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  actions: {
    zIndex: 31,
    elevation: 31,
  },
  menuAnchor: {
    position: 'relative',
    zIndex: 32,
    elevation: 32,
  },
  menuDropdown: {
    position: 'absolute',
    top: HEADER_BTN + 6,
    right: 0,
    minWidth: 196,
    backgroundColor: FLING_COLORS.card,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: FLING_COLORS.line2,
    zIndex: 50,
    elevation: 50,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  centerBlock: {
    zIndex: 10,
  },
});
