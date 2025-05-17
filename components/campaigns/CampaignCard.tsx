import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useRouter } from 'expo-router';
import { Clock } from 'phosphor-react-native';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

// Types for our data
type Campaign = {
  id: string;
  name: string;
  daysAgo: string;
  status: 'Active' | 'Draft' | 'Complete';
  enrolled: {
    current: number;
    total: number;
  };
  reviews: number;
  value: string;
  progress: number;
  image?: any;
};

// type CampaignCardProps = {
//   id: string;
//   title: string;
//   category: string;
//   rebatePercentage: number;
//   originalPrice: string;
//   afterRebate: string;
//   spots: number;
//   daysLeft: number;
//   image: any;
//   onEnroll?: () => void;
// }

type CampaignCardProps = {
  campaign: Campaign;
  // onEnroll?: () => void; // Add this line to indicate the onEnroll prop is optional
};

export function CampaignCard({
  //   id,
  //   title,
  //   category,
  //   rebatePercentage,
  //   originalPrice,
  //   afterRebate,
  //   spots,
  //   daysLeft,
  //   image,
  //   onEnroll,
  campaign,
}: CampaignCardProps) {
  const router = useRouter();

  // Get status color based on campaign status
  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return colors.green[500];
      case 'Draft':
        return colors.gray[500];
      case 'Complete':
        return colors.blue[500];
      default:
        return colors.gray[500];
    }
  };

  // Get status background color based on campaign status
  const getStatusBgColor = (status: Campaign['status']) => {
    switch (status) {
      case 'Active':
        return colors.green[100];
      case 'Draft':
        return colors.gray[200];
      case 'Complete':
        return colors.blue[100];
      default:
        return colors.gray[200];
    }
  };
  return (
    <Pressable
      key={campaign.id}
      style={styles.campaignCard}
      onPress={() => router.push(`/campaigns/${campaign.id}`)}>
      {/* Campaign Header */}
      <View style={styles.campaignHeader}>
        <View style={styles.campaignImageContainer}>
          <Image source={campaign.image} style={styles.campaignImage} />
          {/* Status Dot */}
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(campaign.status) }]} />
        </View>
        <View style={styles.campaignInfo}>
          <View style={styles.campaignTitleRow}>
            <Text style={styles.campaignName} numberOfLines={1} ellipsizeMode="tail">
              {campaign.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusBgColor(campaign.status),
                  borderColor: `${getStatusColor(campaign.status)}20`,
                },
              ]}>
              <Text style={[styles.statusText, { color: getStatusColor(campaign.status) }]}>
                {campaign.status}
              </Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Clock size={14} color={colors.text.secondary} />
            <Text style={styles.timeText}>{campaign.daysAgo}</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabel}>Campaign Progress</Text>
          <Text
            style={[
              styles.progressText,
              {
                color:
                  campaign.status === 'Complete'
                    ? colors.blue[500]
                    : campaign.status === 'Active'
                      ? colors.green[500]
                      : colors.gray[500],
              },
            ]}>
            {campaign.progress}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${campaign.progress}%`,
                backgroundColor:
                  campaign.status === 'Complete'
                    ? colors.blue[500]
                    : campaign.status === 'Active'
                      ? colors.green[500]
                      : colors.gray[500],
              },
            ]}
          />
        </View>
      </View>

      {/* Campaign Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statLabelHeader}>
            <Text style={styles.statLabel}>Enrolled</Text>
            {/* <UsersThree size={14} color={colors.text.secondary} weight="fill" /> */}
          </View>
          <Text style={styles.statValue}>
            {campaign.enrolled.current}/{campaign.enrolled.total}
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statLabelHeader}>
            <Text style={styles.statLabel}>Reviews</Text>
            {/* <Star size={14} color={colors.text.secondary} weight="fill" /> */}
          </View>
          <Text style={styles.statValue}>{campaign.reviews}</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statLabelHeader}>
            <Text style={styles.statLabel}>Value</Text>
            {/* <Text style={styles.currencyIcon}>₹</Text> */}
          </View>
          <Text style={styles.statValue}>{campaign.value}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  campaignCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    padding: spacing.xm,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  campaignImageContainer: {
    position: 'relative',
    marginRight: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  campaignImage: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    tintColor: colors.gray[300],
    borderColor: colors.gray[100],
  },
  statusDot: {
    position: 'absolute',
    top: 0.5,
    right: 0.5,
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campaignName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    flex: 1,
    marginRight: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: typography.sizes.xxs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.semibold,
  },
  progressContainer: {
    alignSelf: 'center',
  },
  progressSection: {
    marginTop: spacing.sm,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  progressBarBackground: {
    height: 6,
    width: '100%',
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: colors.gray[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statLabelHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  currencyIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
});
