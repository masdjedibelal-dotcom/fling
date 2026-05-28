import { View, Text, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import type { Message } from '@/lib/types';

const textBlurWeb = {
  filter: 'blur(6px)',
  opacity: 0.65,
  userSelect: 'none',
} as object;

function Bubble({ msg, blurText }: { msg: Message; blurText?: boolean }) {
  const isHer = msg.is_female;

  return (
    <View
      className={`flex-row items-end gap-1.5 max-w-[78%] ${isHer ? '' : 'self-end flex-row-reverse'}`}
    >
      {isHer ? (
        <View className="w-[26px] h-[26px] rounded-full overflow-hidden">
          <Image
            source={{ uri: 'https://i.pravatar.cc/100?img=5' }}
            className="w-full h-full"
          />
        </View>
      ) : null}
      <View
        className={`px-3.5 py-2.5 max-w-full ${
          isHer
            ? 'bg-accent rounded-[18px] rounded-bl-[4px]'
            : 'bg-card border border-line rounded-[18px] rounded-br-[4px]'
        }`}
      >
        <View className="relative overflow-hidden">
          <Text
            className="text-[14px] leading-[20px] font-body text-white"
            style={blurText && Platform.OS === 'web' ? textBlurWeb : undefined}
          >
            {msg.body}
          </Text>
          {blurText && Platform.OS !== 'web' ? (
            <BlurView
              pointerEvents="none"
              intensity={48}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function ChatMessages({
  blurred,
  visible,
}: {
  blurred: Message[];
  visible: Message[];
}) {
  return (
    <View className="gap-2 px-3.5 pb-2">
      {blurred.map((m) => (
        <Bubble key={m.id} msg={m} blurText />
      ))}

      {blurred.length > 0 && visible.length > 0 ? (
        <View className="flex-row items-center gap-2 my-2">
          <View className="flex-1 h-px bg-line" />
          <Text className="font-mono text-fg-4 text-[10px] uppercase tracking-widest">
            Letzte Nachrichten
          </Text>
          <View className="flex-1 h-px bg-line" />
        </View>
      ) : null}

      {visible.map((m) => (
        <Bubble key={m.id} msg={m} />
      ))}
    </View>
  );
}
