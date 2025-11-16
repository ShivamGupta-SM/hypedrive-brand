import { colors } from '@/constants/Design';
import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  highlightColor?: string;
  speed?: number;
}

/**
 * A flexible skeleton loading wrapper that uses child layout
 * to determine the skeleton dimensions automatically
 */
const SkeletonWrapper: React.FC<SkeletonWrapperProps> = ({
  isLoading,
  children,
  containerStyle,
  backgroundColor = colors.gray[200],
  highlightColor = colors.gray[100],
  speed = 800,
}) => {
  // Animation value for the skeleton effect
  const opacity = useSharedValue(1);

  // Set up the animation when the component mounts
  useEffect(() => {
    if (isLoading) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: speed, easing: Easing.ease }),
          withTiming(1, { duration: speed, easing: Easing.ease }),
        ),
        -1, // Infinite repetitions
        true, // Reverse
      );
    } else {
      opacity.value = 1;
    }
  }, [isLoading, speed, opacity]);

  // Create the animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  // If not loading, simply render the children
  if (!isLoading) {
    return <>{children}</>;
  }

  // When loading, show a placeholder with the same dimensions
  return (
    <Animated.View
      style={[
        containerStyle,
        animatedStyle,
        { backgroundColor, overflow: 'hidden', position: 'relative' },
      ]}>
      {/* Empty view with same size as children */}
    </Animated.View>
  );
};

export default SkeletonWrapper;
