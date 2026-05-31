import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { HeroText, BodyLarge, StepLabel, SectionLabel } from '@/components/ui/Typography';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { accentRgba, FLING_COLORS, FLING_RADIUS } from '@/lib/designTokens';
import { REJECTION_COPY } from '@/lib/types';
import { useAuthStore } from '@/stores/authStore';

export default function RejectedScreen() {
  const gender = useAuthStore((s) => s.gender);
  const reason = useAuthStore((s) => s.rejectionReason) ?? 'id_blurry';
  const copy = REJECTION_COPY[reason];

  return (
    <Screen className="px-5 pt-2 pb-6">
      <StepLabel className="mt-6">Erneut versuchen</StepLabel>

      <View className="flex-1 items-center justify-center gap-5 px-2">
        <View
          className="w-16 h-16 rounded-full items-center justify-center border border-accent/30"
          style={{ backgroundColor: accentRgba(0.12) }}
        >
          <FlingIcon name="warn" size={28} color={FLING_COLORS.accent} />
        </View>
        <HeroText className="text-center">{copy.title}</HeroText>
        <BodyLarge className="text-center max-w-[300px]">{copy.subtitle}</BodyLarge>

        <View
          className="w-full max-w-[300px] p-4 border border-line mt-2"
          style={{ borderRadius: FLING_RADIUS.md, backgroundColor: FLING_COLORS.card }}
        >
          <SectionLabel className="mb-3">Tipps</SectionLabel>
          {copy.hints.map((hint) => (
            <BodyLarge key={hint} className="text-fg-2 mb-2 leading-6">
              · {hint}
            </BodyLarge>
          ))}
        </View>
      </View>

      <Button
        label="Erneut versuchen"
        onPress={() =>
          router.replace(
            gender === 'male'
              ? '/(auth)/verify/id-scan'
              : '/(auth)/verify/selfie',
          )
        }
      />
    </Screen>
  );
}
