import InfoRow from '@/components/payment/InfoRow';
import StatusBadge from '@/components/payment/StatusBadge';
import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Bank, CalendarBlank, CheckCircle, FileText } from 'phosphor-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Sample payment data
const paymentData = {
  HYP25042201: {
    id: 'HYP25042201',
    amount: 75000,
    date: 'Apr 22, 2025',
    time: '10:30 AM',
    status: 'completed',
    method: 'Virtual Account Transfer',
    invoices: [
      {
        id: 'INV-2025-04-001',
        amount: 25000,
        date: 'Apr 15, 2025',
        status: 'fully-paid',
      },
      {
        id: 'INV-2025-04-002',
        amount: 30000,
        date: 'Apr 16, 2025',
        status: 'fully-paid',
      },
      {
        id: 'INV-2025-04-003',
        amount: 20000,
        date: 'Apr 17, 2025',
        status: 'partially-paid',
      },
    ],
  },
  HYP25042101: {
    id: 'HYP25042101',
    amount: 120000,
    date: 'Apr 21, 2025',
    time: '3:45 PM',
    status: 'completed',
    method: 'Bank Transfer',
    invoices: [
      {
        id: 'INV/2025/04/004',
        amount: 45000,
        date: 'Apr 14, 2025',
        status: 'fully-paid',
      },
      {
        id: 'INV/2025/04/005',
        amount: 75000,
        date: 'Apr 15, 2025',
        status: 'fully-paid',
      },
    ],
  },
};

const PaymentDetails = () => {
  const { paymentId } = useLocalSearchParams();
  const id = typeof paymentId === 'string' ? paymentId : '';

  // Get payment data based on ID
  const payment = paymentData[id] || null;

  if (!payment) {
    return (
      <View style={styles.container}>
        <AppHeader title="Payment Details" showBackButton titleAlign="left" />
        <View style={styles.centerContent}>
          <Text>Payment not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Payment Details" showBackButton titleAlign="left" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Payment ID */}
          <InfoRow
            label="Payment ID"
            value={payment.id}
            rightComponent={
              <View style={styles.transferIcon}>
                <ArrowRight size={20} weight="bold" color={colors.green[500]} />
              </View>
            }
          />

          {/* Amount */}
          <InfoRow
            icon={<Text style={styles.rupeeIcon}>₹</Text>}
            label="Amount"
            value={`₹${payment.amount.toLocaleString()}`}
          />

          {/* Date & Time */}
          <InfoRow
            icon={<CalendarBlank size={20} color={colors.text.secondary} />}
            label="Date & Time"
            value={`${payment.date} • ${payment.time}`}
          />

          {/* Status */}
          <InfoRow
            icon={<CheckCircle size={20} color={colors.green[500]} />}
            label="Status"
            rightComponent={<StatusBadge status={payment.status} />}
            value=""
          />

          {/* Payment Method */}
          <InfoRow
            icon={<Bank size={20} color={colors.text.secondary} />}
            label="Payment Method"
            value={payment.method}
            containerStyle={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Applied to Invoices Section */}
        <View style={styles.invoicesSection}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={colors.text.secondary} />
            <Text style={styles.sectionTitle}>Applied to Invoices</Text>
          </View>

          {payment.invoices.map((invoice, index) => (
            <TouchableOpacity
              key={invoice.id}
              style={[
                styles.invoiceItem,
                index === payment.invoices.length - 1 ? { borderBottomWidth: 0 } : null,
              ]}
              onPress={() => router.push(`/(brand)/invoices/${invoice.id}`)}>
              <View style={styles.invoiceDetails}>
                <View style={styles.invoiceHeader}>
                  <FileText size={16} color={colors.text.secondary} />
                  <Text style={styles.invoiceId}>{invoice.id}</Text>
                </View>
                <Text style={styles.invoiceDate}>{invoice.date}</Text>
              </View>

              <View style={styles.invoiceRight}>
                <Text style={styles.invoiceAmount}>₹{invoice.amount.toLocaleString()}</Text>
                <StatusBadge status={invoice.status} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transferIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.green[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  rupeeIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  invoicesSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  invoiceDetails: {
    flex: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  invoiceId: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  invoiceDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: 24, // To align with the icon
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
});

export default PaymentDetails;
