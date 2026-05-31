import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { FlingScrollView } from '@/components/ui/FlingScrollView';
import { BackButton } from '@/components/ui/BackButton';
import { HeroText, BodyLarge, StepLabel } from '@/components/ui/Typography';
import { FLING_SPACE } from '@/lib/designTokens';

type Props = {
  step?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
};

/** Einheitliches Auth/Onboarding-Layout — keine Dashboard-Fragmente */
export function AuthLayout({ step, title, subtitle, children, footer, onBack }: Props) {
  return (
    <Screen className="px-6 pt-2 pb-6">
      {onBack ? (
        <View className="mb-4">
          <BackButton onPress={onBack} />
        </View>
      ) : null}
      {step ? (
        <View style={{ marginBottom: FLING_SPACE.sm }}>
          <StepLabel>{step}</StepLabel>
        </View>
      ) : null}
      <HeroText style={{ marginBottom: FLING_SPACE.sm }}>{title}</HeroText>
      {subtitle ? (
        <BodyLarge className="max-w-[300px] mb-6">{subtitle}</BodyLarge>
      ) : (
        <View style={{ height: FLING_SPACE.md }} />
      )}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 6 : 0}
      >
        <FlingScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </FlingScrollView>
      </KeyboardAvoidingView>
      {footer ? <View style={{ marginTop: FLING_SPACE.lg }}>{footer}</View> : null}
    </Screen>
  );
}
