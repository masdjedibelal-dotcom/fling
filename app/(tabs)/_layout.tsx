import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { ensureDemoSession } from '@/lib/demoMode';
import { FlingTabBar } from '@/components/navigation/FlingTabBar';

export default function TabsLayout() {
  useEffect(() => {
    ensureDemoSession();
  }, []);

  return (
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
  );
}
