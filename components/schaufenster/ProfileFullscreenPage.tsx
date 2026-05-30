import { useEffect, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeTopChrome } from '@/components/ui/SafeTopChrome';
import { Toast } from '@/components/ui/Toast';
import { TitleText } from '@/components/ui/Typography';
import { PickFab } from '@/components/schaufenster/PickFab';
import { PickCelebration } from '@/components/schaufenster/PickCelebration';
import { PickConfirmModal } from '@/components/schaufenster/PickConfirmModal';
import { PhotoIndexDots } from '@/components/schaufenster/PhotoIndexDots';
import { ProfileMetaPills } from '@/components/schaufenster/ProfileMetaPills';
import { BioPreview } from '@/components/schaufenster/BioPreview';
import { createMatch } from '@/lib/api';
import { onlineStatus } from '@/lib/profileStatus';
import { profilePseudonym } from '@/lib/profileDisplay';
import type { SchaufensterProfile } from '@/lib/types';
import { FLING_TYPE } from '@/lib/designTokens';
import { getChromeHeaderHeight } from '@/lib/safeAreaLayout';
import { router } from 'expo-router';

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

/** Vollbild-Profil wie Listenansicht — ein Bild, Meta + Bio darüber. */
export function ProfileFullscreenPage({
  profile,
  pageHeight,
  userId,
  showPick = true,
  topOverlay,
  hasFeedHeader = false,
}: {
  profile: SchaufensterProfile;
  pageHeight: number;
  userId?: string;
  showPick?: boolean;
  topOverlay?: ReactNode;
  hasFeedHeader?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [picking, setPicking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const photoFade = useSharedValue(1);
  const pseudonym = profilePseudonym(profile.pseudonym);
  const { dotColor } = onlineStatus(profile);
  const photo = profile.photos[photoIdx] ?? profile.photos[0];
  const count = profile.photos.length;
  const bottomInset = Math.max(insets.bottom, 12) + 8;
  const chromeTop = getChromeHeaderHeight(insets.top);
  const hasTopChrome = hasFeedHeader || Boolean(topOverlay);
  const gestureTop = hasTopChrome ? chromeTop : 0;
  const dotsTop = hasTopChrome ? chromeTop + 6 : insets.top + 12;

  const goPrev = () => setPhotoIdx((i) => Math.max(0, i - 1));
  const goNext = () => setPhotoIdx((i) => Math.min(count - 1, i + 1));

  useEffect(() => {
    photoFade.value = 0;
    photoFade.value = withTiming(1, { duration: 220 });
  }, [photoIdx, photoFade]);

  const photoFadeStyle = useAnimatedStyle(() => ({
    opacity: photoFade.value,
  }));

  const pan = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .onEnd((e) => {
      if (e.translationX < -36) goNext();
      else if (e.translationX > 36) goPrev();
    });

  const executePick = async () => {
    if (!userId || picking) return;
    setPicking(true);
    const { match, error } = await createMatch(userId, profile.id);
    setPicking(false);
    setCelebrationOpen(false);
    setConfirmOpen(false);
    if (error) {
      setToast(error);
      return;
    }
    if (match) router.replace(`/chat/${match.id}`);
  };

  return (
    <View style={{ height: pageHeight, width: '100%' }} className="bg-bg">
      <Toast message={toast} onHidden={() => setToast(null)} />

      <Animated.View style={[StyleSheet.absoluteFill, photoFadeStyle]}>
        <Image
          source={{ uri: photo }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top"
        />
      </Animated.View>

      {count > 1 ? (
        <GestureDetector gesture={pan}>
          <View
            style={{
              position: 'absolute',
              top: gestureTop,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </GestureDetector>
      ) : null}

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.42)', 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: chromeTop + 24,
        }}
      />

      <PhotoIndexDots count={count} activeIndex={photoIdx} top={dotsTop} />

      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(18,10,12,0.55)', 'rgba(18,10,12,0.95)']}
        locations={[0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      {topOverlay ? (
        <SafeTopChrome
          extendBackground="transparent"
          className="px-3"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 120,
            elevation: 120,
          }}
        >
          {topOverlay}
        </SafeTopChrome>
      ) : null}

      <View
        className="absolute left-0 right-0 px-4"
        style={{ bottom: bottomInset, paddingRight: showPick && userId ? 88 : 16 }}
        pointerEvents="box-none"
      >
        <View className="items-start gap-2.5">
          <View className="flex-row items-center gap-2.5 max-w-full">
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
          <ProfileMetaPills profile={profile} />
          <InterestTagPills tags={profile.interest_tags} />
          {profile.bio ? (
            <BioPreview bio={profile.bio} className="max-w-[95%] mt-1" blurBelow />
          ) : null}
        </View>

        {picking ? (
          <Text
            className="text-center text-fg-3 mt-3"
            style={{ fontSize: FLING_TYPE.caption2 }}
          >
            Verbindung wird hergestellt…
          </Text>
        ) : null}
      </View>

      {showPick && userId ? (
        <>
          <PickFab
            disabled={picking || celebrationOpen}
            bottomInset={bottomInset}
            onTap={() => setConfirmOpen(true)}
            onHoldComplete={() => setCelebrationOpen(true)}
          />
          <PickConfirmModal
            visible={confirmOpen}
            partnerName={pseudonym}
            onConfirm={() => void executePick()}
            onCancel={() => setConfirmOpen(false)}
          />
          <PickCelebration
            visible={celebrationOpen}
            partnerName={pseudonym}
            onFinished={() => void executePick()}
          />
        </>
      ) : null}
    </View>
  );
}
