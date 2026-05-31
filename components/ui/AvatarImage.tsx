import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { FLING_COLORS } from '@/lib/designTokens';

type Props = {
  uri: string;
  size: number;
  recyclingKey?: string;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
};

/** Runde Avatare — feste Pixelmaße (expo-image + className „w-full“ ist auf Native unzuverlässig). */
export function AvatarImage({
  uri,
  size,
  recyclingKey,
  style,
  borderRadius = size / 2,
}: Props) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: FLING_COLORS.card,
        },
        style,
      ]}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        contentFit="cover"
        recyclingKey={recyclingKey ?? uri}
      />
    </View>
  );
}
