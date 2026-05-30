import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BodyLarge, TitleText } from '@/components/ui/Typography';
import { ProfileFigureBack } from '@/components/graphics';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/stores/appStore';

export function AuswahlEmptyState() {
  const insets = useSafeAreaInsets();
  const setFilterSheetOpen = useAppStore((s) => s.setFilterSheetOpen);

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 }}
    >
      <View className="mb-5" style={{ width: 150, height: 138 }}>
        <ProfileFigureBack size={150} />
      </View>
      <TitleText className="text-center mb-3 leading-tight">
        Schaufenster{'\n'}wartet
      </TitleText>
      <BodyLarge className="text-center text-fg-3 max-w-[280px] mb-6 leading-7">
        Noch keine aktiven Männer in deinem Radius. Erweitere den Radius oder versuch&apos;s
        später.
      </BodyLarge>
      <Button
        label="Radius erweitern"
        className="max-w-[280px]"
        onPress={() => setFilterSheetOpen(true)}
      />
    </View>
  );
}
