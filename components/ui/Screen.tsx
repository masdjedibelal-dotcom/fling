import { ReactNode } from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PatternBackground } from '@/components/ui/PatternBackground';

interface ScreenProps extends ViewProps {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Dezentes Punkt-Muster im Hintergrund (Standard: an) */
  pattern?: boolean;
}

export function Screen({
  children,
  className,
  edges = ['top', 'bottom'],
  pattern = true,
  ...props
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      className="flex-1"
      style={{ backgroundColor: '#120A0C' }}
    >
      <StatusBar style="light" />
      {pattern ? <PatternBackground /> : null}
      <View
        className={`flex-1 ${className ?? ''}`}
        style={[
          { backgroundColor: 'transparent' },
          Platform.OS === 'web' ? { position: 'relative' as const } : null,
        ]}
        {...props}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
