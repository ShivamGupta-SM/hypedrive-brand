import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useBrandStore } from '@/store/brandStore';
import BottomSheet from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, Plus, X } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  // Handle brand selection
  const handleSelectBrand = async (selectedBrand: Brand) => {
    try {
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

      // Close the bottom sheet after selection
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Error saving selected brand:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Switch Brand</Text>
        <Text style={styles.subtitle}>Select a brand to manage campaigns</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={20} color={colors.gray[500]} weight="bold" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.brandsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.brandsContentContainer}>
        {brands.map(brand => (
          <Pressable
            key={brand.id}
            style={styles.brandItem}
            onPress={() => handleSelectBrand(brand)}>
            <View style={styles.brandInfo}>
              <View style={styles.logoContainer}>
                <Image source={brand.logo} style={styles.brandLogo} />
              </View>
              <View style={styles.brandDetails}>
                <Text style={styles.brandName}>{brand.name}</Text>
                <View style={styles.campaignsInfo}>
                  <Image
                    source={require('@/assets/logo/ios-icon.png')}
                    style={styles.campaignIcon}
                  />
                  <Text style={styles.campaignsText}>{brand.activeCampaigns} active campaigns</Text>
                </View>
              </View>
            </View>

            {brand.isSelected && (
              <View style={styles.checkContainer}>
                <Check size={20} color={colors.white} weight="bold" />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addBrandButton, { marginBottom: insets.bottom || spacing.md }]}
        onPress={() => console.log('Add new brand')}>
        <Plus size={20} color={colors.white} weight="bold" />
        <Text style={styles.addBrandText}>Add New Brand</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
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
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
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
  },
  campaignIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
    tintColor: colors.text.secondary,
  },
  campaignsText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.blue[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBrandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue[900],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  addBrandText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
    marginLeft: spacing.sm,
  },
});
