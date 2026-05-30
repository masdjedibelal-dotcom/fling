import { useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { triggerHaptic } from '@/lib/haptics';

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: boolean;
}

export function OtpInput({ value, onChange, length = 6, error = false }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(length, '').split('').slice(0, length);
  const focusIndex = Math.min(value.length, length - 1);
  const shake = useSharedValue(0);
  const prevLen = useRef(value.length);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (value.length > prevLen.current) {
      triggerHaptic('light');
    }
    prevLen.current = value.length;
  }, [value.length]);

  useEffect(() => {
    if (!error) return;
    triggerHaptic('warning');
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [error, shake]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={length}
        className="absolute opacity-0 w-px h-px"
        accessibilityLabel="SMS Code"
      />
      <Pressable onPress={() => inputRef.current?.focus()}>
        <Animated.View className="flex-row gap-2 justify-center" style={rowStyle}>
          {digits.map((digit, i) => {
            const filled = digit.trim().length > 0;
            const current = i === focusIndex && value.length < length;
            return (
              <View
                key={i}
                className={`w-11 h-[52px] rounded-xl border items-center justify-center ${
                  error
                    ? 'border-accent bg-accent/10'
                    : current
                      ? 'border-accent bg-accent/10'
                      : 'border-line bg-white/[0.03]'
                }`}
              >
                <Text
                  className={`text-2xl font-bold ${
                    filled ? 'text-white' : 'text-fg-4 font-normal'
                  }`}
                >
                  {filled ? digit : '_'}
                </Text>
              </View>
            );
          })}
        </Animated.View>
      </Pressable>
    </View>
  );
}
