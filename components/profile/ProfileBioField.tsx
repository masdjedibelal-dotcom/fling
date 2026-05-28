import { View, Text, TextInput } from 'react-native';
import { MAX_BIO_LENGTH } from '@/lib/constants';

export function ProfileBioField({
  bio,
  onChange,
}: {
  bio: string;
  onChange: (bio: string) => void;
}) {
  return (
    <View className="mb-6">
      <Text className="text-fg-4 text-[10px] uppercase tracking-widest font-semibold mb-2 px-1">
        Bio
      </Text>
      <TextInput
        value={bio}
        onChangeText={(t) => onChange(t.slice(0, MAX_BIO_LENGTH))}
        multiline
        textAlignVertical="top"
        placeholder="Kurz über dich…"
        placeholderTextColor="rgba(255,255,255,0.38)"
        className="text-fg-2 text-[15px] leading-6 font-body min-h-[88px] px-1"
        style={{ fontFamily: 'Inter_500Medium' }}
      />
      <Text className="font-mono text-fg-4 text-[10px] uppercase tracking-widest text-right mt-1">
        {bio.length} / {MAX_BIO_LENGTH}
      </Text>
    </View>
  );
}
