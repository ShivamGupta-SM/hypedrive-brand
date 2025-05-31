import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useBrandStore } from '@/store/brandStore';
import { CaretDown } from 'phosphor-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type BrandHeaderProps = {
  onPress: () => void;
};

export const BrandHeader: React.FC<BrandHeaderProps> = ({ onPress }) => {
  const { currentBrand } = useBrandStore();

  // Default brand if none is selected
  const defaultBrand = {
    id: 'default',
    name: 'Select Brand',
    logo: require('@/assets/icons/apple-icon.png'),
    activeCampaigns: 0,
  };

  const brand = currentBrand || defaultBrand;

  return (
    <TouchableOpacity 
      style={styles.brandContainer} 
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.logoContainer}>
        <Image source={brand.logo} style={styles.logo} />
      </View>
      <View>
        <Text style={styles.welcomeText}>Welcome back</Text>
        <View style={styles.brandNameContainer}>
          <Text style={styles.brandName} numberOfLines={1} ellipsizeMode="tail">
            {brand.name}
          </Text>
          <CaretDown size={16} weight="bold" color={colors.text.muted} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.orange[50],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: colors.orange[500],
  },
  welcomeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  brandNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    maxWidth: 200,
  },
});
