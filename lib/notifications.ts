import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { updateUserProfile } from './api';
import { isSupabaseConfigured } from './supabase';
import { PUSH_COPY } from './marketingCopy';

export { PUSH_COPY };

export const pushSupported = true;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(
  userId: string,
): Promise<string | null> {
  if (!userId) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Fling',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  try {
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      })
    ).data;

    if (isSupabaseConfigured) {
      await updateUserProfile(userId, { push_token: token });
    }
    return token;
  } catch {
    return null;
  }
}
