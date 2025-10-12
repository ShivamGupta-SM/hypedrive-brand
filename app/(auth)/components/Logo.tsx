import { borderRadius, colors, spacing } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
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
    rotation.value = 0;

    const animationTimeout = setTimeout(() => {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 15000,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    }, 100);

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
          <Text style={styles.logoText}>H</Text>
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
    overflow: 'hidden',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
  },
});
