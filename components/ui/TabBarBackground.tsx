import { colors } from '@/constants/Design';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';

// This is a shim for web and Android where the tab bar is generally opaque.

export function useBottomTabOverflow() {
  return 0;
}

export default function TabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={100}
        tint="light"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.white,
      }}
    />
  );
}
