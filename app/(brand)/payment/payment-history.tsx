import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowRight, CheckCircle, Wallet } from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Payment type definition
type Payment = {
  id: string;
  amount: number;
  date: string;
  time: string;
  invoiceCount: number;
};

const PaymentHistory = () => {
  // Sample payment data grouped by time periods
  const payments = {
    today: [
      {
        id: 'HYP25042201',
        amount: 75000,
        date: 'Apr 22, 2025',
        time: '10:30 AM',
        invoiceCount: 3,
      },
    ],
    yesterday: [
      {
        id: 'HYP25042101',
        amount: 120000,
        date: 'Apr 21, 2025',
        time: '3:45 PM',
        invoiceCount: 3,
      },
    ],
    thisWeek: [
      {
        id: 'HYP25041801',
        amount: 95000,
        date: 'Apr 18, 2025',
        time: '11:20 AM',
        invoiceCount: 4,
      },
    ],
  };

  // Calculate totals
  const totalPayments = Object.values(payments)
    .flat()
    .reduce((sum, payment) => sum + payment.amount, 0);

  const thisMonthPayments = 75000; // Hardcoded for demo
  const lastMonthPayments = 215000; // Hardcoded for demo

  // Render a payment item
  const renderPaymentItem = (payment: Payment) => (
    <TouchableOpacity
      key={payment.id}
      style={styles.paymentItem}
      onPress={() => router.push(`/(brand)/payment/${payment.id}`)}>
      <View style={styles.paymentIconContainer}>
        <View style={styles.paymentIcon}>
          <ArrowRight size={20} weight="bold" color={colors.green[500]} />
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentId}>{payment.id}</Text>
          <Text style={styles.paymentAmount}>₹{payment.amount.toLocaleString()}</Text>
        </View>

        <Text style={styles.paymentDateLabel}>
          {payment.date} • {payment.time}
        </Text>

        <View style={styles.paymentInfoRow}>
          <CheckCircle size={14} color={colors.green[500]} weight="fill" />
          <Text style={styles.paymentAppliedText}>Applied to {payment.invoiceCount} invoices</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <AppHeader
        title="Payment History"
        showNotification
        notificationCount={1}
        showBackButton
        onNotificationPress={() => router.push('/(brand)/notifications')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Total Payments Card */}
        <LinearGradient
          colors={['#F97316', '#FDBA74']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.totalCard}>
          <View style={styles.totalHeaderRow}>
            <View style={styles.totalHeaderIcon}>
              <Wallet size={20} color={colors.white} weight="fill" />
            </View>
            <Text style={styles.totalHeaderText}>Total Payments</Text>
          </View>

          <Text style={styles.totalAmount}>₹{totalPayments.toLocaleString()}</Text>

          <View style={styles.totalBreakdownRow}>
            <View style={styles.totalBreakdownItem}>
              <Text style={styles.breakdownLabel}>This Month</Text>
              <Text style={styles.breakdownAmount}>₹{thisMonthPayments.toLocaleString()}</Text>
            </View>

            <View style={styles.totalBreakdownItem}>
              <Text style={styles.breakdownLabel}>Last Month</Text>
              <Text style={styles.breakdownAmount}>₹{lastMonthPayments.toLocaleString()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Today's Payments */}
        {payments.today.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Today</Text>
            {payments.today.map(renderPaymentItem)}
          </View>
        )}

        {/* Yesterday's Payments */}
        {payments.yesterday.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Yesterday</Text>
            {payments.yesterday.map(renderPaymentItem)}
          </View>
        )}

        {/* This Week's Payments */}
        {payments.thisWeek.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>This Week</Text>
            {payments.thisWeek.map(renderPaymentItem)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PaymentHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl * 3,
  },
  totalCard: {
    margin: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  totalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalHeaderIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  totalHeaderText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  totalAmount: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.white,
    marginBottom: spacing.md,
  },
  totalBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  totalBreakdownItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  breakdownLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  breakdownAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  sectionContainer: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  paymentItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  paymentIconContainer: {
    marginRight: spacing.md,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.green[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  paymentId: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  paymentAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  paymentDateLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  paymentInfoRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  paymentAppliedText: {
    fontSize: typography.sizes.xs,
    color: colors.green[500],
    fontWeight: typography.weights.semibold,
  },
});
