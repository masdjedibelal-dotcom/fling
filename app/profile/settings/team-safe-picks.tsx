import { useCallback, useState } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { BackButton } from '@/components/ui/BackButton';
import { DisplayText, BodyText, MetaText } from '@/components/ui/Typography';
import { fetchAllSafePicksForTeam, formatSafePickMeetTime } from '@/lib/safePick';
import type { SafePickSession } from '@/lib/types';
import { useFocusEffect } from 'expo-router';

function statusLabel(s: SafePickSession): string {
  if (s.status === 'completed') {
    return s.follow_up_rating === 'bad' ? 'Schlecht · beantwortet' : 'Gut · beantwortet';
  }
  if (s.status === 'cancelled') return 'Abgebrochen';
  const due = new Date(s.check_in_at).getTime() <= Date.now();
  return due ? 'Nachfrage fällig' : 'Aktiv';
}

export default function TeamSafePicksScreen() {
  const [items, setItems] = useState<SafePickSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const list = await fetchAllSafePicksForTeam();
    setItems(list);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <Screen edges={['top', 'bottom']} className="flex-1">
      <View className="flex-row items-center px-4 pt-2 pb-4 gap-3">
        <BackButton />
        <DisplayText className="text-lg flex-1">Safe Pick · Team</DisplayText>
      </View>
      <BodyText className="px-5 text-fg-3 mb-4 leading-5">
        Interne Übersicht — nichts wird weitergegeben. In Produktion nur mit Admin-Zugang.
      </BodyText>

      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D11537" />
        }
      >
        {items.length === 0 ? (
          <BodyText className="text-fg-4 text-center py-12">Noch keine Safe Picks</BodyText>
        ) : (
          items.map((s) => (
            <View
              key={s.id}
              className="mb-3 p-4 rounded-2xl bg-white/5 border border-line"
            >
              <View className="flex-row justify-between items-start mb-2">
                <MetaText className="text-accent normal-case">{statusLabel(s)}</MetaText>
                <Text className="font-mono text-fg-4 text-[10px]">
                  {s.match_id.slice(0, 12)}…
                </Text>
              </View>
              <BodyText className="text-white font-semibold mb-1">
                {formatSafePickMeetTime(s.meet_at)}
              </BodyText>
              <BodyText className="text-fg-2 mb-1">{s.area_text}</BodyText>
              {s.context_note ? (
                <BodyText className="text-fg-3 text-[13px] mb-2">{s.context_note}</BodyText>
              ) : null}
              <MetaText className="text-fg-4 normal-case">
                Nachfrage: {formatSafePickMeetTime(s.check_in_at)}
              </MetaText>
              {s.follow_up_note ? (
                <BodyText className="text-fg-2 mt-2 italic">„{s.follow_up_note}“</BodyText>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
