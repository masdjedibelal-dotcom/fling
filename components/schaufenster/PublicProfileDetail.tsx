import { useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BodyText } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { ProfilePhotoViewer } from '@/components/schaufenster/ProfilePhotoViewer';
import { VerifiedBadge } from '@/components/graphics';
import { onlineStatus, tileStatusLabel } from '@/lib/profileStatus';
import type { ProfileStat } from '@/lib/partnerProfile';
import type { SchaufensterProfile } from '@/lib/types';

const { width: SW } = Dimensions.get('window');
const PHOTO_H = SW * 0.72;

function StatCard({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      className={`flex-1 items-center py-3 px-1 ${isLast ? '' : 'border-r border-line'}`}
    >
      <Text className="text-white text-[17px] font-bold tracking-tight text-center" numberOfLines={1}>
        {value || '—'}
      </Text>
      <Text className="text-fg-3 text-[10px] uppercase tracking-wider font-semibold mt-1">
        {label}
      </Text>
    </View>
  );
}

export function PublicProfileDetail({
  profile,
  stats,
  bottomInset = 24,
  footer,
}: {
  profile: SchaufensterProfile;
  stats: ProfileStat[];
  bottomInset?: number;
  footer?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [photoIdx, setPhotoIdx] = useState(0);
  const { dotColor } = onlineStatus(profile);
  const statusCompact = tileStatusLabel(profile);
  const displayName = profile.display_name ?? profile.job;

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + bottomInset }}
      >
        <ProfilePhotoViewer
          photos={profile.photos}
          photoIdx={photoIdx}
          onIndexChange={setPhotoIdx}
          height={PHOTO_H}
          topInset={insets.top}
          header={
            <View className="flex-row items-center gap-2.5">
              <BackButton />
              <View className="flex-row items-center gap-1.5 px-2 py-1 rounded-pill bg-black/45">
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: dotColor,
                  }}
                />
                <Text className="text-white text-[10px] font-semibold lowercase">
                  {statusCompact}
                </Text>
              </View>
            </View>
          }
          footer={
            <>
              <View
                pointerEvents="none"
                className="absolute left-0 right-0 bottom-0 h-28"
                style={{ backgroundColor: 'rgba(14,13,13,0.75)' }}
              />
              <View className="absolute bottom-4 left-4 right-16 z-10">
                <Text
                  className="text-white text-[26px] font-extrabold tracking-tight"
                  style={{
                    fontFamily: 'Unbounded_800ExtraBold',
                    textShadowColor: 'rgba(0,0,0,0.85)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 8,
                  }}
                >
                  {displayName}
                  <Text className="text-white/75 text-[22px] font-semibold"> {profile.age}</Text>
                </Text>
              </View>
            </>
          }
        />

        <View className="px-4 pt-4">
          <View className="flex-row flex-wrap gap-1.5 mb-4">
            {profile.interest_tags.map((tag) => (
              <View
                key={tag}
                className="px-2.5 py-1 rounded-pill bg-white/5 border border-line"
              >
                <Text className="text-white text-[11.5px] font-semibold">{tag}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row rounded-xl overflow-hidden bg-card/80 border border-white/10 mb-3">
            {stats.map((s, i) => (
              <StatCard
                key={s.label}
                label={s.label}
                value={s.value}
                isLast={i === stats.length - 1}
              />
            ))}
          </View>

          {profile.verified_at ? (
            <View className="mb-4 px-1">
              <VerifiedBadge size={22} />
            </View>
          ) : null}

          <BodyText className="text-fg-2 leading-6 mb-2">{profile.bio}</BodyText>
        </View>
      </ScrollView>
      {footer}
    </View>
  );
}
