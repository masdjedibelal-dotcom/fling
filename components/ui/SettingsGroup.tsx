import { View, Pressable, Text } from 'react-native';
import { SectionLabel } from '@/components/ui/Typography';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { FLING_RADIUS, FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';

export function SettingsGroup({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6">
      {title ? <SectionLabel className="px-1">{title}</SectionLabel> : null}
      <View
        className="border border-line overflow-hidden"
        style={{ borderRadius: FLING_RADIUS.md, backgroundColor: FLING_COLORS.card }}
      >
        {children}
      </View>
    </View>
  );
}

export function SettingsRow({
  label,
  sub,
  onPress,
  destructive,
  isLast,
}: {
  label: string;
  sub?: string;
  onPress: () => void;
  destructive?: boolean;
  isLast?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row justify-between items-center px-4 py-4 ${
        isLast ? '' : 'border-b border-line'
      }`}
    >
      <View className="flex-1 pr-3">
        <Text
          className={`font-body font-semibold ${
            destructive ? 'text-accent' : 'text-white'
          }`}
          style={{ fontSize: FLING_TYPE.callout, lineHeight: 22 }}
        >
          {label}
        </Text>
        {sub ? (
          <Text
            className="text-fg-3 mt-1"
            style={{ fontSize: FLING_TYPE.subhead, lineHeight: 20 }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      {!destructive ? (
        <FlingIcon name="chev" size={18} color={FLING_COLORS.fg4} />
      ) : null}
    </Pressable>
  );
}
