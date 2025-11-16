import { colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

type RowProps = {
  label?: string;
  value?: string;
  valueColor?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
  borderBottom?: boolean;
  children?: React.ReactNode;
};

const Row = ({
  label,
  value,
  valueColor,
  containerStyle,
  labelStyle,
  valueStyle,
  borderBottom,
  children,
}: RowProps) => {
  return (
    <View style={[styles.container, containerStyle, { borderBottomWidth: borderBottom ? 1 : 0 }]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      {value && (
        <Text style={[styles.value, valueColor ? { color: valueColor } : null, valueStyle]}>
          {value}
        </Text>
      )}
      {children}
    </View>
  );
};

export default Row;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomColor: colors.gray[100],
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  value: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
});
