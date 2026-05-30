import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BodyText, TitleText } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { ProfilePhotoViewer } from '@/components/schaufenster/ProfilePhotoViewer';
import { ProfileMetaPills } from '@/components/schaufenster/ProfileMetaPills';
import { onlineStatus } from '@/lib/profileStatus';
import type { SchaufensterProfile } from '@/lib/types';
import { FLING_TYPE } from '@/lib/designTokens';
import { profilePseudonym } from '@/lib/profileDisplay';

/** Hero bis kurz vor Bio — inkl. Verlängerung unter die Statusleiste */
function profilePhotoHeight(screenHeight: number, topInset: number) {
  const body = Math.round(screenHeight * 0.86);
  return body + topInset;
}

function InterestTagPills({ tags }: { tags: string[] }) {
  if (!tags.length) return null;

  return (
    <View className="flex-row flex-wrap gap-2 self-start max-w-[92%]">
      {tags.map((tag) => (
        <View
          key={tag}
          className="rounded-pill"
          style={{
            backgroundColor: 'rgba(0,0,0,0.55)',
            paddingHorizontal: 14,
            paddingVertical: 9,
          }}
        >
          <Text
            className="text-white font-semibold tracking-tight"
            style={{ fontSize: FLING_TYPE.subhead }}
          >
            {tag}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Foto edge-to-edge — Meta links über dem Bild, Bio direkt darunter */
export function PublicProfileDetail({
  profile,
  footer,
}: {
  profile: SchaufensterProfile;
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useAppDimensions();
  const photoHeight = profilePhotoHeight(screenHeight, insets.top);
  const [photoIdx, setPhotoIdx] = useState(0);
  const pseudonym = profilePseudonym(profile.pseudonym);
  const { dotColor } = onlineStatus(profile);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: footer ? 0 : insets.bottom + 24,
        }}
      >
        <ProfilePhotoViewer
          photos={profile.photos}
          photoIdx={photoIdx}
          onIndexChange={setPhotoIdx}
          height={photoHeight}
          topInset={insets.top}
          header={<BackButton />}
          overlay={
            <>
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', 'rgba(18,10,12,0.5)', 'rgba(18,10,12,0.92)']}
                locations={[0, 0.45, 1]}
                style={{ height: 220 }}
              />
              <View className="absolute bottom-0 left-0 right-0 px-4 pb-5 items-start gap-2.5">
                <View className="flex-row items-center gap-2.5 self-start max-w-full">
                  <TitleText className="text-[22px] leading-tight tracking-tight text-left flex-shrink">
                    {pseudonym}
                  </TitleText>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: dotColor,
                      borderWidth: dotColor === '#0d0d0d' ? 1 : 0,
                      borderColor: 'rgba(255,255,255,0.2)',
                    }}
                  />
                </View>
                <ProfileMetaPills distanceKm={profile.distance_km} />
                <InterestTagPills tags={profile.interest_tags} />
              </View>
            </>
          }
        />

        {profile.bio ? (
          <View className="px-4 pt-5">
            <BodyText className="text-fg-2 leading-[22px]">
              {profile.bio}
            </BodyText>
          </View>
        ) : null}

        {footer ? (
          <View
            className="px-4 items-center"
            style={{
              marginTop: profile.bio ? 20 : 16,
              paddingTop: 20,
              paddingBottom: Math.max(insets.bottom, 16),
            }}
          >
            {footer}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
