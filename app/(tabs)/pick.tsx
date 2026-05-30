import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BodyText, BodyLarge, MetaText, TitleText } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/authStore';
import { useMatch } from '@/hooks/useMatch';
import { DEMO_STATS } from '@/lib/demo';
import { chatPartnerName } from '@/lib/profileDisplay';
import { Image } from 'expo-image';
import { ProfileFigureTwo, ProfileFigureWait } from '@/components/graphics';

export default function PickScreen() {
  const gender = useAuthStore((s) => s.gender);
  const userId = useAuthStore((s) => s.userId);
  const profile = useAuthStore((s) => s.profile);
  const { match, loading, isExpired } = useMatch(userId);

  if (loading) {
    return (
      <Screen className="items-center justify-center">
        <BodyText>Lädt…</BodyText>
      </Screen>
    );
  }

  if (isExpired) {
    router.replace('/chat/expired');
    return null;
  }

  if (match) {
    const partnerPhoto =
      gender === 'female'
        ? match.male_profile?.photos[0]
        : match.female_profile?.photos[match.female_profile.primary_photo_idx ?? 0];
    const partnerName =
      gender === 'female'
        ? chatPartnerName(match.male_profile?.display_name, 'Pick')
        : chatPartnerName(
            match.female_display_name ?? match.female_profile?.display_name,
            'Anna',
          );

    return (
      <Screen className="px-5 pt-4 items-center justify-center">
        <Pressable
          onPress={() => router.push(`/chat/${match.id}`)}
          className="items-center w-full"
        >
          <View className="w-32 h-32 rounded-full overflow-hidden border-2 border-accent mb-4">
            <Image
              source={{ uri: partnerPhoto ?? 'https://i.pravatar.cc/400?img=32' }}
              className="w-full h-full"
            />
          </View>
          <TitleText className="mb-1">Dein Pick</TitleText>
          <BodyText className="text-center mb-6">{partnerName}</BodyText>
          <Button label="Chat öffnen" onPress={() => router.push(`/chat/${match.id}`)} />
        </Pressable>
      </Screen>
    );
  }

  if (gender === 'female') {
    return (
      <Screen className="px-5 pt-4 items-center justify-center flex-1">
        <View className="mb-6" style={{ width: 150, height: 150 }}>
          <ProfileFigureTwo size={150} />
        </View>
        <TitleText className="text-center mb-3 leading-tight">
          Jetzt einen{'\n'}Mann picken
        </TitleText>
        <BodyLarge className="text-center text-fg-3 max-w-[280px] mb-6 leading-7">
          Du hast aktuell keinen Pick. Schau, wer in deinem Radius aktiv ist, und wisch nach
          rechts.
        </BodyLarge>
        <Button label="Zum Schaufenster" onPress={() => router.push('/(tabs)')} />
      </Screen>
    );
  }

  return (
    <Screen className="px-5 pt-4 items-center justify-center flex-1">
      <View className="mb-6" style={{ width: 140, height: 154 }}>
        <ProfileFigureWait size={140} />
      </View>
      <TitleText className="text-center mb-3 leading-tight">
        Noch kein{'\n'}Pick
      </TitleText>
      <BodyLarge className="text-center text-fg-3 max-w-[280px] mb-8 leading-7">
        Bald wird eine Frau dich aussuchen. Halt dein Profil scharf und deine Verfügbarkeit
        aktuell.
      </BodyLarge>
      <MetaText className="text-center text-fg-4">
        Sichtbar für {DEMO_STATS.male_views} Frauen · {profile?.search_radius_km ?? 5} km
      </MetaText>
    </Screen>
  );
}
