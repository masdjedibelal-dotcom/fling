/** Web: kein Push ohne VAPID — No-Op damit die App nicht crasht */

export const pushSupported = false;

export async function registerForPushNotificationsAsync(
  _userId: string,
): Promise<string | null> {
  return null;
}

export { PUSH_COPY } from './marketingCopy';
