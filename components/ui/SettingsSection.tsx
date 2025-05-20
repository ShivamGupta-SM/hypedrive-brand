import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { Route } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SectionItem } from './SectionItem';

export type SettingsSectionItemType = {
  id: string;
  label: string;
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  route: Route;
  onPress?: () => void;
};

type SettingsSectionProps = {
  title: string;
  items: SettingsSectionItemType[];
  onItemPress?: (item: SettingsSectionItemType) => void;
};

export const SettingsSection = ({ title, items, onItemPress }: SettingsSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <SectionItem
              icon={item.icon}
              label={item.label}
              iconColor={item.iconColor}
              iconBg={item.iconBg}
              onPress={() => onItemPress?.(item)}
            />
            {index < items.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.mg,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.mg,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[100],
  },
});
