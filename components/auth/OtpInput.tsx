import { useRef, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
}

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(length, '').split('').slice(0, length);
  const focusIndex = Math.min(value.length, length - 1);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      <Pressable
        onPress={() => inputRef.current?.focus()}
        className="flex-row gap-2 justify-center"
      >
        {digits.map((digit, i) => {
          const filled = digit.trim().length > 0;
          const current = i === focusIndex && value.length < length;
          return (
            <View
              key={i}
              className={`w-9 h-[46px] rounded-[10px] border items-center justify-center ${
                current
                  ? 'border-accent bg-accent/10'
                  : 'border-line bg-white/[0.03]'
              }`}
            >
              <Text
                className={`text-xl font-bold ${
                  filled ? 'text-white' : 'text-fg-4 font-normal'
                }`}
              >
                {filled ? digit : '_'}
              </Text>
            </View>
          );
        })}
      </Pressable>
    </View>
  );
}
