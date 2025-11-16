import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import { FileText } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StatusBadge from './StatusBadge';

type InvoiceItemProps = {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'fully-paid' | 'partially-paid';
};

/**
 * A reusable component for displaying an invoice item in a list
 */
const InvoiceItem = ({ id, amount, date, status }: InvoiceItemProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/(brand)/invoices/${id}`)}>
      <View style={styles.iconContainer}>
        <FileText size={20} color={colors.text.secondary} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.id}>{id}</Text>
          <Text style={styles.amount}>₹{amount.toLocaleString()}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.date}>{date}</Text>
          <StatusBadge status={status} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  id: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  amount: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});

export default InvoiceItem;
