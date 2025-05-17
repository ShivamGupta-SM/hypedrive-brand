import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Clipboard,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ClockCounterClockwise,
  Copy,
} from 'phosphor-react-native';

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
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Virtual Account</Text>
        <View style={{ width: 24 }} />
      </View>
      
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
                onPress={() => copyToClipboard('SHARKS MARKETING', 'Account holder name')}
              >
                <Copy size={18} color={colors.orange[500]} weight="bold" />
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
                onPress={() => copyToClipboard('9190200530056789', 'Account number')}
              >
                <Copy size={18} color={colors.orange[500]} weight="bold" />
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
                onPress={() => copyToClipboard('UTIB0000001', 'IFSC code')}
              >
                <Copy size={18} color={colors.orange[500]} weight="bold" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Information Note */}
        <View style={styles.infoNote}>
          <View style={styles.infoIconContainer}>
            <ClockCounterClockwise size={20} color={colors.white} weight="fill" />
          </View>
          <Text style={styles.infoText}>
            Use this virtual account to make invoice payments. Payments typically reflect within 30 minutes during banking hours.
          </Text>
        </View>
        
        {/* Payment History Section */}
        <View style={styles.paymentHistoryHeader}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push('/(brand)/payment-history')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.paymentHistoryCard}>
          {recentPayments.map((payment, index) => (
            <View 
              key={payment.id} 
              style={[
                styles.paymentItem,
                index !== recentPayments.length - 1 && styles.paymentItemBorder
              ]}
            >
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
                  payment.status === 'success' ? styles.successStatus : styles.pendingStatus
                ]}
              >
                {payment.status === 'success' ? 'Success' : 'Pending'}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Additional Information */}
        <View style={styles.additionalInfo}>
          <Text style={styles.additionalInfoTitle}>Need Help?</Text>
          <Text style={styles.additionalInfoText}>
            If you have any questions about payments or your virtual account, please contact our support team.
          </Text>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={() => router.push('/help-center')}
          >
            <Text style={styles.supportButtonText}>Contact Support</Text>
            <ArrowRight size={16} color={colors.blue[500]} weight="bold" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  bankName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  bankLogo: {
    width: 80,
    height: 30,
  },
  accountDetailSection: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
  detailValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
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
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
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
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.blue[100],
    gap: spacing.xs,
  },
  supportButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.blue[500],
  },
});