import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/Design';

type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

type CategorySelectorProps = {
  categories: Category[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
};

export const CategorySelector = ({ categories, selectedCategory, onSelect }: CategorySelectorProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, isSelected && styles.selectedCard]}
            onPress={() => onSelect(category.id)}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>{category.icon}</View>
            <Text style={[styles.categoryName, isSelected && styles.selectedName]}>{category.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    minWidth: 120,
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.orange[50],
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  selectedName: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});
