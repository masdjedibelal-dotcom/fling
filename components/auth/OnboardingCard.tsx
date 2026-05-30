import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BodyLarge } from '@/components/ui/Typography';
import { FLING_COLORS, FLING_RADIUS, FLING_TYPE } from '@/lib/designTokens';

interface OnboardingCardProps {
  title: string;
  body: string;
  graphic?: React.ReactNode;
}

export function OnboardingCard({ title, body, graphic }: OnboardingCardProps) {
  return (
    <View
      className="mt-6 border border-accent/20 overflow-hidden"
      style={{ borderRadius: FLING_RADIUS.xl }}
    >
      <LinearGradient
        colors={[FLING_COLORS.card2, FLING_COLORS.bg]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        className="p-6 overflow-hidden"
      >
        <View
          className="absolute -top-6 -right-6 w-40 h-40 rounded-full"
          style={{ backgroundColor: 'rgba(225,21,57,0.25)' }}
        />
        {graphic ? (
          <View className="items-center py-2 mb-2 relative">{graphic}</View>
        ) : null}
        <Text
          className="font-display text-white font-extrabold relative"
          style={{
            fontSize: 40,
            lineHeight: 42,
            letterSpacing: -1.2,
          }}
        >
          {title}
        </Text>
        <BodyLarge className="mt-4 relative leading-7">{body}</BodyLarge>
      </LinearGradient>
    </View>
  );
}

export function OnboardingPoint({
  text,
  variant,
}: {
  text: string;
  variant: 'green' | 'accent';
}) {
  return (
    <View className="flex-row gap-3 items-start">
      <View
        className={`w-2 h-2 rounded-full mt-2 ${
          variant === 'green' ? 'bg-green' : 'bg-accent'
        }`}
        style={{
          shadowColor: variant === 'green' ? '#00e07a' : FLING_COLORS.accent,
          shadowOpacity: 0.55,
          shadowRadius: 6,
        }}
      />
      <Text className="text-fg-2 flex-1 font-medium" style={{ fontSize: FLING_TYPE.body, lineHeight: 24 }}>
        {text}
      </Text>
    </View>
  );
}
