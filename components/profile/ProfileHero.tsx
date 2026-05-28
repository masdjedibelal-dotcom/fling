import { View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { DisplayText } from '@/components/ui/Typography';
import { VerifiedBadge } from '@/components/graphics';

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
    <View className="items-center mb-5">
      <View className="w-full flex-row justify-center relative min-h-[120px]">
        <Pressable onPress={onAvatarPress} className="relative">
          <View className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-line">
            <Image source={{ uri: photoUri }} className="w-full h-full" contentFit="cover" />
          </View>
          <View className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-card border border-line items-center justify-center">
            <Ionicons name="images-outline" size={16} color="rgba(255,255,255,0.8)" />
          </View>
        </Pressable>

        <Pressable
          onPress={onEditPress}
          hitSlop={10}
          className="absolute top-0 right-0 w-10 h-10 rounded-full bg-card/90 border border-line items-center justify-center"
        >
          <Ionicons name="pencil" size={16} color="#D11537" />
        </Pressable>
      </View>

      <DisplayText className="text-xl mt-4 tracking-tight">{displayName}</DisplayText>
      {verified ? (
        <View className="mt-2">
          <VerifiedBadge size={20} />
        </View>
      ) : null}
    </View>
  );
}
