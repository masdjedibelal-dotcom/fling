import { Redirect } from 'expo-router';

/** Safe Pick entfernt — alte Route leitet zum Profil um. */
export default function TeamSafePicksRemoved() {
  return <Redirect href="/(tabs)/profile" />;
}
