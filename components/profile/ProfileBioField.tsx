import { View, Text, TextInput } from 'react-native';
import { SectionLabel, MetaText } from '@/components/ui/Typography';
import { MAX_BIO_LENGTH } from '@/lib/constants';
import { FLING_RADIUS, FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';
import {
  BIO_PLACEHOLDER_FEMALE,
  BIO_PLACEHOLDER_MALE,
} from '@/lib/marketingCopy';
import { useAuthStore } from '@/stores/authStore';

export function ProfileBioField({
  bio,
  onChange,
}: {
  bio: string;
  onChange: (bio: string) => void;
}) {
  const gender = useAuthStore((s) => s.gender);
  const placeholder =
    gender === 'female' ? BIO_PLACEHOLDER_FEMALE : BIO_PLACEHOLDER_MALE;
  return (
    <View className="mb-6">
      <SectionLabel className="px-1">Bio</SectionLabel>
      <TextInput
        value={bio}
        onChangeText={(t) => onChange(t.slice(0, MAX_BIO_LENGTH))}
        multiline
        textAlignVertical="top"
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.38)"
        className="text-fg-2 font-body min-h-[100px] px-4 py-3 border border-line"
        style={{
          fontSize: FLING_TYPE.body,
          lineHeight: 24,
          fontFamily: 'Inter_500Medium',
          borderRadius: FLING_RADIUS.md,
          backgroundColor: FLING_COLORS.card,
        }}
      />
      <MetaText className="text-right mt-2 normal-case">
        {bio.length} / {MAX_BIO_LENGTH}
      </MetaText>
    </View>
  );
}
