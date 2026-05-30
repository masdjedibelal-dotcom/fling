import { Pressable } from 'react-native';
import { router } from 'expo-router';
import { FlingIcon } from '@/components/icons/FlingIcon';

export function BackButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      className="w-11 h-11 rounded-full bg-white/5 border border-line items-center justify-center"
      accessibilityLabel="Zurück"
    >
      <FlingIcon name="back" size={20} color="#fff" />
    </Pressable>
  );
}
