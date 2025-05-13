import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CategoryTabProps = {
  title: string;
  icon?: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
};

export const CategoryTab = ({ title, icon, isActive, onPress }: CategoryTabProps) => {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.title, isActive && styles.activeTitle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 100,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  activeContainer: {
    backgroundColor: colors.blue[500],
    borderColor: colors.blue[500],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  activeTitle: {
    color: colors.white,
  },
});
