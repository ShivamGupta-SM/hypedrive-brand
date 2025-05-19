import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, FileText } from 'phosphor-react-native';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Invoice type definition
type Invoice = {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
};

const Invoices = () => {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  // Sample invoice data
  const invoices: Invoice[] = [
    {
      id: 'INV-2025001',
      amount: 12500,
      dueDate: 'Mar 15, 2025',
      status: 'pending',
    },
    {
      id: 'INV-2025002',
      amount: 8900,
      dueDate: 'Mar 10, 2025',
      status: 'paid',
      paidDate: 'Mar 10, 2025',
    },
    {
      id: 'INV-2025003',
      amount: 15800,
      dueDate: 'Mar 20, 2025',
      status: 'overdue',
    },
  ];

  // Filter invoices based on active filter
  const filteredInvoices =
    activeFilter === 'all' ? invoices : invoices.filter(invoice => invoice.status === activeFilter);

  // Calculate totals
  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Custom Header with Safe Area handling */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={colors.black} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>1</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Total Outstanding Card */}
        <LinearGradient
          colors={['#EA590D', '#FF9A3D']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.totalCard}>
          <View style={styles.totalHeaderRow}>
            <View style={styles.totalHeaderIcon}>
              <FileText size={20} color={colors.white} weight="regular" />
            </View>
            <Text style={styles.totalHeaderText}>Total Outstanding</Text>
          </View>

          <Text style={styles.totalAmount}>₹{totalOutstanding.toLocaleString()}</Text>

          <View style={styles.totalBreakdownRow}>
            <View style={styles.totalBreakdownItem}>
              <Text style={styles.breakdownLabel}>Pending</Text>
              <Text style={styles.breakdownAmount}>₹{pendingAmount.toLocaleString()}</Text>
            </View>

            <View style={styles.totalBreakdownItem}>
              <Text style={styles.breakdownLabel}>Overdue</Text>
              <Text style={styles.breakdownAmount}>₹{overdueAmount.toLocaleString()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
              onPress={() => setActiveFilter('all')}>
              <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
                All Invoices
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'pending' && styles.filterTabActive]}
              onPress={() => setActiveFilter('pending')}>
              <View style={styles.statusDot} />
              <Text
                style={[styles.filterText, activeFilter === 'pending' && styles.filterTextActive]}>
                Pending
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'paid' && styles.filterTabActive]}
              onPress={() => setActiveFilter('paid')}>
              <View style={[styles.statusDot, styles.paidDot]} />
              <Text style={[styles.filterText, activeFilter === 'paid' && styles.filterTextActive]}>
                Paid
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'overdue' && styles.filterTabActive]}
              onPress={() => setActiveFilter('overdue')}>
              <View style={[styles.statusDot, styles.overdueDot]} />
              <Text
                style={[styles.filterText, activeFilter === 'overdue' && styles.filterTextActive]}>
                Overdue
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Invoice List */}
        <View style={styles.invoiceList}>
          {filteredInvoices.map(invoice => (
            <View key={invoice.id} style={styles.invoiceItem}>
              <View style={styles.invoiceIconContainer}>
                <View
                  style={[
                    styles.invoiceIcon,
                    invoice.status === 'paid' && styles.paidIcon,
                    invoice.status === 'overdue' && styles.overdueIcon,
                  ]}>
                  <FileText
                    size={20}
                    color={
                      invoice.status === 'pending'
                        ? colors.orange[500]
                        : invoice.status === 'paid'
                          ? colors.green[500]
                          : invoice.status === 'overdue'
                            ? colors.rose[500]
                            : colors.text.primary
                    }
                    weight="fill"
                  />
                </View>
              </View>

              <View style={styles.invoiceDetails}>
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceId}>{invoice.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      invoice.status === 'pending' && styles.pendingBadge,
                      invoice.status === 'paid' && styles.paidBadge,
                      invoice.status === 'overdue' && styles.overdueBadge,
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        invoice.status === 'pending' && styles.pendingText,
                        invoice.status === 'paid' && styles.paidText,
                        invoice.status === 'overdue' && styles.overdueText,
                      ]}>
                      {invoice.status === 'pending'
                        ? 'Pending'
                        : invoice.status === 'paid'
                          ? 'Paid'
                          : 'Overdue'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.invoiceDateLabel}>
                  {invoice.status === 'paid' ? 'Paid: ' : 'Due: '}
                  {invoice.status === 'paid' ? invoice.paidDate : invoice.dueDate}
                </Text>

                <View style={styles.invoiceAmountRow}>
                  <Text style={styles.invoiceAmountLabel}>
                    {invoice.status === 'paid' ? 'Amount Paid' : 'Amount Due'}
                  </Text>
                  <Text style={styles.invoiceAmount}>₹{invoice.amount.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Invoices;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.rose[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.white,
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
  filterContainer: {
    marginBottom: spacing.md,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  filterTabActive: {
    backgroundColor: colors.orange[500],
    color: colors.white,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange[500],
    marginRight: spacing.xs,
  },
  paidDot: {
    backgroundColor: colors.green[500],
  },
  overdueDot: {
    backgroundColor: colors.red[500],
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semibold,
  },
  invoiceList: {
    paddingHorizontal: spacing.md,
  },
  invoiceItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  invoiceIconContainer: {
    marginRight: spacing.md,
  },
  invoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.orange[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidIcon: {
    backgroundColor: colors.green[100],
  },
  overdueIcon: {
    backgroundColor: colors.red[100],
  },
  invoiceDetails: {
    flex: 1,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  invoiceId: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[100],
    borderWidth: 1,
  },
  pendingBadge: {
    backgroundColor: colors.orange[100],
    borderColor: colors.orange[200],
  },
  paidBadge: {
    backgroundColor: colors.green[100],
    borderColor: colors.green[200],
  },
  overdueBadge: {
    backgroundColor: colors.rose[50],
    borderColor: colors.rose[200],
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  pendingText: {
    color: colors.orange[500],
  },
  paidText: {
    color: colors.green[500],
  },
  overdueText: {
    color: colors.rose[500],
  },
  invoiceDateLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.md,
  },
  invoiceAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceAmountLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  invoiceAmount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
});
