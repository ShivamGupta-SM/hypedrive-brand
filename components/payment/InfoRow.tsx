import { colors, spacing, typography } from '@/constants/Design';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type InfoRowProps = {
  icon?: ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  rightComponent?: ReactNode;
};

/**
 * A reusable component for displaying a row with an icon, label, and value
 */
const InfoRow = ({ icon, label, value, valueColor, rightComponent }: InfoRowProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.rightContent}>
        {rightComponent || (
          <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  rightContent: {},
  value: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
});

export default InfoRow;
