import '../global.css';
import { useEffect } from 'react';

// NativeWind Web: immer Dark Mode (Design-System)
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import {
  Unbounded_700Bold,
  Unbounded_800ExtraBold,
} from '@expo-google-fonts/unbounded';
import {
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { AppGuards } from '@/components/app/AppGuards';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Unbounded_700Bold,
    Unbounded_800ExtraBold,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppGuards>
        <OfflineBanner />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0E0D0D' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="schaufenster/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="partner/[matchId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="chat/[matchId]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="chat/expired" />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="profile/photos" />
          <Stack.Screen name="profile/settings/notifications" />
          <Stack.Screen name="profile/settings/account" />
          <Stack.Screen name="profile/settings/team-safe-picks" />
        </Stack>
      </AppGuards>
    </GestureHandlerRootView>
  );
}
