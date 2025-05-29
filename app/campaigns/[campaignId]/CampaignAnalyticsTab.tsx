import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type CampaignAnalyticsTabProps = {
  campaignId: string;
};

const CampaignAnalyticsTab = ({ campaignId }: CampaignAnalyticsTabProps) => {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Campaign Analytics</Text>
      <Text>
        This is the analytics tab content. You can display charts and metrics about campaign
        performance.
      </Text>
    </View>
  );
};

export default CampaignAnalyticsTab;

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
});
