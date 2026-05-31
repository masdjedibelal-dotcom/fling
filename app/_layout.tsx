import '../global.css';
import { useEffect } from 'react';

// NativeWind Web: immer Dark Mode (Design-System)
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
}
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Fraunces_400Regular_Italic } from '@expo-google-fonts/fraunces';
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
import { MobilePreviewFrame } from '@/components/app/MobilePreviewFrame';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { FLING_COLORS } from '@/lib/designTokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Fraunces_400Regular_Italic,
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
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: FLING_COLORS.bg }}
    >
      <SafeAreaProvider>
      <MobilePreviewFrame>
        <AppGuards>
          <OfflineBanner />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#120A0C' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="schaufenster/[id]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="partner/[matchId]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="chat/[matchId]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen name="chat/expired" />
            <Stack.Screen name="profile/edit" />
            <Stack.Screen name="profile/photos" />
            <Stack.Screen name="profile/settings/notifications" />
            <Stack.Screen name="profile/settings/account" />
          </Stack>
        </AppGuards>
      </MobilePreviewFrame>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
