import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { IconProps as PhosphorIconProps } from 'phosphor-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

interface IconProps extends PhosphorIconProps {
  size?: number;
  color?: string;
  weight?: 'regular' | 'fill' | 'duotone' | 'bold';
}

interface AnimatedTabIconProps extends PhosphorIconProps {
  Icon: React.ComponentType<IconProps>;
  color: string;
  focused: boolean;
  size?: number;
  route: '/' | '/payouts' | '/enrollments' | '/campaigns' | '/profile';
}

export function AnimatedTabIcon({ Icon, color, focused, size = 26, route }: AnimatedTabIconProps) {
  const router = useRouter();
  const pathname = usePathname();
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(0.7)).current;

  const handlePress = async () => {
    // Trigger haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate the icon
    animatePress();

    // Always navigate to the route when pressed, regardless of current path
    router.push(route);
  };

  const animatePress = () => {
    // Reset scale value to ensure animation works consistently
    scaleValue.setValue(1);

    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1.1,  // Slightly larger than original for a "bounce" effect
        useNativeDriver: true,
        friction: 5,
        tension: 40,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 40,
      }),
    ]).start();
  };

  useEffect(() => {
    Animated.timing(opacityValue, {
      toValue: focused ? 1 : 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (focused) {
      animatePress();
    }
  }, [focused]);

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
          },
        ]}>
        <Icon size={size} color={color} weight={focused ? 'fill' : 'regular'} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
