import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ProfileMediaSlide } from '@/components/schaufenster/ProfileMediaSlide';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppDimensions } from '@/hooks/useAppDimensions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeTopChrome } from '@/components/ui/SafeTopChrome';
import { Toast } from '@/components/ui/Toast';
import { TitleText } from '@/components/ui/Typography';
import { PickFab } from '@/components/schaufenster/PickFab';
import { PickCelebration } from '@/components/schaufenster/PickCelebration';
import { PickConfirmModal } from '@/components/schaufenster/PickConfirmModal';
import { PickReplaceModal } from '@/components/schaufenster/PickReplaceModal';
import { PhotoIndexDots } from '@/components/schaufenster/PhotoIndexDots';
import { ProfileMetaPills } from '@/components/schaufenster/ProfileMetaPills';
import { BioPreview } from '@/components/schaufenster/BioPreview';
import { createMatch, replaceMatch } from '@/lib/api';
import { useMatch } from '@/hooks/useMatch';
import { onlineStatus } from '@/lib/profileStatus';
import { profilePseudonym } from '@/lib/profileDisplay';
import type { SchaufensterProfile } from '@/lib/types';
import { FLING_TYPE } from '@/lib/designTokens';
import { getPickFabInsets } from '@/lib/pickFabLayout';
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
  onPickTouchActive,
}: {
  profile: SchaufensterProfile;
  pageHeight: number;
  userId?: string;
  showPick?: boolean;
  topOverlay?: ReactNode;
  hasFeedHeader?: boolean;
  onPickTouchActive?: (active: boolean) => void;
}) {
  const insets = useSafeAreaInsets();
  const { width } = useAppDimensions();
  const [photoIdx, setPhotoIdx] = useState(0);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [picking, setPicking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { match: activeMatch, loading: matchLoading, reload: reloadActiveMatch } = useMatch(
    showPick && userId ? userId : null,
  );
  const photoFade = useSharedValue(1);
  const pseudonym = profilePseudonym(profile.pseudonym);
  const { dotColor } = onlineStatus(profile);
  const photo = profile.photos[photoIdx] ?? profile.photos[0];
  const count = profile.photos.length;
  const {
    bottom: bottomInset,
    reserveBottom: pickReserveBottom,
    reserveRight: pickReserveRight,
    photoTapBottom,
  } = getPickFabInsets(insets.bottom);
  const chromeTop = getChromeHeaderHeight(insets.top);
  const hasTopChrome = hasFeedHeader || Boolean(topOverlay);
  const gestureTop = hasTopChrome ? chromeTop : 0;
  const dotsTop = hasTopChrome ? chromeTop + 6 : insets.top + 12;

  const goPrev = useCallback(
    () => setPhotoIdx((i) => Math.max(0, i - 1)),
    [],
  );
  const goNext = useCallback(
    () => setPhotoIdx((i) => Math.min(count - 1, i + 1)),
    [count],
  );

  useEffect(() => {
    setPhotoIdx(0);
    setBioExpanded(false);
  }, [profile.id]);

  useEffect(() => {
    photoFade.value = 0;
    photoFade.value = withTiming(1, { duration: 220 });
  }, [photoIdx, photoFade]);

  const photoFadeStyle = useAnimatedStyle(() => ({
    opacity: photoFade.value,
  }));

  const pan = Gesture.Pan()
    .activeOffsetX([-16, 16])
    .failOffsetY([-28, 28])
    .onEnd((e) => {
      if (e.translationX < -36) runOnJS(goNext)();
      else if (e.translationX > 36) runOnJS(goPrev)();
    });

  const executePick = async (replaceExisting = false) => {
    if (!userId || picking) return;
    setPicking(true);

    let result;
    if (
      replaceExisting &&
      activeMatch &&
      activeMatch.male_id !== profile.id
    ) {
      result = await replaceMatch(userId, profile.id, activeMatch.id);
    } else {
      result = await createMatch(userId, profile.id);
    }

    setPicking(false);
    setCelebrationOpen(false);
    setConfirmOpen(false);
    setReplaceOpen(false);

    const { match, error } = result;
    if (error) {
      if (
        error.includes('aktiver Pick') ||
        error.includes('Bereits ein aktiver Pick')
      ) {
        await reloadActiveMatch();
        setReplaceOpen(true);
        return;
      }
      setToast(error);
      return;
    }

    await reloadActiveMatch();
    if (match) router.replace(`/chat/${match.id}`);
  };

  const currentPickName = profilePseudonym(activeMatch?.male_profile?.pseudonym);

  const handleReplaceCancel = () => {
    setReplaceOpen(false);
    void reloadActiveMatch();
  };

  const openPickFlow = () => {
    if (matchLoading) return;
    if (activeMatch) {
      if (activeMatch.male_id === profile.id) {
        router.replace(`/chat/${activeMatch.id}`);
        return;
      }
      setReplaceOpen(true);
      return;
    }
    setConfirmOpen(true);
  };

  const openCelebrationOrReplace = () => {
    if (matchLoading) return;
    if (activeMatch) {
      if (activeMatch.male_id === profile.id) {
        router.replace(`/chat/${activeMatch.id}`);
        return;
      }
      setReplaceOpen(true);
      return;
    }
    setCelebrationOpen(true);
  };

  return (
    <View style={{ height: pageHeight, width: '100%' }} className="bg-bg">
      <Toast message={toast} onHidden={() => setToast(null)} />

      <Animated.View style={[StyleSheet.absoluteFill, photoFadeStyle]}>
        <ProfileMediaSlide uri={photo} isActive />
      </Animated.View>

      {bioExpanded ? (
        <Pressable
          onPress={() => setBioExpanded(false)}
          accessibilityLabel="Bio einklappen"
          style={[StyleSheet.absoluteFill, { zIndex: 35, elevation: 35 }]}
        />
      ) : null}

      {count > 1 ? (
        <GestureDetector gesture={pan}>
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: gestureTop,
              left: 0,
              right: pickReserveRight,
              bottom: photoTapBottom,
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
        style={{
          bottom: bottomInset,
          paddingRight: showPick && userId ? 88 : 16,
          zIndex: 45,
          elevation: 45,
        }}
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
            <BioPreview
              bio={profile.bio}
              className="max-w-[95%] mt-1"
              expanded={bioExpanded}
              onExpandedChange={setBioExpanded}
            />
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

      {count > 1 ? (
        <>
          <Pressable
            onPress={goPrev}
            disabled={photoIdx === 0}
            accessibilityLabel="Vorheriges Foto"
            style={{
              position: 'absolute',
              top: gestureTop,
              left: 0,
              bottom: photoTapBottom,
              width: width * 0.28,
              zIndex: 30,
              elevation: 30,
              opacity: photoIdx === 0 ? 0.3 : 1,
            }}
          />
          <Pressable
            onPress={goNext}
            disabled={photoIdx >= count - 1}
            accessibilityLabel="Nächstes Foto"
            style={{
              position: 'absolute',
              top: gestureTop,
              right: 0,
              bottom: photoTapBottom,
              width: width * 0.28,
              zIndex: 30,
              elevation: 30,
              opacity: photoIdx >= count - 1 ? 0.3 : 1,
            }}
          />
        </>
      ) : null}

      {showPick && userId ? (
        <>
          <PickFab
            disabled={picking || celebrationOpen || matchLoading}
            bottomInset={bottomInset}
            onTap={openPickFlow}
            onHoldComplete={openCelebrationOrReplace}
            onTouchActive={onPickTouchActive}
          />
          <PickConfirmModal
            visible={confirmOpen}
            partnerName={pseudonym}
            onConfirm={() => void executePick(false)}
            onCancel={() => setConfirmOpen(false)}
          />
          <PickReplaceModal
            visible={replaceOpen}
            currentPartnerName={currentPickName}
            newPartnerName={pseudonym}
            onConfirm={() => void executePick(true)}
            onCancel={handleReplaceCancel}
          />
          <PickCelebration
            visible={celebrationOpen}
            partnerName={pseudonym}
            onFinished={() => void executePick(false)}
          />
        </>
      ) : null}
    </View>
  );
}
