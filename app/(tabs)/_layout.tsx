import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { ensureDemoSession } from '@/lib/demoMode';
import { FlingTabBar } from '@/components/navigation/FlingTabBar';
import { FLING_COLORS } from '@/lib/designTokens';

export default function TabsLayout() {
  useEffect(() => {
    ensureDemoSession();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: FLING_COLORS.bg }}>
      <Tabs
        tabBar={(props) => <FlingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Auswahl' }} />
        <Tabs.Screen name="pick" options={{ title: 'Pick' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
      </Tabs>
    </View>
  );
}
