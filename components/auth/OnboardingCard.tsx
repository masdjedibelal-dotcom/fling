import { View } from 'react-native';
import { DisplayText, BodyText } from '@/components/ui/Typography';

interface OnboardingCardProps {
  title: string;
  body: string;
  graphic?: React.ReactNode;
}

export function OnboardingCard({ title, body, graphic }: OnboardingCardProps) {
  return (
    <View className="mt-6 rounded-[20px] border border-accent/20 bg-card-2 p-5 overflow-hidden">
      <View
        className="absolute -top-6 -right-6 w-40 h-40 rounded-full"
        style={{ backgroundColor: 'rgba(209,21,55,0.25)' }}
      />
      {graphic ? (
        <View className="items-center py-2 mb-1 relative">{graphic}</View>
      ) : null}
      <DisplayText className="text-[46px] font-extrabold leading-[0.92] tracking-tight relative">
        {title}
      </DisplayText>
      <BodyText className="text-fg-2 mt-3.5 relative">{body}</BodyText>
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
        className={`w-1.5 h-1.5 rounded-full mt-2 ${
          variant === 'green' ? 'bg-green' : 'bg-accent'
        }`}
        style={{
          shadowColor: variant === 'green' ? '#00e07a' : '#D11537',
          shadowOpacity: 0.55,
          shadowRadius: 6,
        }}
      />
      <BodyText className="text-fg-2 flex-1 text-[13px]">{text}</BodyText>
    </View>
  );
}
