import { colors, spacing, typography } from '@/constants/Design';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

type InfoColumnProps = {
  icon?: ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
};

/**
 * A reusable component for displaying a row with an icon, label, and value
 */
const InfoColumn = ({
  icon,
  label,
  value,
  valueColor,

  containerStyle,

  labelStyle,
  valueStyle,
}: InfoColumnProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.content]}>
        <View style={[styles.labelContent]}>
          {icon && <View style={[styles.iconContainer]}>{icon}</View>}
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        </View>
        <Text style={[styles.value, valueColor ? { color: valueColor } : null, valueStyle]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: spacing.xs,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  labelContent: {
    flexDirection: 'row',
    alignItems: 'center',
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

export default InfoColumn;
