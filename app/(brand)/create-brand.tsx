import { GradientButton } from '@/app/(auth)/components/GradientButton';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChartLineUp, MegaphoneSimple, Users } from 'phosphor-react-native';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function CreateBrandScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.title}>Start Your Journey</Text>
          <Text style={styles.subtitle}>Create your first brand to get started</Text>

          {/* Feature Cards */}
          <View style={styles.cardsContainer}>
            {/* Track Performance Card */}
            <View style={[styles.card, { backgroundColor: colors.orange[50] }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.orange[100] }]}>
                <ChartLineUp size={24} color={colors.primary} weight="bold" />
              </View>
              <Text style={styles.cardTitle}>Track Performance</Text>
              <Text style={styles.cardDescription}>
                Monitor your brand&apos;s growth and analytics in real-time
              </Text>
            </View>

            {/* Manage Campaigns Card */}
            <View style={[styles.card, { backgroundColor: colors.blue[50] }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.blue[100] }]}>
                <MegaphoneSimple size={24} color={colors.blue[500]} weight="bold" />
              </View>
              <Text style={styles.cardTitle}>Manage Campaigns</Text>
              <Text style={styles.cardDescription}>
                Create and manage marketing campaigns efficiently
              </Text>
            </View>

            {/* Grow Audience Card */}
            <View style={[styles.card, { backgroundColor: colors.green[50] }]}>
              <View style={[styles.iconContainer, { backgroundColor: colors.green[100] }]}>
                <Users size={24} color={colors.green[500]} weight="bold" />
              </View>
              <Text style={styles.cardTitle}>Grow Audience</Text>
              <Text style={styles.cardDescription}>Build and engage with your target audience</Text>
            </View>
          </View>

          {/* Create Brand Button */}
          <GradientButton
            title="Create Your Brand"
            onPress={() => {
              router.push('/(brand)/new');
            }}
            style={styles.createButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.mg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
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
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  createButton: {
    marginTop: spacing.xl,
  },
});
