import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BodyLarge, TitleText } from '@/components/ui/Typography';
import { ProfileFigureBack } from '@/components/graphics';
import { Button } from '@/components/ui/Button';
import { AUSWAHL_EMPTY_BODY, AUSWAHL_EMPTY_TITLE } from '@/lib/marketingCopy';
import { RadiusSheet } from '@/components/schaufenster/RadiusSheet';
import { AuswahlHeader } from '@/components/schaufenster/AuswahlHeader';
import { useAppStore } from '@/stores/appStore';

export function AuswahlEmptyState() {
  const insets = useSafeAreaInsets();
  const setRadiusSheetOpen = useAppStore((s) => s.setRadiusSheetOpen);
  const radiusSheetOpen = useAppStore((s) => s.radiusSheetOpen);
  const viewMode = useAppStore((s) => s.auswahlViewMode);
  const toggleAuswahlViewMode = useAppStore((s) => s.toggleAuswahlViewMode);

  return (
    <View className="flex-1">
      <AuswahlHeader
        activeCount={0}
        viewMode={viewMode}
        onNearbyPress={() => setRadiusSheetOpen(!radiusSheetOpen)}
        onViewModePress={toggleAuswahlViewMode}
      />
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ paddingBottom: insets.bottom + 40 }}
    >
      <View className="mb-5" style={{ width: 150, height: 138 }}>
        <ProfileFigureBack size={150} />
      </View>
      <TitleText className="text-center mb-3 leading-tight">
        {AUSWAHL_EMPTY_TITLE}
      </TitleText>
      <BodyLarge className="text-center text-fg-3 max-w-[280px] mb-6 leading-7">
        {AUSWAHL_EMPTY_BODY}
      </BodyLarge>
      <Button
        label="Radius ändern"
        className="max-w-[280px]"
        onPress={() => setRadiusSheetOpen(true)}
      />
    </View>
      <RadiusSheet
        visible={radiusSheetOpen}
        onClose={() => setRadiusSheetOpen(false)}
      />
    </View>
  );
}
