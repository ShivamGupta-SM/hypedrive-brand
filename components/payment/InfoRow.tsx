import { colors, spacing, typography } from '@/constants/Design';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

type InfoRowProps = {
  icon?: ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  rightComponent?: ReactNode;
  containerStyle?: ViewStyle;
  leftContentStyle?: ViewStyle;
  rightContentStyle?: ViewStyle;
  iconContainerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
};

/**
 * A reusable component for displaying a row with an icon, label, and value
 */
const InfoRow = ({
  icon,
  label,
  value,
  valueColor,
  rightComponent,
  containerStyle,
  leftContentStyle,
  rightContentStyle,
  iconContainerStyle,
  labelStyle,
  valueStyle,
}: InfoRowProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.leftContent, leftContentStyle]}>
        {icon && <View style={[styles.iconContainer, iconContainerStyle]}>{icon}</View>}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </View>
      <View style={[styles.rightContent, rightContentStyle]}>
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
