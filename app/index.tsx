import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Image, Animated } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/lib/contexts/AuthContext';
import { colors, spacing, typography } from '@/constants/Design';

export default function SplashScreen() {
  const { user, loading, brandProfile, brandLoading, hasBrandProfile } = useAuth();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;

  // Start animations on mount
  useEffect(() => {
    const animateIn = () => {
      // Logo fade in and scale up
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Subtle rotation animation
      Animated.loop(
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();
    };

    animateIn();
  }, []);

  const rotateInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (!loading && !brandLoading) {
      // Add a small delay to ensure splash screen animations complete
      const timer = setTimeout(() => {
        if (!user) {
          // User is not authenticated, redirect to login
          router.replace('/(auth)/login');
        } else if (!hasBrandProfile) {
          // User is authenticated but has no brand profile, redirect to brand onboarding
          router.replace('/(brand)/setup');
        } else if (brandProfile) {
          // User has brand profile, check completion and approval status
          if (!brandProfile.is_complete) {
            // Brand profile exists but incomplete, redirect to continue setup
            router.replace('/(brand)/setup');
          } else if (brandProfile.approval_status === 'pending') {
              // Brand is complete but pending approval
              router.replace('/(brand)/under-review');
            } else if (brandProfile.approval_status === 'approved') {
              // Brand is approved, redirect to main app
              router.replace('/(tabs)');
            } else {
              // Brand is rejected or other status
              router.replace('/(brand)/under-review');
            }
        }
      }, 1500); // 1.5 second delay to let animations complete

      return () => clearTimeout(timer);
    }
  }, [user, loading, brandProfile, brandLoading, hasBrandProfile]);

  // Show loading screen while checking authentication
  if (loading || brandLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            <Image
              source={require('@/assets/logo/hyperdrive-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // This should not be reached as useEffect handles all redirects
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.gray[600],
    marginTop: spacing.md,
  },
});
