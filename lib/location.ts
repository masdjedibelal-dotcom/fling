import * as Location from 'expo-location';

export async function detectCurrentCity(): Promise<{
  city: string;
  latitude: number;
  longitude: number;
} | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const places = await Location.reverseGeocodeAsync({
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  });
  const place = places[0];
  const city =
    place?.city ?? place?.subregion ?? place?.region ?? 'Aktueller Standort';

  return {
    city,
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  };
}
