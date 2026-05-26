import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { DisplayText, BodyText, MetaText } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/authStore';
import { useMatch } from '@/hooks/useMatch';
import { DEMO_STATS } from '@/lib/demo';
import { AUSWAHL_SUBLINE } from '@/lib/auswahlCopy';
import { Image } from 'expo-image';
import { EmptyWaitingGraphic, EmptyManWaitingGraphic } from '@/components/graphics';

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
        ? match.male_profile?.display_name ?? match.male_profile?.job ?? 'Pick'
        : match.female_profile?.display_name ?? match.female_display_name ?? 'Anna';

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
          <DisplayText className="text-xl mb-1">Dein Pick</DisplayText>
          <BodyText className="text-center mb-6">{partnerName}</BodyText>
          <Button label="Chat öffnen" onPress={() => router.push(`/chat/${match.id}`)} />
        </Pressable>
      </Screen>
    );
  }

  if (gender === 'female') {
    return (
      <Screen className="px-5 pt-4 items-center justify-center">
        <View className="mb-6">
          <EmptyWaitingGraphic size={150} />
        </View>
        <MetaText className="mb-4">
          {DEMO_STATS.nearby_active} Männer in der Nähe
        </MetaText>
        <DisplayText className="text-xl text-center mb-2">
          Noch kein aktiver Chat.
        </DisplayText>
        <BodyText className="text-center text-fg-3 mb-6">
          {AUSWAHL_SUBLINE}
        </BodyText>
        <Button
          label="Zur Auswahl"
          className="mt-2"
          onPress={() => router.push('/(tabs)')}
        />
      </Screen>
    );
  }

  return (
    <Screen className="px-5 pt-4 items-center justify-center flex-1">
      <View className="mb-6">
        <EmptyManWaitingGraphic size={150} />
      </View>
      <DisplayText className="text-xl text-center mb-2">Noch keine Auswahl</DisplayText>
      <BodyText className="text-center mb-8">
        Du bist sichtbar — sobald dich jemand auswählt, startet hier der Chat.
      </BodyText>
      <MetaText className="text-center absolute bottom-24">
        Sichtbar für {DEMO_STATS.male_views} Frauen · {profile?.search_radius_km ?? 5} km
      </MetaText>
    </Screen>
  );
}
