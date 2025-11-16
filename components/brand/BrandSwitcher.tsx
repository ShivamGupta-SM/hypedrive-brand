import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useBrandStore } from '@/store/brandStore';
import BottomSheet from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Check, MegaphoneSimple, Plus, X } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientButton } from '../GradientButton';

// Types
export type Brand = {
  id: string;
  name: string;
  logo: any; // Image source
  activeCampaigns: number;
  isSelected?: boolean;
};

type BrandSwitcherProps = {
  isVisible: boolean;
  onClose: () => void;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
};

export const BrandSwitcher: React.FC<BrandSwitcherProps> = ({
  isVisible,
  onClose,
  bottomSheetRef,
}) => {
  const insets = useSafeAreaInsets();
  const { currentBrand, setCurrentBrand } = useBrandStore();

  // Mock brands data - in a real app, this would come from an API
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: 'amazon',
      name: 'Amazon Store',
      logo: require('@/assets/icons/apple-icon.png'),
      activeCampaigns: 24,
      isSelected: true,
    },
    {
      id: 'apple',
      name: 'Apple Store',
      logo: require('@/assets/icons/google-color-icon.png'),
      activeCampaigns: 12,
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      logo: require('@/assets/logo/ios-icon.png'),
      activeCampaigns: 8,
    },
    {
      id: 'google',
      name: 'Google Store',
      logo: require('@/assets/logo/hyperdrive-logo.png'),
      activeCampaigns: 5,
    },
  ]);

  // Load selected brand from storage on mount
  useEffect(() => {
    const loadSelectedBrand = async () => {
      try {
        const storedBrandId = await AsyncStorage.getItem('selectedBrandId');
        if (storedBrandId) {
          const storedBrand = brands.find(brand => brand.id === storedBrandId);
          if (storedBrand) {
            handleSelectBrand(storedBrand);
          }
        }
      } catch (error) {
        console.error('Error loading selected brand:', error);
      }
    };

    loadSelectedBrand();
  }, []);

  // Handle brand selection with smooth transition
  const handleSelectBrand = async (selectedBrand: Brand) => {
    try {
      // Skip if already selected
      if (selectedBrand.isSelected) {
        onClose();
        return;
      }

      // Provide haptic feedback on selection
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Update brands array with selection state
      const updatedBrands = brands.map(brand => ({
        ...brand,
        isSelected: brand.id === selectedBrand.id,
      }));

      setBrands(updatedBrands);

      // Save to global state
      setCurrentBrand(selectedBrand);

      // Save to AsyncStorage
      await AsyncStorage.setItem('selectedBrandId', selectedBrand.id);

      // Close the bottom sheet immediately after selection
      onClose();
      // bottomSheetRef.current?.close();
    } catch (error) {
      console.error('Error saving selected brand:', error);
    }
  };

  // Handle new brand creation
  const handleNewBrandPress = () => {
    router.push('/(brand)/setup');
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Switch Brand</Text>
        <Text style={styles.subtitle}>Select a brand to manage campaigns</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
          <X size={18} color={colors.gray[700]} weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.brandsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.brandsContentContainer}>
        {brands.map(brand => (
          <Pressable
            key={brand.id}
            style={[styles.brandItem, brand.isSelected && styles.selectedBrandContainer]}
            onPress={() => handleSelectBrand(brand)}
            android_ripple={{ color: colors.gray[200], borderless: false }}>
            <View style={styles.brandInfo}>
              <View style={styles.logoContainer}>
                <Image source={brand.logo} style={styles.brandLogo} />
              </View>
              <View style={styles.brandDetails}>
                <Text style={styles.brandName}>{brand.name}</Text>
                <View style={styles.campaignsInfo}>
                  <MegaphoneSimple size={12} weight="bold" color={colors.text.muted} />
                  <Text style={styles.campaignsText}>{brand.activeCampaigns} active campaigns</Text>
                </View>
              </View>
            </View>

            {brand.isSelected && (
              <View style={styles.checkContainer}>
                <Check size={14} color={colors.white} weight="bold" />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.addBrandButton, { marginBottom: insets.bottom || spacing.md }]}>
        <GradientButton
          title="Add New Brand"
          onPress={() => {
            handleNewBrandPress();
          }}
          icon={<Plus size={20} color={colors.white} weight="bold" />}
          iconPosition="left"
          gradientColors={[colors.gray[700], colors.gray[900]]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    position: 'relative',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandsContainer: {
    flex: 1,
  },
  brandsContentContainer: {
    paddingHorizontal: spacing.md,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xm,
    paddingVertical: spacing.xm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  brandLogo: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  brandDetails: {
    flex: 1,
  },
  brandName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    marginBottom: 2,
  },
  campaignsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  campaignsText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
  selectedBrandContainer: {
    borderWidth: 1,
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[400],
  },
  checkContainer: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBrandButton: {
    paddingTop: spacing.md,
    marginHorizontal: spacing.md,
  },
});
