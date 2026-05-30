import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
  onBack: () => void;
  onOpenProfile: () => void;
  onEndPick: () => void;
  onReport: () => void;
  onBlock: () => void;
};

const HEADER_BTN = FLING_TOUCH.min;

export function ChatHeader({
  partnerPhoto,
  partnerName,
  metaLine,
  progress,
  timerColor,
  remainingHours,
  remainingMinutes,
  isFemale,
  onBack,
  onOpenProfile,
  onEndPick,
  onReport,
  onBlock,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <View className="pb-1" style={styles.root}>
      {menuOpen ? (
        <Pressable
          style={styles.menuBackdrop}
          onPress={closeMenu}
          accessibilityLabel="Menü schließen"
        />
      ) : null}

      <View style={styles.topRow} className="flex-row items-center justify-between px-4 pt-1">
        <BackButton onPress={onBack} />

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

      <View className="items-center px-6 pt-1 pb-2" style={styles.centerBlock}>
        <Pressable onPress={onOpenProfile} accessibilityLabel="Partnerprofil">
          <TimerRing photoUri={partnerPhoto} progress={progress} color={timerColor} />
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
      </View>
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
