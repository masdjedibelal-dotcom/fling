import { ProfileFullscreenPage } from '@/components/schaufenster/ProfileFullscreenPage';
import type { SchaufensterProfile } from '@/lib/types';

/** Ein Profil — volle Seite, vertikal wie TikTok. */
export function AuswahlFeedPage({
  profile,
  pageHeight,
  userId,
}: {
  profile: SchaufensterProfile;
  pageHeight: number;
  userId: string;
}) {
  return (
    <ProfileFullscreenPage
      profile={profile}
      pageHeight={pageHeight}
      userId={userId}
      showPick
    />
  );
}
