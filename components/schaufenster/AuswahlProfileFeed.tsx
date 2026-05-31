import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { RefreshControl, View, type ListRenderItem } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeTopChrome } from '@/components/ui/SafeTopChrome';
import { ProfileFullscreenPage } from '@/components/schaufenster/ProfileFullscreenPage';
import { FLING_COLORS } from '@/lib/designTokens';
import { triggerHaptic } from '@/lib/haptics';
import type { SchaufensterProfile } from '@/lib/types';

type Props = {
  profiles: SchaufensterProfile[];
  userId: string;
  initialIndex?: number;
  showPick?: boolean;
  scrollEnabled?: boolean;
  /** Fixiert über dem Feed (z. B. Zurück) */
  fixedTopOverlay?: ReactNode;
  /** Feed-Tab: AuswahlHeader schwebt über dem Foto */
  hasFeedHeader?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onInitialScrollDone?: () => void;
};

/** Vertikaler Feed — eine Seite pro Profil (TikTok / Listenansicht). */
export function AuswahlProfileFeed({
  profiles,
  userId,
  initialIndex = 0,
  showPick = true,
  scrollEnabled = true,
  fixedTopOverlay,
  hasFeedHeader = false,
  onRefresh,
  refreshing = false,
  onInitialScrollDone,
}: Props) {
  const [pageHeight, setPageHeight] = useState(0);
  const [pickTouchActive, setPickTouchActive] = useState(false);
  const listRef = useRef<FlatList<SchaufensterProfile>>(null);
  const didScrollToInitial = useRef(false);

  const safeInitial = Math.min(
    Math.max(0, initialIndex),
    Math.max(0, profiles.length - 1),
  );

  useEffect(() => {
    if (pageHeight <= 0 || didScrollToInitial.current || profiles.length === 0) {
      return;
    }
    if (safeInitial > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({
          index: safeInitial,
          animated: false,
        });
      });
    }
    didScrollToInitial.current = true;
    onInitialScrollDone?.();
  }, [pageHeight, safeInitial, profiles.length, onInitialScrollDone]);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: pageHeight,
      offset: pageHeight * index,
      index,
    }),
    [pageHeight],
  );

  const renderItem: ListRenderItem<SchaufensterProfile> = useCallback(
    ({ item }) => (
      <ProfileFullscreenPage
        profile={item}
        pageHeight={pageHeight}
        userId={userId}
        showPick={showPick}
        hasFeedHeader={hasFeedHeader}
        onPickTouchActive={setPickTouchActive}
      />
    ),
    [pageHeight, userId, showPick, hasFeedHeader],
  );

  return (
    <View
      className="flex-1"
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && h !== pageHeight) setPageHeight(h);
      }}
    >
      {pageHeight > 0 && profiles.length > 0 ? (
        <FlatList
          ref={listRef}
          data={profiles}
          keyExtractor={(p) => p.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={pageHeight}
          snapToAlignment="start"
          disableIntervalMomentum
          getItemLayout={getItemLayout}
          scrollEnabled={scrollEnabled && !pickTouchActive}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  triggerHaptic('light');
                  onRefresh();
                }}
                tintColor={FLING_COLORS.accent}
                colors={[FLING_COLORS.accent]}
              />
            ) : undefined
          }
          removeClippedSubviews
          windowSize={3}
          initialNumToRender={Math.min(2, profiles.length)}
          maxToRenderPerBatch={2}
          initialScrollIndex={
            safeInitial > 0 && safeInitial < profiles.length ? safeInitial : undefined
          }
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
              });
            }, 80);
          }}
        />
      ) : null}

      {fixedTopOverlay ? (
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
          {fixedTopOverlay}
        </SafeTopChrome>
      ) : null}
    </View>
  );
}
