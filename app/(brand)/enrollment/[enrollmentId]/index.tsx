// import InfoRow from '@/components/enrollment/InfoRow';
// import RejectionReasonBottomSheet, {
//   RejectionReasonBottomSheetHandle,
// } from '@/components/enrollment/RejectionReasonBottomSheet';
// import StatusBadge from '@/components/enrollment/StatusBadge';
import InfoColumn from '@/components/enrollment/InfoColumn';
import RejectionReasonBottomSheet, {
  RejectionReasonBottomSheetHandle,
} from '@/components/enrollment/RejectionReasonBottomSheet';
import Row from '@/components/enrollment/Row';
import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import {
  Check,
  CheckCircle,
  Clock,
  ClockCounterClockwise,
  CubeFocus,
  InstagramLogo,
  Link,
  Share,
  Star,
  X,
} from 'phosphor-react-native';
import React, { useRef, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Sample enrollment data
const enrollmentData = {
  ENR123456: {
    id: 'ENR123456',
    status: 'approved',
    approvedDate: 'May 30, 2025',
    approvedTime: '3:15 PM',
    submittedDate: 'May 29, 2025',
    submittedTime: '1:30 PM',
    creator: {
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'Brand Fan',
    },
    orderId: '418093',
    confirmationDate: 'May 10, 2025',
    campaign: {
      name: 'Nike Air Max 2025',
      image:
        'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6tn7uxrd/air-max-270-shoes-2V5C4p.png',
    },
    platform: 'Footwear',
    category: 'Sneakers',
    orderScreenshot: true,
    deliverables: [
      {
        type: 'Product Review',
        completed: true,
        verifiedPurchase: true,
        content:
          'Absolutely comfy and sleek! These Nike Air Max 2025 are both stylish and comfortable with every step. The cushioning is perfect for my daily walks and the design turns heads. Love the color and the breathable fabric.',
      },
      {
        type: 'Instagram Post',
        completed: true,
        likes: 1234,
      },
    ],
    timeline: [
      {
        status: 'approved',
        date: 'Jun 10, 2025',
        time: '3:15 PM',
      },
      {
        status: 'deliverables_submitted',
        date: 'Jun 9, 2025',
        time: '1:30 PM',
      },
      {
        status: 'enrollment_created',
        date: 'Jun 8, 2025',
        time: '11:45 AM',
      },
    ],
  },
  ENR789012: {
    id: 'ENR789012',
    status: 'pending_review',
    submittedDate: 'May 29, 2025',
    submittedTime: '1:30 PM',
    creator: {
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      role: 'Brand Fan',
    },
    orderId: '418093',
    confirmationDate: 'May 10, 2025',
    campaign: {
      name: 'Nike Air Max 2025',
      image:
        'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6tn7uxrd/air-max-270-shoes-2V5C4p.png',
    },
    platform: 'Footwear',
    category: 'Sneakers',
    orderScreenshot: true,
    deliverables: [
      {
        type: 'Product Review',
        completed: true,
        verifiedPurchase: true,
        content:
          'Absolutely comfy and sleek! These Nike Air Max 2025 are both stylish and comfortable with every step. The cushioning is perfect for my daily walks and the design turns heads. Love the color and the breathable fabric.',
      },
      {
        type: 'Instagram Post',
        completed: true,
        likes: 1234,
      },
    ],
    timeline: [
      {
        status: 'pending_review',
        date: 'Jun 10, 2025',
        time: '10:30 AM',
      },
      {
        status: 'deliverables_submitted',
        date: 'Jun 9, 2025',
        time: '1:30 PM',
      },
      {
        status: 'enrollment_created',
        date: 'Jun 8, 2025',
        time: '11:45 AM',
      },
    ],
  },
};

const EnrollmentDetails = () => {
  const { enrollmentId } = useLocalSearchParams();
  const id = typeof enrollmentId === 'string' ? enrollmentId : '';

  // Get enrollment data based on ID
  // Temporary any type cast for demo purposes
  const [enrollment, setEnrollment] = useState((enrollmentData as any)[id] || null);

  // Reference to rejection reason bottom sheet
  const rejectionBottomSheetRef = useRef<RejectionReasonBottomSheetHandle>(null);

  if (!enrollment) {
    return (
      <View style={styles.container}>
        <AppHeader title="Enrollment Details" showBackButton titleAlign="left" />
        <View style={styles.centerContent}>
          <Text>Enrollment not found</Text>
        </View>
      </View>
    );
  }

  const handleApprove = () => {
    // Any type cast for demo purposes
    setEnrollment((prev: any) => {
      if (!prev) return prev;

      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });

      return {
        ...prev,
        status: 'approved',
        approvedDate: formattedDate,
        approvedTime: formattedTime,
        timeline: [
          {
            status: 'approved',
            date: formattedDate,
            time: formattedTime,
          },
          ...prev.timeline,
        ],
      };
    });
  };

  const handleReject = () => {
    rejectionBottomSheetRef.current?.present();
  };

  const handleSubmitRejection = (reason: string) => {
    // Any type cast for demo purposes
    setEnrollment((prev: any) => {
      if (!prev) return prev;

      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });

      return {
        ...prev,
        status: 'rejected',
        rejectionReason: reason,
        rejectedDate: formattedDate,
        rejectedTime: formattedTime,
        timeline: [
          {
            status: 'rejected',
            date: formattedDate,
            time: formattedTime,
            reason,
          },
          ...prev.timeline,
        ],
      };
    });
  };

  const handleCancelRejection = () => {
    // Just close the bottom sheet
  };

  const renderStatusHeader = () => {
    switch (enrollment.status) {
      case 'approved':
        return (
          <LinearGradient
            colors={[colors.green[600], colors.green[400]]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.statusHeader, styles.approvedHeader]}>
            <View style={styles.statusHeaderContent}>
              <View style={styles.statusHeaderIcon}>
                <CheckCircle size={24} weight="fill" color={colors.white} />
              </View>
              <View>
                <Text style={styles.statusHeaderText}>Approved</Text>
                <Text style={styles.statusHeaderSubtext}>
                  Approved {enrollment.approvedDate} at {enrollment.approvedTime}
                </Text>
              </View>
            </View>
          </LinearGradient>
        );
      case 'pending_review':
        return (
          <LinearGradient
            colors={[colors.yellow[500], colors.yellow[400]]}
            start={{ x: 1, y: 1 }}
            end={{ x: 0, y: 1 }}
            style={[styles.statusHeader, styles.pendingHeader]}>
            <View style={styles.statusHeaderContent}>
              <View style={styles.statusHeaderIcon}>
                <Clock size={24} weight="fill" color={colors.white} />
              </View>
              <View>
                <Text style={styles.statusHeaderText}>Pending Review</Text>
                <Text style={styles.statusHeaderSubtext}>
                  Submitted {enrollment.submittedDate} at {enrollment.submittedTime}
                </Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
                <Check size={16} weight="bold" color={colors.green[500]} />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <X size={16} weight="bold" color={colors.red[500]} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        );
      case 'rejected':
        return (
          <View style={[styles.statusHeader, styles.rejectedHeader]}>
            <View style={styles.statusHeaderContent}>
              <X size={24} weight="fill" color={colors.white} />
              <Text style={styles.statusHeaderText}>Rejected</Text>
              <Text style={styles.statusHeaderSubtext}>
                {enrollment.rejectedDate} at {enrollment.rejectedTime}
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const renderTimelineItem = (item: any, index: number) => {
    const getTimelineIcon = () => {
      switch (item.status) {
        case 'approved':
          return <Check size={16} weight="bold" color={colors.green[500]} />;
        case 'rejected':
          return <X size={20} weight="fill" color={colors.red[500]} />;
        case 'deliverables_submitted':
          return <Check size={16} weight="bold" color={colors.green[500]} />;
        case 'enrollment_created':
          return <Check size={16} weight="bold" color={colors.green[500]} />;
        default:
          return <ClockCounterClockwise size={20} weight="bold" color={colors.orange[500]} />;
      }
    };

    const getTimelineColor = () => {
      switch (item.status) {
        case 'approved':
          return colors.green[500];
        case 'rejected':
          return colors.red[500];
        case 'deliverables_submitted':
          return colors.green[500];
        case 'enrollment_created':
          return colors.green[500];
        default:
          return colors.orange[500];
      }
    };

    const getTimelineLabel = () => {
      switch (item.status) {
        case 'approved':
          return 'Approved';
        case 'rejected':
          return 'Rejected';
        case 'deliverables_submitted':
          return 'Deliverables Submitted';
        case 'enrollment_created':
          return 'Enrollment Created';
        case 'pending_review':
          return 'Pending Review';
        default:
          return item.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      }
    };

    const getTimelineStatusDescription = () => {
      switch (item.status) {
        case 'approved':
          return null;
        case 'rejected':
          return item.reason;
        case 'deliverables_submitted':
          return 'Product Review submitted';
        case 'enrollment_created':
          return 'Order details verified';
        case 'pending_review':
          return 'Pending Review';
        default:
          return item.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      }
    };

    const getStatusIcon = () => {
      switch (item.status) {
        case 'approved':
          return <Check size={12} color={color} weight="bold" />;
        case 'rejected':
          return <X size={12} color={color} weight="bold" />;
        case 'deliverables_submitted':
          return <Check size={12} color={color} weight="bold" />;
        case 'enrollment_created':
          return <Check size={12} color={color} weight="bold" />;
        case 'pending_review':
          return <Clock size={12} color={color} weight="bold" />;
        default:
          return <ClockCounterClockwise size={12} color={color} weight="bold" />;
      }
    };

    const color = getTimelineColor();
    const isLast = index === enrollment.timeline.length - 1;

    return (
      <View key={index} style={styles.timelineItem}>
        <View style={styles.timelineIconContainer}>
          <View
            style={[
              styles.timelineIcon,
              { backgroundColor: `${color}25`, borderColor: color, borderWidth: 2 },
            ]}>
            {getTimelineIcon()}
          </View>
          {!isLast && <View style={[styles.timelineLine]} />}
        </View>
        <View style={[styles.timelineContent, { backgroundColor: `${color}10` }]}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineLabel}>{getTimelineLabel()}</Text>
            {/* <StatusBadge status={item.status as any} size="small" /> */}
          </View>
          <Text style={styles.timelineDate}>
            {item.date} at {item.time}
          </Text>
          <View style={styles.timelineStatusContainer}>
            {getStatusIcon()}
            <Text style={styles.timelineStatus}>{getTimelineStatusDescription()}</Text>
          </View>
          {item.reason && (
            <View style={styles.rejectionReasonContainer}>
              <Text style={styles.rejectionReasonLabel}>Rejection Reason:</Text>
              <Text style={styles.rejectionReasonText}>{item.reason}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Enrollment Details" showBackButton titleAlign="left" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Status Header */}
        {renderStatusHeader()}

        {/* Creator Info */}
        <View style={styles.card}>
          <View style={styles.creatorContainer}>
            <Image source={{ uri: enrollment.creator.avatar }} style={styles.creatorAvatar} />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{enrollment.creator.name}</Text>
              <Text style={styles.creatorRole}>{enrollment.creator.role}</Text>
            </View>
          </View>

          <Row containerStyle={{ paddingBottom: spacing.sm }}>
            {/* Order Info */}
            <InfoColumn label="Order ID" value={`#${enrollment.orderId}`} />
            <InfoColumn label="Enrollment Date" value={enrollment.submittedDate} />
          </Row>
        </View>

        {/* Campaign Details */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Campaign Details</Text>
          </View>
          <View style={styles.campaignContainer}>
            <Image source={{ uri: enrollment.campaign.image }} style={styles.campaignImage} />
            <View style={styles.campaignInfo}>
              <Text style={styles.campaignName}>{enrollment.campaign.name}</Text>
              <View style={styles.campaignMeta}>
                <Text style={styles.campaignMetaItem}>{enrollment.platform}</Text>
                <Text style={styles.campaignMetaDot}>•</Text>
                <Text style={styles.campaignMetaItem}>{enrollment.category}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Screenshot */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Screenshot</Text>
          </View>
          <View style={styles.orderScreenshotContainer}>
            <CubeFocus size={20} weight="fill" color={colors.green[500]} />
            <Text style={styles.orderScreenshotText}>Order Screenshot</Text>
            <View style={styles.checkmarkContainer}>
              <Check size={20} weight="bold" color={colors.green[500]} />
            </View>
          </View>
          <Image
            source={require('@/assets/images/placeholder.png')}
            style={styles.orderScreenshotImage}
            resizeMode="contain"
          />
        </View>

        {/* Deliverables */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Deliverables</Text>
          </View>
          {/* Render deliverables */}
          {/* Any type cast for demo purposes */}
          {/* TODO: Add type safety for deliverables */}
          {enrollment.deliverables.map((deliverable: any, index: number) => (
            <View key={index} style={styles.deliverableContainer}>
              <View style={styles.deliverableHeader}>
                <View style={styles.deliverableType}>
                  {deliverable.type === 'Product Review' ? (
                    <Star size={20} weight="fill" color={colors.green[500]} />
                  ) : deliverable.type === 'Instagram Post' ? (
                    <InstagramLogo size={20} weight="bold" color={colors.green[500]} />
                  ) : null}
                  <Text style={styles.deliverableTypeText}>{deliverable.type}</Text>
                </View>
                <Check size={20} weight="bold" color={colors.green[500]} />
              </View>

              {deliverable.type === 'Product Review' && (
                <View style={styles.reviewContainer}>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <View key={star} style={styles.starContainer}>
                        <Star size={20} color={colors.yellow[500]} />
                      </View>
                    ))}
                    {deliverable.verifiedPurchase && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>Verified Purchase</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.reviewText}>{deliverable.content}</Text>

                  <TouchableOpacity style={styles.viewMoreButton}>
                    <Link size={16} weight="bold" color={colors.blue[500]} />
                    <Text style={styles.viewMoreText}>View on Amazon</Text>
                    <Share size={16} color={colors.blue[500]} weight="bold" />
                  </TouchableOpacity>
                </View>
              )}

              {deliverable.type === 'Instagram Post' && (
                <View style={styles.instagramContainer}>
                  <View style={styles.instagramHeader}>
                    <Image
                      source={{ uri: enrollment.creator.avatar }}
                      style={styles.instagramAvatar}
                    />
                    <Text style={styles.instagramUsername}>{enrollment.creator.name}</Text>
                  </View>

                  <Image
                    source={{ uri: enrollment.campaign.image }}
                    style={styles.instagramImage}
                  />

                  <View style={styles.instagramStats}>
                    <View style={styles.instagramStat}>
                      <FontAwesome5 name="heart" size={20} color={colors.text.primary} />
                      {/* <Text style={styles.instagramStatText}>{deliverable.likes}</Text> */}
                    </View>
                    <View style={styles.instagramStat}>
                      <FontAwesome5 name="comment" size={20} color={colors.text.primary} />
                    </View>
                    <View style={styles.instagramStat}>
                      <FontAwesome5 name="paper-plane" size={20} color={colors.text.primary} />
                    </View>
                  </View>

                  <Text style={styles.instagramLikes}>{deliverable.likes} likes</Text>
                </View>
              )}

              {index < enrollment.deliverables.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Timeline</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.timelineContainer}>
            {enrollment.timeline.map(renderTimelineItem)}
          </View>
        </View>

        {/* Rejection Reason */}
        {enrollment.status === 'rejected' && enrollment.rejectionReason && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Rejection Reason</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.rejectionReason}>{enrollment.rejectionReason}</Text>
            </View>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Rejection Reason Bottom Sheet */}
      <RejectionReasonBottomSheet
        ref={rejectionBottomSheetRef}
        onSubmit={handleSubmitRejection}
        onCancel={handleCancelRejection}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: spacing.md,
  },
  statusHeader: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
  },
  approvedHeader: {
    backgroundColor: colors.green[500],
  },
  pendingHeader: {
    // backgroundColor: colors.orange[500],
    paddingBottom: spacing.md,
  },
  rejectedHeader: {
    backgroundColor: colors.red[500],
  },
  statusHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xm,
  },
  statusHeaderIcon: {
    backgroundColor: `${colors.white}20`,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusHeaderText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  statusHeaderSubtext: {
    color: colors.white,
    fontSize: typography.sizes.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  approveButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xm,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  approveButtonText: {
    color: colors.green[500],
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },
  rejectButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: colors.red[500],
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  creatorInfo: {
    marginLeft: spacing.md,
  },
  creatorName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  creatorRole: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
    marginVertical: spacing.sm,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  campaignContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  campaignImage: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  campaignInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  campaignName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  campaignMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  campaignMetaItem: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  campaignMetaDot: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginHorizontal: spacing.xs,
  },
  orderScreenshotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderScreenshotText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  checkmarkContainer: {
    marginLeft: 'auto',
  },
  orderScreenshotImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  deliverableContainer: {
    marginBottom: spacing.md,
  },
  deliverableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deliverableType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deliverableTypeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  reviewContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  starContainer: {
    marginRight: spacing.xs,
  },
  starImage: {
    width: 16,
    height: 16,
  },
  verifiedBadge: {
    backgroundColor: colors.green[100],
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  verifiedText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.semibold,
    color: colors.green[500],
  },
  reviewText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  viewMoreText: {
    fontSize: typography.sizes.sm,
    color: colors.blue[500],
    fontWeight: typography.weights.semibold,
    marginHorizontal: spacing.xs,
  },
  instagramContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  instagramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  instagramAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  instagramUsername: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  instagramImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  instagramStats: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  instagramStat: {
    marginRight: spacing.md,
  },
  instagramStatIcon: {
    width: 24,
    height: 24,
  },
  instagramLikes: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  timelineContainer: {
    paddingVertical: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  timelineIconContainer: {
    alignItems: 'center',
  },
  timelineIcon: {
    width: 30,
    height: 30,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    marginBottom: -spacing.lg,
    marginLeft: -17, // Half of icon width + 2px for border
    backgroundColor: colors.gray[200],
  },
  timelineContent: {
    flex: 1,
    padding: spacing.sm,
    paddingHorizontal: spacing.xm,
    borderRadius: borderRadius.lg,
  },
  timelineHeader: {
    marginBottom: spacing.xs,
  },
  timelineLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  timelineDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  timelineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  timelineStatus: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  rejectionReasonContainer: {
    marginTop: spacing.sm,
    backgroundColor: colors.red[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  rejectionReasonLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.red[500],
    marginBottom: spacing.xs,
  },
  rejectionReasonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  rejectionReason: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 40,
  },
});

export default EnrollmentDetails;
