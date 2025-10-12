import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { colors } from '@/constants/Design';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: any;
}

export function LoadingSpinner({ 
  size = 'medium', 
  color = colors.blue[600],
  style 
}: LoadingSpinnerProps) {
  const rotation = useSharedValue(0);

  const sizeMap = {
    small: 20,
    medium: 32,
    large: 48,
  };

  const spinnerSize = sizeMap[size];

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderColor: `${color}20`,
            borderTopColor: color,
            borderWidth: size === 'small' ? 2 : size === 'medium' ? 3 : 4,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// Pulsing dot loader
export function PulsingDots({ color = colors.blue[600] }: { color?: string }) {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const animateDot = (sharedValue: any, delay: number) => {
      setTimeout(() => {
        sharedValue.value = withRepeat(
          withTiming(1, {
            duration: 600,
            easing: Easing.inOut(Easing.ease),
          }),
          -1,
          true
        );
      }, delay);
    };

    animateDot(dot1, 0);
    setTimeout(() => animateDot(dot2, 200), 200);
    setTimeout(() => animateDot(dot3, 400), 400);
  }, [dot1, dot2, dot3]);

  const createDotStyle = (sharedValue: SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: sharedValue.value,
      transform: [
        {
          scale: interpolate(sharedValue.value, [0.3, 1], [0.8, 1.2]),
        },
      ],
    }));

  const dot1Style = createDotStyle(dot1);
  const dot2Style = createDotStyle(dot2);
  const dot3Style = createDotStyle(dot3);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot1Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot2Style]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, dot3Style]} />
    </View>
  );
}

// Skeleton loader for text
export function SkeletonText({ 
  width = '100%', 
  height = 16, 
  style 
}: { 
  width?: string | number; 
  height?: number; 
  style?: any; 
}) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// Skeleton loader for circular items (avatars, etc.)
export function SkeletonCircle({ 
  size = 40, 
  style 
}: { 
  size?: number; 
  style?: any; 
}) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderRadius: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  skeleton: {
    backgroundColor: colors.gray[200],
    borderRadius: 4,
  },
});