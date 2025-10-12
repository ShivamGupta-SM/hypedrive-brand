import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ImageSourcePropType } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/Design';

type MarketplaceOption = {
  id: string;
  name: string;
  logo?: ImageSourcePropType;
  icon?: React.ReactNode;
};

type MarketplaceSelectorProps = {
  options: MarketplaceOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
};

export const MarketplaceSelector = ({ options, selectedValues, onChange }: MarketplaceSelectorProps) => {
  const toggleMarketplace = (id: string) => {
    if (selectedValues.includes(id)) {
      onChange(selectedValues.filter(item => item !== id));
    } else {
      onChange([...selectedValues, id]);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.id);
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.marketplaceCard, isSelected && styles.selectedCard]}
            onPress={() => toggleMarketplace(option.id)}
            activeOpacity={0.7}>
            <View style={styles.logoContainer}>
              {option.icon ? (
                option.icon
              ) : option.logo ? (
                <Image source={option.logo} style={styles.logo} resizeMode="contain" />
              ) : (
                <View style={styles.placeholderLogo}>
                  <Text style={styles.placeholderText}>{option.name.charAt(0)}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.marketplaceName, isSelected && styles.selectedName]}>
              {option.name}
            </Text>
            {isSelected && <View style={styles.checkmark} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.mg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  marketplaceCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    width: 100,
    alignItems: 'center',
    position: 'relative',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.orange[50],
  },
  logoContainer: {
    width: 48,
    height: 48,
    marginBottom: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  marketplaceName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  selectedName: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  placeholderLogo: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.gray[500],
  },
});
