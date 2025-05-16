import { colors } from '@/constants/Design';
import React, { useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Define custom view style interface similar to the original ICustomViewStyle
export interface ICustomViewStyle {
  key: string;
  width: number | string;
  height: number | string;
  marginBottom?: number;
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  borderRadius?: number;
}

interface CustomSkeletonWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  layout: ICustomViewStyle[];
  backgroundColor?: string;
  highlightColor?: string;
  speed?: number;
}

/**
 * A custom skeleton loading wrapper that uses predefined layout
 * for more precise control over skeleton dimensions
 */
const CustomSkeletonWrapper: React.FC<CustomSkeletonWrapperProps> = ({
  isLoading,
  children,
  containerStyle,
  layout,
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

  // If not loading, show children
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <View style={containerStyle}>
      {layout.map(item => {
        const animatedStyle = useAnimatedStyle(() => {
          return {
            opacity: opacity.value,
            backgroundColor: backgroundColor,
          };
        });

        return (
          <Animated.View
            key={item.key}
            style={[
              // {
              //   width: item.width,
              //   height: item.height,
              //   borderRadius: item.borderRadius || 4,
              //   marginTop: item.marginTop,
              //   marginBottom: item.marginBottom,
              //   marginLeft: item.marginLeft,
              //   marginRight: item.marginRight,
              // },
              animatedStyle,
            ]}
          />
        );
      })}
    </View>
  );
};

export default CustomSkeletonWrapper;
