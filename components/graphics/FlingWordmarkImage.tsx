import { Image } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';
import type { WordmarkSurface } from '@/lib/brand';

const WORDMARK_ASSET = require('@/assets/fling-wordmark-dark.svg');

type Props = {
  width: number;
  surface?: WordmarkSurface;
  style?: StyleProp<ImageStyle>;
};

/** Raster/SVG-Asset — z. B. wenn Fraunces noch nicht geladen ist */
export function FlingWordmarkImage({
  width,
  surface: _surface = 'dark',
  style,
}: Props) {
  const source = WORDMARK_ASSET;
  const height = width * (160 / 360);

  return (
    <Image
      source={source}
      style={[{ width, height }, style]}
      contentFit="contain"
      accessibilityLabel="fling"
    />
  );
}
