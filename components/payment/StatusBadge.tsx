import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type StatusType = 'completed' | 'pending' | 'failed' | 'partially-paid' | 'fully-paid';

type StatusBadgeProps = {
  status: StatusType;
};

/**
 * A reusable status badge component that displays different styles based on status
 */
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          backgroundColor: colors.green[100],
          borderColor: colors.green[200],
          textColor: colors.green[500],
          label: 'Completed',
        };
      case 'pending':
        return {
          backgroundColor: colors.orange[100],
          borderColor: colors.orange[200],
          textColor: colors.orange[500],
          label: 'Pending',
        };
      case 'failed':
        return {
          backgroundColor: colors.rose[50],
          borderColor: colors.rose[200],
          textColor: colors.rose[500],
          label: 'Failed',
        };
      case 'partially-paid':
        return {
          backgroundColor: colors.orange[100],
          borderColor: colors.orange[200],
          textColor: colors.orange[500],
          label: 'Partially Paid',
        };
      case 'fully-paid':
        return {
          backgroundColor: colors.green[100],
          borderColor: colors.green[200],
          textColor: colors.green[500],
          label: 'Fully Paid',
        };
      default:
        return {
          backgroundColor: colors.gray[100],
          borderColor: colors.gray[200],
          textColor: colors.text.secondary,
          label: status,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
      ]}>
      <Text style={[styles.text, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});

export default StatusBadge;
