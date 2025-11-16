import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Check, Clock, Info } from 'phosphor-react-native';
import React from 'react';
import { Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

export default function BrandUnderReviewScreen() {
  // Animation for the clock icon rotation
  const rotation = useSharedValue(0);

  // Animation for the clock icon opacity pulse
  const mainIconOpacity = useSharedValue(1);

  // Animation for the pending status icon opacity pulse
  const pendingIconOpacity = useSharedValue(1);

  React.useEffect(() => {
    // Reset the values before starting new animations
    rotation.value = 0;
    mainIconOpacity.value = 1;
    pendingIconOpacity.value = 1;

    // Start the rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 10000, // 10 seconds per rotation
        easing: Easing.linear,
      }),
      -1, // Infinite repetitions
      false, // No reverse animation
    );

    // Start the main icon opacity pulse animation
    mainIconOpacity.value = withRepeat(
      withTiming(0.6, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repetitions
      true, // With reverse animation (pulse effect)
    );

    // Start the pending icon opacity pulse animation with slight delay
    pendingIconOpacity.value = withRepeat(
      withTiming(0.6, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repetitions
      true, // With reverse animation (pulse effect)
    );

    return () => {
      // Clean up animations when component unmounts
      rotation.value = 0;
      mainIconOpacity.value = 1;
      pendingIconOpacity.value = 1;
    };
  }, []);

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const mainIconOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: mainIconOpacity.value,
    };
  });

  const pendingIconOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: pendingIconOpacity.value,
    };
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* Clock Icon with Animation */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[colors.orange[100], colors.orange[50]]}
              style={styles.iconBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Animated.View style={[rotationStyle, mainIconOpacityStyle]}>
                <Clock size={56} weight="fill" color={colors.orange[500]} />
              </Animated.View>
            </LinearGradient>
          </View>

          <Text style={styles.title}>Under Review</Text>
          <Text style={styles.subtitle}>
            We're reviewing your account details. This usually takes 24-48 hours.
          </Text>

          {/* Status Steps */}
          <View style={styles.statusContainer}>
            {/* Completed Step: Account Created */}
            <View style={styles.statusItem}>
              <View style={styles.statusIconCompleted}>
                <Check size={20} weight="bold" color={colors.white} />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Account Created</Text>
                <Text style={styles.statusSubtitle}>Basic details submitted</Text>
              </View>
            </View>

            {/* Completed Step: Brand Details */}
            <View style={styles.statusItem}>
              <View style={styles.statusIconCompleted}>
                <Check size={20} weight="bold" color={colors.white} />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Brand Details</Text>
                <Text style={styles.statusSubtitle}>Brand information added</Text>
              </View>
            </View>

            {/* Pending Step: Account Verification */}
            <View style={styles.statusItem}>
              <Animated.View style={[styles.statusIconPending, pendingIconOpacityStyle]}>
                <Clock size={20} weight="fill" color={colors.white} />
              </Animated.View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>Account Verification</Text>
                <Text style={styles.statusSubtitle}>Pending approval</Text>
              </View>
            </View>
          </View>

          {/* What happens next section */}
          <View style={styles.infoContainer}>
            <Info size={22} weight="fill" color={colors.blue[500]} />
            <View style={styles.info}>
              <Text style={styles.infoTitle}>What happens next?</Text>
              <Text style={styles.infoText}>
                Once approved, you'll receive an email confirmation and can start creating campaigns
                right away.
              </Text>
            </View>
          </View>

          {/* Support Link */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>Need help?</Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:support@hypedrive.com')}>
              <Text style={styles.supportLink}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Link href="/(tabs)" replace asChild>
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <Text>Proceed (remove later)</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.mg,
  },
  iconContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.orange[200],
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    maxWidth: '90%',
  },
  statusContainer: {
    width: '100%',
    maxWidth: '90%',
    marginBottom: spacing.lg,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusIconCompleted: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.green[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconPending: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  statusTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
  },
  statusSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: colors.blue[50],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    lineHeight: 20,
  },
  supportContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: spacing.lg,
  },
  supportText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  supportLink: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.orange[500],
    marginLeft: spacing.xs,
  },
});
