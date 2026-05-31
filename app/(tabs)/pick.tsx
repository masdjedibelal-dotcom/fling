import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { Button } from '@/components/ui/Button';
import { BodyText, BodyLarge, MetaText, TitleText } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/authStore';
import { useMatch } from '@/hooks/useMatch';
import { DEMO_STATS } from '@/lib/demo';
import {
  formatChatPartnerMeta,
  profilePseudonym,
} from '@/lib/profileDisplay';
import {
  PICK_AFTER_FEMALE,
  PICK_AFTER_MALE,
  PICK_TAB_EMPTY_FEMALE,
  PICK_TAB_EMPTY_MALE,
} from '@/lib/marketingCopy';
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
    const partnerProfile =
      gender === 'female' ? match.male_profile : match.female_profile;
    const partnerPhoto =
      gender === 'female'
        ? match.male_profile?.photos[0]
        : match.female_profile?.photos[match.female_profile.primary_photo_idx ?? 0];
    const partnerPseudonym =
      gender === 'female'
        ? profilePseudonym(match.male_profile?.pseudonym, 'Pick')
        : profilePseudonym(
            match.female_profile?.pseudonym ?? match.female_display_name,
            'Anna',
          );
    const metaLine = partnerProfile
      ? formatChatPartnerMeta(
          partnerProfile,
          gender === 'female' ? undefined : { city: match.female_city },
        )
      : '—';
    const afterCopy = gender === 'female' ? PICK_AFTER_FEMALE : PICK_AFTER_MALE;

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
              contentFit="cover"
            />
          </View>
          <TitleText className="mb-2 text-center">{afterCopy.title}</TitleText>
          <BodyText className="text-center mb-1">{partnerPseudonym}</BodyText>
          <MetaText className="text-center text-fg-3 mb-2">{metaLine}</MetaText>
          <BodyLarge className="text-center text-fg-3 mb-6 leading-7 max-w-[300px]">
            {afterCopy.body}
          </BodyLarge>
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
          {PICK_TAB_EMPTY_FEMALE.title}
        </TitleText>
        <BodyLarge className="text-center text-fg-3 max-w-[280px] mb-6 leading-7">
          {PICK_TAB_EMPTY_FEMALE.body}
        </BodyLarge>
        <Button
          label={PICK_TAB_EMPTY_FEMALE.cta}
          onPress={() => router.push('/(tabs)')}
        />
      </Screen>
    );
  }

  return (
    <Screen className="px-5 pt-4 items-center justify-center flex-1">
      <View className="mb-6" style={{ width: 140, height: 154 }}>
        <ProfileFigureWait size={140} />
      </View>
      <TitleText className="text-center mb-3 leading-tight">
        {PICK_TAB_EMPTY_MALE.title}
      </TitleText>
      <BodyLarge className="text-center text-fg-3 max-w-[280px] mb-8 leading-7">
        {PICK_TAB_EMPTY_MALE.body}
      </BodyLarge>
      <MetaText className="text-center text-fg-4">
        Sichtbar für {DEMO_STATS.male_views} Frauen · {profile?.search_radius_km ?? 5} km
      </MetaText>
    </Screen>
  );
}
