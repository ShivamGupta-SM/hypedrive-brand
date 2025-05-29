import PaidStamp from '@/components/payment/PaidStamp';
import StatusBadge from '@/components/payment/StatusBadge';
import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useLocalSearchParams } from 'expo-router';
import { Calendar, Copy, Download, FileText, Share } from 'phosphor-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Invoice = {
  id: string;
  amount: number;
  generatedDate: string;
  dueDate: string;
  status: string;
  paidDate: string;
  client: {
    name: string;
    gstin: string;
  };
  items: {
    name: string;
    description: string;
    amount: number;
  }[];
  subtotal: number;
  gst: number;
  tds: number;
  total: number;
  paymentDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string;
  };
};

// Sample invoice data
const invoiceData: Invoice[] = [
  {
    id: 'INV-2025-04-001',
    amount: 19764,
    generatedDate: 'Mar 10, 2025',
    dueDate: 'Mar 15, 2025',
    status: 'paid',
    paidDate: 'Mar 12, 2025',
    client: {
      name: 'Nike India Pvt. Ltd.',
      gstin: '29AABCU9603R1ZJ',
    },
    items: [
      {
        name: 'Product Promotion',
        description: 'Campaign Services',
        amount: 10000,
      },
      {
        name: 'Platform Fee',
        description: 'Monthly Subscription',
        amount: 8000,
      },
    ],
    subtotal: 18000,
    gst: 3564, // 18% of subtotal
    tds: -1800, // 10% of subtotal
    total: 19764,
    paymentDetails: {
      bankName: 'HDFC BANK',
      accountName: 'Hypedrive Technologies Pvt Ltd',
      accountNumber: '1234 5678 9012 3456',
      ifscCode: 'HDFC0001234',
    },
  },
  {
    id: 'INV-2025-04-002',
    amount: 19764,
    generatedDate: 'Mar 10, 2025',
    dueDate: 'Mar 15, 2025',
    status: 'pending',
    paidDate: 'Mar 12, 2025',
    client: {
      name: 'Nike India Pvt. Ltd.',
      gstin: '29AABCU9603R1ZJ',
    },
    items: [
      {
        name: 'Product Promotion',
        description: 'Campaign Services',
        amount: 10000,
      },
      {
        name: 'Platform Fee',
        description: 'Monthly Subscription',
        amount: 8000,
      },
    ],
    subtotal: 18000,
    gst: 3564, // 18% of subtotal
    tds: -1800, // 10% of subtotal
    total: 19764,
    paymentDetails: {
      bankName: 'HDFC BANK',
      accountName: 'Hypedrive Technologies Pvt Ltd',
      accountNumber: '1234 5678 9012 3456',
      ifscCode: 'HDFC0001234',
    },
  },
];

const InvoiceDetails = () => {
  const { invoiceId } = useLocalSearchParams();
  const id = typeof invoiceId === 'string' ? invoiceId : '';

  // Get invoice data based on ID
  const invoice = invoiceData.find(invoice => invoice.id === id) || null;

  // State for action buttons
  const [loading, setLoading] = useState({
    excel: false,
    pdf: false,
  });

  if (!invoice) {
    return (
      <View style={styles.container}>
        <AppHeader title="Invoice Details" showBackButton titleAlign="left" />
        <View style={styles.centerContent}>
          <Text>Invoice not found</Text>
        </View>
      </View>
    );
  }

  // Handle export to Excel
  const handleExportExcel = () => {
    setLoading({ ...loading, excel: true });

    // Simulate export process
    setTimeout(() => {
      setLoading({ ...loading, excel: false });
      Alert.alert('Success', 'Invoice exported to Excel successfully');
    }, 1500);
  };

  // Handle download PDF
  const handleDownloadPDF = () => {
    setLoading({ ...loading, pdf: true });

    // Simulate download process
    setTimeout(() => {
      setLoading({ ...loading, pdf: false });
      Alert.alert('Success', 'Invoice PDF downloaded successfully');
    }, 1500);
  };

  // Handle share invoice
  const handleShare = () => {
    Alert.alert('Share', 'Invoice sharing functionality will be implemented here');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Invoice Details"
        showBackButton
        titleAlign="left"
        rightContent={
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share size={22} color={colors.text.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.invoiceCard}>
          {/* Paid stamp overlay for paid invoices */}
          {invoice.status === 'paid' && <PaidStamp />}

          {/* Invoice Header */}
          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
            <Text style={styles.invoiceSubtitle}>Original for Recipient</Text>
            <Text style={styles.computerGenerated}>* This is a computer generated invoice *</Text>
          </View>

          {/* Company Info */}
          <View style={styles.companyInfo}>
            <View style={styles.companyLogo}>
              <Text style={styles.logoText}>100 × 35</Text>
            </View>
            <View style={styles.companyDetails}>
              <Text style={styles.companyName}>Hypedrive Technologies Pvt Ltd</Text>
              <Text style={styles.companyAddress}>123 Business Park, Bangalore</Text>
            </View>
          </View>

          {/* Invoice Number and Status */}
          <View style={styles.invoiceNumberRow}>
            <View>
              <Text style={styles.invoiceId}>#{invoice.id}</Text>
              <View style={styles.invoiceDateRow}>
                <Calendar size={14} color={colors.text.secondary} />
                <Text style={styles.invoiceDate}>Generated: {invoice.generatedDate}</Text>
              </View>
              <View style={styles.invoiceDateRow}>
                <Calendar size={14} color={colors.text.secondary} />
                <Text style={styles.invoiceDate}>Due: {invoice.dueDate}</Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <StatusBadge status={invoice.status === 'paid' ? 'fully-paid' : 'pending'} />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExportExcel}
              disabled={loading.excel}>
              <FileText size={18} color={colors.green[500]} />
              <Text style={styles.actionButtonText}>
                {loading.excel ? 'Exporting...' : 'Export Excel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownloadPDF}
              disabled={loading.pdf}>
              <Download size={18} color={colors.green[500]} />
              <Text style={styles.actionButtonText}>
                {loading.pdf ? 'Downloading...' : 'Download'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Client Information */}
          <View style={styles.clientSection}>
            <Text style={styles.clientName}>{invoice.client.name}</Text>
            <Text style={styles.clientGstin}>@ GSTIN: {invoice.client.gstin}</Text>
          </View>

          {/* Invoice Items */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>ITEMS ({invoice.items.length})</Text>

            {invoice.items.map((item, index) => (
              <View key={index} style={styles.invoiceItem}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
                <Text style={styles.itemAmount}>₹{item.amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          {/* Invoice Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{invoice.subtotal.toLocaleString()}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryValue}>₹{invoice.gst.toLocaleString()}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.rose[500] }]}>TDS (10%)</Text>
              <Text style={[styles.summaryValue, { color: colors.rose[500] }]}>
                -₹{Math.abs(invoice.tds).toLocaleString()}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{invoice.total.toLocaleString()}</Text>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.paymentDetailsSection}>
            <Text style={styles.paymentDetailsTitle}>PAYMENT DETAILS</Text>

            <View style={styles.bankDetails}>
              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Bank Name</Text>
                <View style={styles.bankDetailValueContainer}>
                  <Text style={styles.bankDetailValue}>{invoice.paymentDetails.bankName}</Text>
                  <TouchableOpacity style={styles.copyButton}>
                    <Copy size={14} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Account Name</Text>
                <View style={styles.bankDetailValueContainer}>
                  <Text style={styles.bankDetailValue}>{invoice.paymentDetails.accountName}</Text>
                  <TouchableOpacity style={styles.copyButton}>
                    <Copy size={14} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>Account Number</Text>
                <View style={styles.bankDetailValueContainer}>
                  <Text style={styles.bankDetailValue}>{invoice.paymentDetails.accountNumber}</Text>
                  <TouchableOpacity style={styles.copyButton}>
                    <Copy size={14} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bankDetailRow}>
                <Text style={styles.bankDetailLabel}>IFSC Code</Text>
                <View style={styles.bankDetailValueContainer}>
                  <Text style={styles.bankDetailValue}>{invoice.paymentDetails.ifscCode}</Text>
                  <TouchableOpacity style={styles.copyButton}>
                    <Copy size={14} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for your business!</Text>
            <Text style={styles.footerText}>* * * End of Invoice * * *</Text>
          </View>
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
  shareButton: {
    padding: spacing.xs,
  },
  invoiceCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative', // For the paid stamp
    overflow: 'hidden', // To clip the paid stamp
  },
  invoiceHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  invoiceTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  invoiceSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
  computerGenerated: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  companyInfo: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  companyLogo: {
    width: 100,
    height: 35,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  logoText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  companyDetails: {},
  companyName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  companyAddress: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  invoiceNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  invoiceId: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  invoiceDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs / 2,
  },
  invoiceDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginLeft: spacing.xs / 2,
  },
  statusContainer: {},
  actionButtons: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.sizes.xs,
    color: colors.green[500],
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs / 2,
  },
  clientSection: {
    marginBottom: spacing.md,
  },
  clientName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  clientGstin: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  itemsSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  itemDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  itemAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  summarySection: {
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  paymentDetailsSection: {
    marginBottom: spacing.md,
  },
  paymentDetailsTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  bankDetails: {},
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  bankDetailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  bankDetailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankDetailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  copyButton: {
    padding: spacing.xs,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
});

export default InvoiceDetails;
