import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DisplayText, BodyText } from '@/components/ui/Typography';
import { EmptyWaitingGraphic } from '@/components/graphics';
import { AUSWAHL_MAX_RADIUS_KM, AUSWAHL_MAX_PROFILES } from '@/lib/constants';

export function AuswahlEmptyState() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 }}
    >
      <View className="mb-5">
        <EmptyWaitingGraphic size={160} />
      </View>
      <DisplayText className="text-2xl text-center mb-3">
        Gerade niemand in der Nähe
      </DisplayText>
      <BodyText className="text-fg-3 text-center leading-6 mb-2">
        In deinem Umkreis von {AUSWAHL_MAX_RADIUS_KM} km ist momentan niemand online
        oder kürzlich aktiv.
      </BodyText>
      <BodyText className="text-fg-4 text-center text-[13px] leading-5">
        Schau später nochmal vorbei — wir zeigen dir dann wieder bis zu{' '}
        {AUSWAHL_MAX_PROFILES} aktive Profile in deiner Nähe.
      </BodyText>
    </View>
  );
}
