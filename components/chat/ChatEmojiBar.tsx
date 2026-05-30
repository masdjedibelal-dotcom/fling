import { ScrollView, Pressable, Text, View } from 'react-native';
import { CHAT_EMOJI_ROW } from '@/lib/chatEmojis';
import { FLING_COLORS } from '@/lib/designTokens';

type Props = {
  onPick: (emoji: string) => void;
};

/** Emoji-Zeile direkt über der Tastatur (iOS InputAccessory / Android über Composer) */
export function ChatEmojiBar({ onPick }: Props) {
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: FLING_COLORS.line,
        backgroundColor: FLING_COLORS.bg2,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingVertical: 8,
          gap: 4,
          alignItems: 'center',
        }}
      >
        {CHAT_EMOJI_ROW.map((emoji) => (
          <Pressable
            key={emoji}
            onPress={() => onPick(emoji)}
            hitSlop={6}
            style={{
              width: 40,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 24 }}>{emoji}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
