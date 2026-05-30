import { createContext, useContext, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { MOBILE_PREVIEW_MAX_WIDTH } from '@/lib/appLayout';
import { FLING_COLORS } from '@/lib/designTokens';

type LayoutSize = { width: number; height: number };

const AppLayoutContext = createContext<LayoutSize | null>(null);

export function AppLayoutProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<LayoutSize>({
    width: MOBILE_PREVIEW_MAX_WIDTH,
    height: 844,
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) setSize({ width, height });
  };

  return (
    <AppLayoutContext.Provider value={size}>
      <View
        onLayout={onLayout}
        style={{
          flex: 1,
          width: MOBILE_PREVIEW_MAX_WIDTH,
          maxWidth: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: FLING_COLORS.bg,
        }}
      >
        {children}
      </View>
    </AppLayoutContext.Provider>
  );
}

export function useAppLayoutSize() {
  return useContext(AppLayoutContext);
}
