import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ProfileInfoItemProps = {
  label: string;
  value: string;
  icon?: ReactNode;
  last?: boolean;
};

export const ProfileInfoItem = ({ label, value, icon, last = false }: ProfileInfoItemProps) => {
  return (
    <View style={[styles.container, last && styles.lastContainer]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  lastContainer: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.gray[500],
    marginBottom: spacing.xs / 2,
  },
  value: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    maxWidth: '60%',
    textAlign: 'right',
  },
});
