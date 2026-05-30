import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
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
};

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
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View className="pb-1">
      <View className="flex-row items-center justify-between px-4 pt-1">
        <BackButton onPress={onBack} />

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={10}
            className="rounded-full bg-white/5 border border-line items-center justify-center"
            style={{ width: FLING_TOUCH.min, height: FLING_TOUCH.min }}
            accessibilityLabel="Mehr"
          >
            <Text
              className="text-fg-3 leading-none"
              style={{ fontSize: FLING_TYPE.title }}
            >
              ⋯
            </Text>
          </Pressable>
          <Pressable
            onPress={onEndPick}
            hitSlop={8}
            accessibilityLabel={isFemale ? 'Pick beenden' : 'Unpick'}
            className="flex-row items-center gap-1.5 px-3 py-2 rounded-pill border border-line-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            <FlingIcon name="close" size={12} color={FLING_COLORS.fg} />
            <Text
              className="text-fg font-semibold"
              style={{ fontSize: FLING_TYPE.caption2 }}
            >
              {isFemale ? 'Beenden' : 'Unpick'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="items-center px-6 pt-1 pb-2">
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

      <Modal visible={menuOpen} transparent animationType="fade">
        <View className="flex-1" style={{ backgroundColor: FLING_COLORS.overlayScrim }}>
          <Pressable className="absolute inset-0" onPress={() => setMenuOpen(false)} />
          <View className="absolute top-16 right-4 bg-card border border-line-2 rounded-md overflow-hidden min-w-[200px]">
          <Pressable
            onPress={() => {
              setMenuOpen(false);
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
              setMenuOpen(false);
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
        </View>
      </Modal>
    </View>
  );
}
