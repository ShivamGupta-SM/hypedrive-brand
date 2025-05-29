import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useLocalSearchParams } from 'expo-router';
import {
  ArrowUp,
  CaretDown,
  Clock,
  CurrencyCircleDollar,
  Star,
  Users,
} from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

// Reusable component for period selector dropdown
const PeriodSelector = ({
  period,
  setPeriod,
}: {
  period: string;
  setPeriod: (period: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectPeriod = (selectedPeriod: string) => {
    setPeriod(selectedPeriod);
    setIsOpen(false);
  };

  return (
    <View style={styles.periodSelectorContainer}>
      <TouchableOpacity style={styles.periodSelector} onPress={toggleDropdown}>
        <Text style={styles.periodText}>{period}</Text>
        <CaretDown size={16} color={colors.text.secondary} weight="bold" />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.periodDropdown}>
          <TouchableOpacity style={styles.periodOption} onPress={() => selectPeriod('Last 7 days')}>
            <Text style={styles.periodOptionText}>Last 7 days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.periodOption}
            onPress={() => selectPeriod('Last 30 days')}>
            <Text style={styles.periodOptionText}>Last 30 days</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.periodOption}
            onPress={() => selectPeriod('Last 90 days')}>
            <Text style={styles.periodOptionText}>Last 90 days</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Reusable stat card component
const StatCard = ({
  label,
  value,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  valueColor?: string;
}) => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>{icon}</View>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

// Influencer card component
const InfluencerCard = ({
  name,
  followers,
  value,
  percentage,
  avatar,
}: {
  name: string;
  followers: string;
  value: string;
  percentage: string;
  avatar: string;
}) => {
  const isPositive = percentage.startsWith('+');

  return (
    <View style={styles.influencerCard}>
      <View style={styles.influencerInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.influencerName}>{name}</Text>
          <Text style={styles.influencerFollowers}>{followers}</Text>
        </View>
      </View>
      <View style={styles.influencerStats}>
        <Text style={styles.influencerValue}>{value}</Text>
        <Text
          style={[
            styles.influencerPercentage,
            isPositive ? styles.positivePercentage : styles.negativePercentage,
          ]}>
          {percentage}
        </Text>
      </View>
    </View>
  );
};

// Timeline event component
const TimelineEvent = ({ title, time, color }: { title: string; time: string; color: string }) => {
  return (
    <View style={styles.timelineEvent}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineTime}>{time}</Text>
      </View>
    </View>
  );
};

// Financial summary row component
const FinancialRow = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => {
  return (
    <View style={styles.financialRow}>
      <Text style={styles.financialLabel}>{label}</Text>
      <Text style={[styles.financialValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
};

// Quality score component
const QualityScore = ({
  score,
  ratings,
}: {
  score: string;
  ratings: { label: string; percentage: number; color: string }[];
}) => {
  return (
    <View style={styles.qualityScoreContainer}>
      <View style={styles.scoreHeader}>
        <View>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>Average Score</Text>
        </View>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((_, index) => (
            <Star
              key={index}
              size={16}
              weight="fill"
              color={index < Math.floor(parseFloat(score)) ? colors.orange[500] : colors.gray[300]}
            />
          ))}
        </View>
      </View>
      <View style={styles.ratingsContainer}>
        {ratings.map((rating, index) => (
          <View key={index} style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>{rating.label}</Text>
            <View style={styles.ratingBarContainer}>
              <View
                style={[
                  styles.ratingBar,
                  { width: `${rating.percentage}%`, backgroundColor: rating.color },
                ]}
              />
            </View>
            <Text style={styles.ratingPercentage}>{rating.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function CampaignAnalytics() {
  const { campaignId } = useLocalSearchParams();
  const [period, setPeriod] = useState('Last 7 days');
  const screenWidth = Dimensions.get('window').width - spacing.md * 2;

  // Chart data
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [35, 45, 37, 55, 40, 43, 50],
        color: () => colors.blue[500],
        strokeWidth: 2,
      },
    ],
  };

  // Bar Chart data for enrollment trend
  const barChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [35, 45, 37, 55, 40, 43, 50],
        color: () => colors.orange[500],
      },
    ],
  };

  // Pie Chart data for distribution by status
  const pieChartData = [
    {
      name: 'Approved',
      population: 156,
      color: colors.gray[800],
      legendFontColor: colors.text.secondary,
      legendFontSize: 12,
    },
    {
      name: 'Pending',
      population: 85,
      color: colors.blue[500],
      legendFontColor: colors.text.secondary,
      legendFontSize: 12,
    },
    {
      name: 'Rejected',
      population: 45,
      color: colors.rose[500],
      legendFontColor: colors.text.secondary,
      legendFontSize: 12,
    },
    {
      name: 'Awaiting',
      population: 56,
      color: colors.gray[300],
      legendFontColor: colors.text.secondary,
      legendFontSize: 12,
    },
  ];

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: () => colors.blue[500],
    labelColor: () => colors.text.secondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '0',
      stroke: colors.blue[500],
    },
  };

  // Quality score ratings
  const ratings = [
    { label: 'Excellent', percentage: 65, color: colors.green[500] },
    { label: 'Good', percentage: 25, color: colors.blue[500] },
    { label: 'Average', percentage: 10, color: colors.orange[500] },
  ];

  const [refreshing, setRefreshing] = useState(false);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    console.log('Refreshing...');
    setRefreshing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      // In a real app, you would fetch new data here
      // For now, we'll just simulate the refresh
      setRefreshing(false);
      console.log('Refreshed!');
    }, 1500);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Order Value and Enrollment Cards */}
      <View style={styles.wideStatsGrid}>
        <View style={styles.statCardWide}>
          <View style={styles.statCardContent}>
            <Text style={styles.statLabel}>Total Order Value</Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>₹24.2L</Text>
              <View style={styles.percentageContainer}>
                <ArrowUp size={12} weight="bold" color={colors.green[500]} />
                <Text style={styles.percentageText}>18.4% vs last month</Text>
              </View>
            </View>
          </View>
          <View style={styles.statCardIcon}>
            <CurrencyCircleDollar size={24} weight="fill" color={colors.orange[500]} />
          </View>
        </View>

        <View style={styles.statCardWide}>
          <View style={styles.statCardContent}>
            <Text style={styles.statLabel}>Total Enrollments</Text>
            <View style={styles.statValueRow}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>342</Text>
              <View style={styles.percentageContainer}>
                <ArrowUp size={12} weight="bold" color={colors.green[500]} />
                <Text style={styles.percentageText}>12.8% vs last month</Text>
              </View>
            </View>
          </View>
          <View style={styles.statCardIcon}>
            <Users size={24} weight="fill" color={colors.orange[500]} />
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <StatCard
          label="Enrollments"
          value="124"
          icon={<Users size={20} weight="fill" color={colors.orange[500]} />}
        />
        <StatCard
          label="Completion Rate"
          value="79%"
          valueColor={colors.green[500]}
          icon={<Clock size={20} weight="fill" color={colors.green[500]} />}
        />
        <StatCard
          label="Avg Time"
          value="4.2d"
          icon={<Clock size={20} weight="fill" color={colors.blue[500]} />}
        />
        <StatCard
          label="Total Spend"
          value="₹1.2L"
          valueColor={colors.orange[500]}
          icon={<CurrencyCircleDollar size={20} weight="fill" color={colors.orange[500]} />}
        />
      </View>

      {/* Weekly Chart Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weekly Orders</Text>
          <PeriodSelector period={period} setPeriod={setPeriod} />
        </View>

        <LineChart
          data={chartData}
          width={screenWidth - spacing.md * 2}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Top Influencers Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Influencers</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <InfluencerCard
          name="Sarah Johnson"
          followers="324K followers"
          value="₹2.8L"
          percentage="+12.4%"
          avatar=""
        />
        <InfluencerCard
          name="Mike Chen"
          followers="256K followers"
          value="₹1.9L"
          percentage="+8.7%"
          avatar=""
        />
      </View>

      {/* Engagement Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Engagement</Text>
        <View style={styles.engagementContainer}>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementValue}>12,800</Text>
            <Text style={styles.engagementLabel}>Views</Text>
          </View>
          <View style={styles.engagementItem}>
            <Text style={[styles.engagementValue, { color: colors.orange[500] }]}>33.7%</Text>
            <Text style={styles.engagementLabel}>CTR</Text>
          </View>
        </View>
      </View>

      {/* Financial Summary Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <FinancialRow label="Rebate Amount" value="₹1,04,020" />
        <FinancialRow label="Bonuses Paid" value="₹6,700" valueColor={colors.green[500]} />
        <FinancialRow label="Platform Fees" value="₹10,630" valueColor={colors.orange[500]} />
        <View style={styles.divider} />
        <FinancialRow label="Total Amount" value="₹1,21,350" />
      </View>

      {/* Enrollment Trend Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Enrollment Trend</Text>
          <PeriodSelector period={period} setPeriod={setPeriod} />
        </View>

        <BarChart
          data={barChartData}
          width={screenWidth - spacing.md * 2}
          height={220}
          chartConfig={{
            ...chartConfig,
            color: () => colors.orange[500],
            barPercentage: 0.7,
            fillShadowGradientFrom: colors.orange[500],
            fillShadowGradientTo: colors.orange[500],
            fillShadowGradientOpacity: 1,
          }}
          style={styles.chart}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>

      {/* Distribution by Status Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distribution by Status</Text>
          <Text style={styles.totalText}>342 Total</Text>
        </View>

        <View style={styles.pieChartContainer}>
          <View style={styles.pieChartWrapper}>
            <PieChart
              data={pieChartData}
              width={screenWidth - spacing.md * 2}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
              hasLegend={false}
              center={[screenWidth / 4, 0]}
            />
            <View style={styles.pieChartCenter}>
              <Text style={styles.pieChartCenterValue}>45.6%</Text>
              <Text style={styles.pieChartCenterLabel}>Approved</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusLegendContainer}>
          <View style={styles.statusLegendRow}>
            <View style={styles.statusLegendItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.gray[800] }]} />
              <Text style={styles.statusLabel}>Approved</Text>
              <Text style={styles.statusValue}>156 (45.6%)</Text>
            </View>
            <View style={styles.statusLegendItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.blue[500] }]} />
              <Text style={styles.statusLabel}>Pending</Text>
              <Text style={styles.statusValue}>85 (24.9%)</Text>
            </View>
          </View>
          <View style={styles.statusLegendRow}>
            <View style={styles.statusLegendItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.rose[500] }]} />
              <Text style={styles.statusLabel}>Rejected</Text>
              <Text style={styles.statusValue}>45 (13.2%)</Text>
            </View>
            <View style={styles.statusLegendItem}>
              <View style={[styles.statusDot, { backgroundColor: colors.gray[300] }]} />
              <Text style={styles.statusLabel}>Awaiting</Text>
              <Text style={styles.statusValue}>56 (16.3%)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quality Score Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quality Score</Text>
        <QualityScore score="4.3" ratings={ratings} />
      </View>

      {/* Campaign Timeline Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Campaign Timeline</Text>
        <View style={styles.timelineContainer}>
          <TimelineEvent
            title="Campaign Started"
            time="Aug 15, 2023 - 10:00 AM"
            color={colors.green[500]}
          />
          <TimelineEvent
            title="First Enrollment"
            time="Aug 15, 2023 - 11:30 AM"
            color={colors.blue[500]}
          />
          <TimelineEvent
            title="Invoice Generated"
            time="Aug 20, 2023 - 08:00 PM"
            color={colors.orange[500]}
          />
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    columnGap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    width: `48%`,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    // marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  wideStatsGrid: {
    flexDirection: 'column',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  statCardWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardContent: {
    flex: 1,
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  percentageText: {
    fontSize: typography.sizes.xs,
    color: colors.green[500],
    marginLeft: 2,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  periodSelectorContainer: {
    position: 'relative',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  periodText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  periodDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
    width: 150,
  },
  periodOption: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  periodOptionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  totalText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  pieChartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  pieChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -20 }],
  },
  pieChartCenterValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  pieChartCenterLabel: {
    fontSize: typography.sizes.xs,
    color: colors.white,
  },
  statusLegendContainer: {
    marginTop: spacing.md,
  },
  statusLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statusLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  statusLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  statusValue: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  seeAllText: {
    fontSize: typography.sizes.xs,
    color: colors.orange[500],
    fontWeight: typography.weights.semibold,
  },
  influencerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  influencerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  influencerName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  influencerFollowers: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  influencerStats: {
    alignItems: 'flex-end',
  },
  influencerValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  influencerPercentage: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  positivePercentage: {
    color: colors.green[500],
  },
  negativePercentage: {
    color: colors.red[500],
  },
  engagementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  engagementItem: {
    width: '48%',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  engagementValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  engagementLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  financialLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  financialValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.sm,
  },
  qualityScoreContainer: {
    marginTop: spacing.sm,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingsContainer: {
    marginTop: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingLabel: {
    width: 70,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.sm,
  },
  ratingBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  ratingPercentage: {
    width: 30,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'right',
  },
  timelineContainer: {
    marginTop: spacing.sm,
  },
  timelineEvent: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: spacing.sm,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  timelineTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});
