import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BodyText, MetaText } from '@/components/ui/Typography';
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
          className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-xl"
        >
          <Text className="text-accent font-semibold text-sm">
            Du wurdest ausgewählt · öffnen ›
          </Text>
        </Pressable>
      ) : null}

      <BodyText className="text-center mt-6 mb-4 text-fg-3">
        So sehen dich Frauen
      </BodyText>

      <View className="items-center mb-5">
        <View
          className="w-[200px] aspect-[5/6] overflow-hidden bg-surface"
          style={{ borderRadius: 12 }}
        >
          <Image source={{ uri: photo }} className="w-full h-full" contentFit="cover" />
          <View className="absolute inset-0 bg-black/40" style={{ top: '50%' }} />
        </View>
      </View>

      <MetaText className="text-center mb-6 normal-case text-fg-4 text-[11px]">
        Verfügbarkeit: {availabilityLabel} · Radius {profile?.search_radius_km ?? 5} km
        {'\n'}Im Profil bearbeiten
      </MetaText>

      <View className="gap-2">
        {[
          `Sichtbar für ${DEMO_STATS.male_views} Frauen`,
          `Radius ${profile?.search_radius_km ?? 5} km`,
          'Verifizierung ✓',
        ].map((line) => (
          <View
            key={line}
            className="py-3 px-4 bg-card/80 border border-white/10 rounded-xl"
          >
            <BodyText className="text-fg-2 text-center text-[13px] font-semibold">{line}</BodyText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
