import { borderRadius, colors, spacing } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

const Logo = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Reset the value before starting new animation
    rotation.value = 0;

    // Start the rotation animation with a delay to ensure proper setup
    const animationTimeout = setTimeout(() => {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 15000, // Slightly faster rotation (15 seconds)
          easing: Easing.linear, // Easing function for smoothness
        }),
        -1, // Infinite repetitions
        false, // No reverse animation
      );
    }, 100);

    // Cleanup animation when component unmounts
    return () => {
      clearTimeout(animationTimeout);
      cancelAnimation(rotation);
    };
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.logoContainer}>
      <Animated.View style={[styles.logo, animatedStyle]}>
        <LinearGradient
          colors={['#F37353', '#f04b2d']}
          start={{ x: 1, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.gradientBackground}>
          <Image source={require('@/assets/logo/logomark.png')} style={styles.logoImage} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 12,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    // backgroundColor: colors.primary,
    // justifyContent: 'center',
    // alignItems: 'center',
    overflow: 'hidden',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 50,
    height: 50,
    tintColor: colors.white,
  },
});
