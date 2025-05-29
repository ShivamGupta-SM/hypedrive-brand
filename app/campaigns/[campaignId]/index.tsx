import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import {
  ArrowUp,
  CheckCircle,
  Clock,
  Pause,
  Play,
  SquaresFour,
  UserCheck,
} from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CampaignOverview() {
  const { campaignId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    // Simulate fetching new data (replace with your actual data fetching logic)
    setTimeout(() => {
      // In a real application, you'd fetch new data here
      // and update your state. For this example, we just reset the refresh state.
      setRefreshing(false);
    }, 2000);
  }, []);

  const campaign = {
    id: campaignId as string,
    name: 'Nike Air Max 2025',
    sku: '#NKE2025-001',
    status: 'Active',
    totalOrderValue: '₹2,05,000',
    valueUtilized: 45,
    reviews: {
      total: 28,
      pending: 17,
    },
    progress: 45,
    enrolled: 45,
    totalUnits: 100,
    timeline: {
      start: 'Jan 15',
      end: 'Mar 15',
    },
    requirements: [
      {
        id: '1',
        platform: 'Amazon Review',
        description: 'Detailed product review on Amazon',
        icon: (
          <Image
            source={require('@/assets/logo/others/amazon-logo2.png')}
            style={styles.requirementIcon}
          />
        ),
        color: colors.orange[500],
      },
      {
        id: '2',
        platform: 'Instagram Reel',
        description: '1 engaging reel (30-60s) with product mention',
        icon: (
          <Image
            source={require('@/assets/logo/others/amazon-logo2.png')}
            style={styles.requirementIcon}
          />
        ),
        color: colors.rose[400],
      },
      {
        id: '3',
        platform: 'Facebook Post',
        description: '1 descriptive post with photo & tag',
        icon: (
          <Image
            source={require('@/assets/logo/others/amazon-logo2.png')}
            style={styles.requirementIcon}
          />
        ),
        color: colors.blue[500],
      },
    ],
  };

  const [isPaused, setIsPaused] = React.useState(false);

  const handlePauseAndResumeButtonPress = () => {
    if (isPaused) {
      Alert.alert('Resume Campaign', 'Are you sure you want to resume this campaign?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Resume',
          onPress: () => {
            console.log('Campaign resumed');
            setIsPaused(!isPaused);
          },
          style: 'default',
        },
      ]);
    } else {
      Alert.alert('Pause Campaign', 'Are you sure you want to pause this campaign?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Pause',
          onPress: () => {
            console.log('Campaign paused'); // Toggle the paused state
            setIsPaused(!isPaused);
          },
          style: 'destructive',
        },
      ]);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Campaign Card */}
      <LinearGradient
        colors={['#EA590D', '#FF9A3D']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.campaignCard}>
        <View style={styles.campaignHeader}>
          <View style={styles.campaignImageContainer}>
            <Image
              source={require('@/assets/logo/others/amazon-logo2.png')}
              style={styles.campaignImage}
            />
            <View style={styles.campaignDotStatus} />
          </View>
          <View style={styles.campaignInfo}>
            <View style={styles.campaignNameContainer}>
              <Text style={styles.campaignName}>{campaign.name}</Text>
              <CheckCircle size={14} weight="fill" color={colors.orange[50]} />
            </View>
            <Text style={styles.campaignSku}>{campaign.sku}</Text>
          </View>
        </View>

        <View style={styles.campaignBottom}>
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => handlePauseAndResumeButtonPress()}>
            {isPaused ? (
              <Play size={16} color={colors.orange[500]} weight="fill" />
            ) : (
              <Pause size={16} color={colors.orange[500]} weight="fill" />
            )}
            <Text style={styles.pauseButtonText}>{isPaused ? 'Resume' : 'Pause'} Campaign</Text>
          </TouchableOpacity>
          <View style={styles.clockIcon}>
            <Clock size={24} weight="fill" color={colors.orange[50]} />
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        {/* Total Order Value */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Order Value</Text>
          <Text style={styles.statValue}>{campaign.totalOrderValue}</Text>
          <View style={styles.utilizedContainer}>
            <ArrowUp size={12} color={colors.green[500]} weight="bold" />
            <Text style={styles.utilizedText}>{campaign.valueUtilized}% utilized</Text>
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Reviews</Text>
          <Text style={styles.statValue}>{campaign.reviews.total}</Text>
          <View style={styles.pendingContainer}>
            <View style={styles.pendingDot} />
            <Text style={styles.pendingText}>{campaign.reviews.pending} pending</Text>
          </View>
        </View>
      </View>

      {/* Campaign Progress */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Campaign Progress</Text>
          <View style={styles.progressPercentageContainer}>
            <Text style={styles.progressPercentage}>{campaign.progress}%</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${campaign.progress}%` }]} />
        </View>

        <View style={styles.enrollmentInfo}>
          <View style={styles.enrollmentItem}>
            <UserCheck size={16} color={colors.text.secondary} weight="fill" />
            <Text style={styles.enrollmentText}>{campaign.enrolled} enrolled</Text>
          </View>
          <View style={styles.enrollmentDivider} />
          <View style={[styles.enrollmentItem, { justifyContent: 'flex-end' }]}>
            <SquaresFour size={16} color={colors.text.secondary} weight="fill" />
            <Text style={styles.enrollmentText}>{campaign.totalUnits} total units</Text>
          </View>
        </View>
      </View>

      {/* Campaign Timeline */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Campaign Timeline</Text>

        <View style={styles.timelineContainer}>
          <View style={styles.timelineLabels}>
            <Text style={styles.timelineLabel}>Started</Text>
            <Text style={styles.timelineLabel}>Ends</Text>
          </View>
          <View style={styles.timelineDates}>
            <Text style={styles.timelineDate}>{campaign.timeline.start}</Text>
            <Text style={styles.timelineDate}>{campaign.timeline.end}</Text>
          </View>

          <View style={styles.timelineBarContainer}>
            <View style={styles.timelineBarBackground} />
            <View style={styles.timelineBarProgress} />
            <View style={styles.timelineMarker} />
          </View>
        </View>
      </View>

      {/* Campaign Requirements */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Campaign Requirements</Text>

        {campaign.requirements.map(requirement => (
          <View key={'campaign-requirements-' + requirement.id} style={styles.requirementItem}>
            <View style={[styles.requirementIconContainer, { backgroundColor: requirement.color }]}>
              {requirement.icon}
            </View>
            <View style={styles.requirementContent}>
              <Text style={styles.requirementTitle}>{requirement.platform}</Text>
              <Text style={styles.requirementDescription}>{requirement.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
  },

  campaignCard: {
    backgroundColor: colors.orange[500],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  campaignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  campaignImageContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.orange[300],
  },
  campaignDotStatus: {
    height: 14,
    width: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.green[500],
    position: 'absolute',
    top: -4,
    right: -4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  campaignImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  campaignInfo: {
    flex: 1,
  },
  campaignNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  campaignName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  campaignSku: {
    fontSize: typography.sizes.xs,
    color: colors.white,
    fontWeight: typography.weights.medium,
    opacity: 0.8,
  },
  campaignBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orange[50],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xm,
    paddingHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  pauseButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.orange[600],
    marginLeft: spacing.xs,
  },
  clockIcon: {
    height: 42,
    width: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${colors.orange[50]}40`,
    borderRadius: borderRadius.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.gray[400],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  shadow: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  utilizedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  utilizedText: {
    fontSize: typography.sizes.xs,
    color: colors.green[500],
    fontWeight: typography.weights.medium,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[500],
    marginRight: 4,
  },
  pendingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.orange[500],
  },
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
  progressPercentageContainer: {
    backgroundColor: colors.blue[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  progressPercentage: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.blue[500],
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.blue[500],
    borderRadius: borderRadius.full,
  },
  enrollmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enrollmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  enrollmentIcon: {
    width: 16,
    height: 16,
    marginRight: spacing.xs,
  },
  enrollmentText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  enrollmentDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.md,
  },
  timelineContainer: {
    marginTop: spacing.sm,
  },
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  timelineLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  timelineDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  timelineDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
  },
  timelineBarContainer: {
    position: 'relative',
    height: 4,
    marginTop: spacing.xs,
  },
  timelineBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
  },
  timelineBarProgress: {
    position: 'absolute',
    left: 0,
    width: '40%',
    height: 4,
    backgroundColor: colors.blue[500],
    borderRadius: borderRadius.full,
  },
  timelineMarker: {
    position: 'absolute',
    left: '40%',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.blue[500],
    borderWidth: 2,
    borderColor: colors.white,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
  },
  requirementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  requirementIcon: {
    width: 20,
    height: 20,
    tintColor: colors.white,
  },
  requirementContent: {
    flex: 1,
  },
  requirementTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    marginBottom: 2,
  },
  requirementDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
});
