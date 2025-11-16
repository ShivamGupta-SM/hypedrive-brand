import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type StatusType = 'approved' | 'pending_review' | 'rejected' | 'completed' | 'partially-paid' | 'fully-paid';

type StatusBadgeProps = {
  status: StatusType;
  containerStyle?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
};

const StatusBadge = ({ status, containerStyle, size = 'medium' }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          backgroundColor: colors.green[100],
          textColor: colors.green[500],
          label: 'Approved',
        };
      case 'pending_review':
        return {
          backgroundColor: colors.orange[100],
          textColor: colors.orange[500],
          label: 'Pending Review',
        };
      case 'rejected':
        return {
          backgroundColor: colors.red[100],
          textColor: colors.red[500],
          label: 'Rejected',
        };
      case 'completed':
        return {
          backgroundColor: colors.green[100],
          textColor: colors.green[500],
          label: 'Completed',
        };
      case 'partially-paid':
        return {
          backgroundColor: colors.blue[100],
          textColor: colors.blue[500],
          label: 'Partially Paid',
        };
      case 'fully-paid':
        return {
          backgroundColor: colors.green[100],
          textColor: colors.green[500],
          label: 'Fully Paid',
        };
      default:
        return {
          backgroundColor: colors.gray[100],
          textColor: colors.text.secondary,
          label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
        };
    }
  };

  const { backgroundColor, textColor, label } = getStatusConfig();

  const sizeStyles = {
    small: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      fontSize: typography.sizes.xxs,
    },
    medium: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      fontSize: typography.sizes.xs,
    },
    large: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      fontSize: typography.sizes.sm,
    },
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        { paddingVertical: sizeStyles[size].paddingVertical, paddingHorizontal: sizeStyles[size].paddingHorizontal },
        containerStyle,
      ]}
    >
      <Text style={[styles.text, { color: textColor, fontSize: sizeStyles[size].fontSize }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: typography.weights.semibold,
  },
});

export default StatusBadge;
