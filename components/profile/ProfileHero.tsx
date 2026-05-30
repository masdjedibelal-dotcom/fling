import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { TitleText } from '@/components/ui/Typography';
import { VerifiedBadge } from '@/components/graphics';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_COLORS, FLING_RADIUS } from '@/lib/designTokens';

export function ProfileHero({
  photoUri,
  displayName,
  onAvatarPress,
  onEditPress,
  verified,
}: {
  photoUri: string;
  displayName: string;
  onAvatarPress: () => void;
  onEditPress: () => void;
  verified?: boolean;
}) {
  return (
    <View className="items-center mb-6">
      <View className="w-full flex-row justify-center relative min-h-[128px]">
        <Pressable onPress={onAvatarPress} className="relative">
          <View
            className="w-[128px] h-[128px] rounded-full overflow-hidden border-2 border-line-2"
          >
            <Image source={{ uri: photoUri }} className="w-full h-full" contentFit="cover" />
          </View>
          <View
            className="absolute bottom-0 right-0 w-10 h-10 rounded-full border border-line items-center justify-center"
            style={{ backgroundColor: FLING_COLORS.card }}
          >
            <FlingIcon name="images" size={18} color="rgba(255,255,255,0.85)" />
          </View>
        </Pressable>

        <Pressable
          onPress={onEditPress}
          hitSlop={10}
          className="absolute top-0 right-0 w-11 h-11 rounded-full border border-line items-center justify-center"
          style={{ backgroundColor: FLING_COLORS.card2 }}
        >
          <FlingIcon name="edit" size={18} color={FLING_COLORS.accent} />
        </Pressable>
      </View>

      <TitleText className="mt-4 text-center">{displayName}</TitleText>
      {verified ? (
        <View className="mt-2">
          <VerifiedBadge size={18} />
        </View>
      ) : null}
    </View>
  );
}
