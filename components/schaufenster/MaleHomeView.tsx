import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { CaptionText, MetaText, TitleText } from '@/components/ui/Typography';
import { FLING_COLORS, FLING_TYPE } from '@/lib/designTokens';
import { ProfileFigureWait } from '@/components/graphics';
import { useAuthStore } from '@/stores/authStore';
import { DEMO_STATS } from '@/lib/demo';
import type { Match } from '@/lib/types';

export function MaleHomeView({ match }: { match: Match | null }) {
  const profile = useAuthStore((s) => s.profile);
  const availability = profile?.availability ?? 'now';
  const availabilityLabel =
    availability === 'now' ? 'Jetzt' : availability === 'today' ? 'Heute' : 'Pause';
  const photo = profile?.photos?.[profile.primary_photo_idx] ?? 'https://i.pravatar.cc/400?img=32';

  return (
    <ScrollView className="flex-1 px-5" contentContainerClassName="pb-8">
      {match ? (
        <Pressable
          onPress={() => router.push(`/chat/${match.id}`)}
          className="mt-4 p-4 rounded-xl border border-accent/30"
          style={{ backgroundColor: 'rgba(225,21,57,0.1)' }}
        >
          <Text
            className="text-accent font-semibold"
            style={{ fontSize: FLING_TYPE.subhead }}
          >
            Du wurdest ausgewählt · Chat öffnen ›
          </Text>
        </Pressable>
      ) : (
        <View className="items-center mt-6 mb-2" style={{ height: 120 }}>
          <ProfileFigureWait size={110} animate />
        </View>
      )}

      <TitleText className="text-center mt-4 mb-1">So siehst du aus</TitleText>
      <CaptionText className="text-center text-fg-3 mb-5">
        Diskret sichtbar — nur für Frauen in deinem Radius
      </CaptionText>

      <View className="items-center mb-5">
        <View
          className="w-[200px] aspect-[5/6] overflow-hidden border border-line"
          style={{ borderRadius: 12, backgroundColor: FLING_COLORS.card }}
        >
          <Image source={{ uri: photo }} className="w-full h-full" contentFit="cover" />
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: 'transparent',
            }}
          />
          <View
            className="absolute inset-0"
            style={{
              backgroundColor: FLING_COLORS.tileGlow,
              opacity: 0.35,
            }}
          />
          <View
            className="absolute left-0 right-0 bottom-0 h-1/2"
            style={{ backgroundColor: FLING_COLORS.tileScrim }}
          />
        </View>
      </View>

      <MetaText className="text-center mb-6 normal-case text-fg-4">
        Verfügbarkeit: {availabilityLabel} · {profile?.search_radius_km ?? 5} km
      </MetaText>

      <View className="gap-2">
        {[
          `Sichtbar für ${DEMO_STATS.male_views} Frauen`,
          `Radius ${profile?.search_radius_km ?? 5} km`,
          'Verifiziert',
        ].map((line) => (
          <View
            key={line}
            className="py-3 px-4 rounded-xl border border-line"
            style={{ backgroundColor: FLING_COLORS.card }}
          >
            <CaptionText className="text-fg-2 text-center font-semibold">
              {line}
            </CaptionText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
