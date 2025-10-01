import { FeatureCard } from '@/components/FeatureCard';
import { GradientButton } from '@/components/GradientButton';
import { colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChartLineUp, MegaphoneSimple, Plus, Users } from 'phosphor-react-native';
import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useAuth } from '@/lib/contexts/AuthContext';

// Feature card data for looping
const featureCards = [
  {
    id: 'track-performance',
    title: 'Track Performance',
    description: "Monitor your brand's growth and analytics in real-time",
    icon: <ChartLineUp size={24} color={colors.primary} weight="bold" />,
    backgroundColor: colors.orange[50],
    borderColor: colors.orange[100],
  },
  {
    id: 'manage-campaigns',
    title: 'Manage Campaigns',
    description: 'Create and manage marketing campaigns efficiently',
    icon: <MegaphoneSimple size={24} color={colors.blue[500]} weight="bold" />,
    backgroundColor: colors.blue[50],
    borderColor: colors.blue[100],
  },
  {
    id: 'grow-audience',
    title: 'Grow Audience',
    description: 'Build and engage with your target audience',
    icon: <Users size={24} color={colors.green[500]} weight="fill" />,
    backgroundColor: colors.green[50],
    borderColor: colors.green[100],
  },
];

export default function CreateBrandScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to login
        router.replace('/(auth)/login');
      }
      // If user is authenticated, stay on this screen (brand onboarding)
    }
  }, [user, loading]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't render the main content if user is not authenticated
  // (will be redirected by useEffect)
  if (!user) {
    return null;
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Start Your Journey</Text>
          <Text style={styles.subtitle}>Create your first brand to get started</Text>

          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            {featureCards.map(card => (
              <FeatureCard
                key={card.id}
                title={card.title}
                description={card.description}
                icon={card.icon}
                backgroundColor={card.backgroundColor}
                borderColor={card.borderColor}
              />
            ))}
          </View>
        </ScrollView>

        {/* Create Brand Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <GradientButton
            title="Create Your Brand"
            onPress={() => {
              router.push('/(brand)/setup');
            }}
            icon={<Plus size={20} color={colors.white} weight="bold" />}
            iconPosition="left"
            gradientColors={[colors.gray[900], colors.gray[800], colors.gray[900]]}
          />
        </View>
      </View>
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
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.mg,
    paddingBottom: spacing.xxl * 3, // Add extra padding at bottom for the fixed button
  },
  title: {
    fontSize: typography.sizes.xxl * 1.35,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    letterSpacing: -0.8,
    marginTop: spacing.xl,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.mg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
});
