import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export function BackButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      className="w-9 h-9 rounded-full bg-white/5 border border-line items-center justify-center"
      accessibilityLabel="Zurück"
    >
      <Ionicons name="chevron-back" size={18} color="#fff" />
    </Pressable>
  );
}
