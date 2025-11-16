import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import { ArrowRight, CheckCircle, ClockCounterClockwise, Copy, Info } from 'phosphor-react-native';
import React from 'react';
import {
  Alert,
  Clipboard,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

// Payment type definition
type Payment = {
  id: string;
  amount: number;
  date: string;
  status: 'success' | 'pending' | 'failed';
};

export default function VirtualAccountScreen() {
  // Sample payment data
  const recentPayments: Payment[] = [
    {
      id: '1',
      amount: 25000,
      date: 'Apr 20, 2025',
      status: 'success',
    },
    {
      id: '2',
      amount: 18500,
      date: 'Apr 15, 2025',
      status: 'success',
    },
    {
      id: '3',
      amount: 32000,
      date: 'Apr 10, 2025',
      status: 'pending',
    },
  ];

  // Function to copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);

    // Show toast or alert based on platform
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${label} copied to clipboard`, ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', `${label} copied to clipboard`);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Virtual Account" showBackButton titleAlign="left" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Virtual Account Card */}
        <View style={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View>
              <Text style={styles.accountLabel}>Virtual Account</Text>
              <Text style={styles.bankName}>Axis Bank</Text>
            </View>
            <Image
              source={require('@/assets/images/axis-bank-logo.png')}
              style={styles.bankLogo}
              resizeMode="contain"
            />
          </View>

          {/* Account Holder */}
          <View style={styles.accountDetailSection}>
            <Text style={styles.detailLabel}>Account Holder</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>SHARKS MARKETING</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard('SHARKS MARKETING', 'Account holder name')}>
                <Copy size={18} color={colors.orange[500]} weight="fill" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Number */}
          <View style={styles.accountDetailSection}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>9190200530056789</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard('9190200530056789', 'Account number')}>
                <Copy size={18} color={colors.orange[500]} weight="fill" />
              </TouchableOpacity>
            </View>
          </View>

          {/* IFSC Code */}
          <View style={styles.accountDetailSection}>
            <Text style={styles.detailLabel}>IFSC Code</Text>
            <View style={styles.detailValueContainer}>
              <Text style={styles.detailValue}>UTIB0000001</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => copyToClipboard('UTIB0000001', 'IFSC code')}>
                <Copy size={18} color={colors.orange[500]} weight="fill" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Information Note */}
        <View style={styles.infoNote}>
          <Info size={20} color={colors.orange[500]} weight="fill" />
          <Text style={styles.infoText}>
            Use this virtual account to make invoice payments. Payments typically reflect within 30
            minutes during banking hours.
          </Text>
        </View>

        {/* Payment History Section */}
        <View style={styles.paymentHistoryHeader}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/(brand)/payment-history')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.paymentHistoryCard}>
          {recentPayments.map((payment, index) => (
            <View
              key={payment.id}
              style={[
                styles.paymentItem,
                index !== recentPayments.length - 1 && styles.paymentItemBorder,
              ]}>
              <View style={styles.paymentLeft}>
                {payment.status === 'success' ? (
                  <CheckCircle size={20} color={colors.green[500]} weight="fill" />
                ) : (
                  <ClockCounterClockwise size={20} color={colors.orange[500]} weight="fill" />
                )}
                <View>
                  <Text style={styles.paymentAmount}>₹{payment.amount.toLocaleString()}</Text>
                  <Text style={styles.paymentDate}>{payment.date}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.paymentStatus,
                  payment.status === 'success' ? styles.successStatus : styles.pendingStatus,
                ]}>
                {payment.status === 'success' ? 'Success' : 'Pending'}
              </Text>
            </View>
          ))}
        </View>

        {/* Additional Information */}
        <View style={styles.additionalInfo}>
          <Text style={styles.additionalInfoTitle}>Need Help?</Text>
          <Text style={styles.additionalInfoText}>
            If you have any questions about payments or your virtual account, please contact our
            support team.
          </Text>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => router.push('/contact-support')}>
            <Text style={styles.supportButtonText}>Contact Support</Text>
            <ArrowRight size={16} color={colors.blue[500]} weight="bold" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.mg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  backButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  accountCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.mg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accountLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
    fontWeight: typography.weights.medium,
  },
  bankName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  bankLogo: {
    width: 80,
    height: 30,
  },
  accountDetailSection: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.xm,
    backgroundColor: colors.gray[50],
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  detailValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  copyButton: {
    padding: spacing.xs,
  },
  infoNote: {
    flexDirection: 'row',
    backgroundColor: colors.orange[50],
    marginHorizontal: spacing.mg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.orange[100],
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.mg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.orange[500],
  },
  paymentHistoryCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.mg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  paymentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
  },
  paymentDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  paymentStatus: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  successStatus: {
    color: colors.green[600],
    backgroundColor: colors.green[50],
  },
  pendingStatus: {
    color: colors.orange[600],
    backgroundColor: colors.orange[50],
  },
  additionalInfo: {
    marginHorizontal: spacing.mg,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
    backgroundColor: colors.blue[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  additionalInfoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  additionalInfoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue[100],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.blue[200],
    gap: spacing.xs,
  },
  supportButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[700],
  },
});
