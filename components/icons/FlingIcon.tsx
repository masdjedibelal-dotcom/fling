import Svg, { Path } from 'react-native-svg';
import { FLING_COLORS, FLING_ICON_SIZE } from '@/lib/designTokens';
import { VerifiedStamp } from '@/components/graphics/VerifiedStamp';

export type FlingIconName =
  | 'home'
  | 'pick'
  | 'profile'
  | 'chat'
  | 'heart'
  | 'search'
  | 'camera'
  | 'bell'
  | 'lock'
  | 'verified'
  | 'close'
  | 'timer';

type Props = {
  name: FlingIconName;
  size?: number;
  color?: string;
};

/** Solid-filled Brand Icons — stroke 0, optical 24×24 */
export function FlingIcon({
  name,
  size = FLING_ICON_SIZE,
  color = FLING_COLORS.fg,
}: Props) {
  if (name === 'verified') {
    return <VerifiedStamp size={size} />;
  }

  const path = ICON_PATHS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d={path} />
    </Svg>
  );
}

const ICON_PATHS: Record<Exclude<FlingIconName, 'verified'>, string> = {
  home:
    'M12 3.2 4 9.5v11.3h5.5v-7.2H14.5v7.2H20V9.5L12 3.2zm0 2.4 5 4.1v8.1h-2.5v-7.2H9.5v7.2H7V9.7l5-4.1z',
  pick: 'M13.2 2 6 14h5.4l-.8 8 7.6-13.5H12.8L13.2 2z',
  profile:
    'M12 12c2.4 0 4.3-1.9 4.3-4.3S14.4 3.4 12 3.4 7.7 5.3 7.7 7.7 9.6 12 12 12zm0 2.2c-3.1 0-6.2 1.5-6.2 3.4V19h12.4v-1.4c0-1.9-3.1-3.4-6.2-3.4z',
  chat: 'M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H9l-5 3.5V5.5z',
  heart:
    'M12 20.8S4 15.2 4 9.8c0-2.8 2.2-5 5-5 1.7 0 3.2.9 4 2.2.8-1.3 2.3-2.2 4-2.2 2.8 0 5 2.2 5 5 0 5.4-8 11-8 11z',
  search:
    'M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 2.2a4.3 4.3 0 1 0 0 8.6 4.3 4.3 0 0 0 0-8.6zm6.8 11.1-3.4-3.4 1.6-1.6 3.4 3.4-1.6 1.6z',
  camera:
    'M9.2 5.5 8 7H6.5A2.5 2.5 0 0 0 4 9.5v9A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 17.5 7H16l-1.2-1.5H9.2zM12 17.2a3.7 3.7 0 1 1 0-7.4 3.7 3.7 0 0 1 0 7.4z',
  bell:
    'M12 22a2.4 2.4 0 0 0 2.3-1.8H9.7A2.4 2.4 0 0 0 12 22zM18 16.5H6v-1.2c0-3.1 1.6-4.8 1.6-7.5a4.4 4.4 0 0 1 8.8 0c0 2.7 1.6 4.4 1.6 7.5v1.2z',
  lock:
    'M7 10V8.5a5 5 0 0 1 10 0V10h1.5A1.5 1.5 0 0 1 20 11.5v8A1.5 1.5 0 0 1 18.5 21h-13A1.5 1.5 0 0 1 4 19.5v-8A1.5 1.5 0 0 1 5.5 10H7zm2 0h6V8.5a3 3 0 0 0-6 0V10z',
  close:
    'M6.3 5 5 6.3 10.7 12 5 17.7 6.3 19 12 13.3 17.7 19 19 17.7 13.3 12 19 6.3 17.7 5 12 10.7 6.3 5z',
  timer:
    'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 2.2a5.8 5.8 0 1 0 0 11.6 5.8 5.8 0 0 0 0-11.6zM11 8h2.2v5.2L15.4 15 14 16l-3-2.2V8z',
};
