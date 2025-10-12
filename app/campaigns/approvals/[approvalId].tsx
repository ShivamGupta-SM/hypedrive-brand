import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography } from '@/constants/Design';

export default function ApprovalDetailScreen() {
  const { approvalId } = useLocalSearchParams<{ approvalId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Approval Details</Text>
      <Text style={styles.subtitle}>Approval ID: {approvalId}</Text>
      <Text style={styles.placeholder}>This screen is under development.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
    marginBottom: spacing.lg,
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.gray[500],
    textAlign: 'center',
  },
});