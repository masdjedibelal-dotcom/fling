import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { FLING_TYPE } from '@/lib/designTokens';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsub();
  }, []);

  if (!offline) return null;

  return (
    <View className="bg-accent py-2 px-4 items-center">
      <Text
        className="text-white font-semibold"
        style={{ fontSize: FLING_TYPE.caption }}
      >
        Keine Verbindung
      </Text>
    </View>
  );
}
