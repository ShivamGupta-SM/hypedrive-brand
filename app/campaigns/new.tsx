import { BottomButton } from '@/components/BottomButton';
import { ProductItem } from '@/components/ProductItem';
import { SelectField } from '@/components/SelectField';
import { TextArea } from '@/components/TextArea';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, ArrowRight, CaretDown, MagnifyingGlass, Plus } from 'phosphor-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Types
type Product = {
  id: string;
  name: string;
  price: string;
  image?: any;
};

type CampaignType = {
  id: string;
  name: string;
};

// Mock data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Max',
    price: '₹159,900',
    image: require('@/assets/products/iphone.jpg'),
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24 Ultra',
    price: '₹134,999',
    image: require('@/assets/products/samsung.png'),
  },
  {
    id: '3',
    name: 'MacBook Pro 16"',
    price: '₹249,900',
    image: require('@/assets/products/macbook.png'),
  },
  {
    id: '4',
    name: 'iPad Pro 12.9"',
    price: '₹119,900',
    image: require('@/assets/products/ipad.png'),
  },
];

const CAMPAIGN_TYPES: CampaignType[] = [
  { id: '1', name: 'Product Review' },
  { id: '2', name: 'Unboxing' },
  { id: '3', name: 'Tutorial' },
  { id: '4', name: 'Comparison' },
];

export default function CreateCampaignScreen() {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>('3'); // For demo, pre-select MacBook
  const [campaignType, setCampaignType] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxEnrollments, setMaxEnrollments] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Handle continue to next step
  const handleContinue = () => {
    // Navigate to next step or validate form
    router.push('/campaigns/create/deliverables');
  };

  // Filter products based on search query
  const filteredProducts = MOCK_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={22} color={colors.text.primary} weight="bold" />
        </Pressable>
        <Text style={styles.headerTitle}>Create Campaign</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTextContainer}>
          <Text style={styles.stepText}>Step 1 of 4</Text>
          <Text style={styles.stepLabel}>Campaign Details</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Campaign Name Input */}
          <View style={styles.inputGroup}>
            <Label>Campaign Name</Label>
            <Input
              placeholder="Enter campaign name"
              value={campaignName}
              onChangeText={setCampaignName}
            />
          </View>

          {/* Product Selection */}
          <View style={styles.inputGroup}>
            <Label>Select Product</Label>

            <View style={styles.selectProductContainer}>
              {isSearching ? (
                <View style={styles.searchContainer}>
                  <View>
                    <Input
                      placeholder="Search products"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      leftIcon={
                        <MagnifyingGlass size={20} color={colors.text.muted} weight="bold" />
                      }
                      style={styles.searchInput}
                      autoFocus
                    />
                  </View>
                  <Pressable style={styles.cancelButton} onPress={() => setIsSearching(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.productSearchButton} onPress={() => setIsSearching(true)}>
                  <MagnifyingGlass size={20} color={colors.text.muted} weight="bold" />
                  <Text style={styles.productSearchText}>Search products</Text>
                </Pressable>
              )}

              {/* Add New Product Button */}
              <Pressable
                style={styles.addProductButton}
                onPress={() => router.push('/campaigns/create/budget')}>
                <Plus size={14} color={colors.orange[500]} weight="bold" />
                <Text style={styles.addProductText}>Add New Product</Text>
              </Pressable>

              {/* Product List */}
              <View style={styles.productList}>
                {filteredProducts.map(product => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    isSelected={selectedProductId === product.id}
                    onSelect={() => setSelectedProductId(product.id)}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Campaign Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Campaign Type</Text>
            <SelectField
              placeholder="Select campaign type"
              value={campaignType}
              onPress={() => {
                // Show campaign type picker
              }}
              rightIcon={<CaretDown size={16} color={colors.text.muted} weight="bold" />}
            />
          </View>

          {/* Campaign Instructions */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Campaign Instructions</Text>
            <TextArea
              placeholder="Enter detailed instructions for shoppers"
              value={instructions}
              onChangeText={setInstructions}
              numberOfLines={5}
            />
          </View>

          {/* Maximum Enrollments */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Maximum Enrollments</Text>
            <Input
              placeholder="Enter maximum enrollments"
              value={maxEnrollments}
              onChangeText={setMaxEnrollments}
              keyboardType="number-pad"
            />
          </View>

          {/* Spacer for bottom button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Continue Button - Fixed at bottom */}
      <BottomButton
        title="Continue to Review Guidelines"
        onPress={handleContinue}
        icon={<ArrowRight size={20} color={colors.white} weight="bold" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  placeholder: {
    width: 24,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stepText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  stepLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
  },
  progressFill: {
    width: '25%', // 1 of 4 steps
    height: '100%',
    backgroundColor: colors.orange[500],
    borderRadius: borderRadius.full,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  productSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[50],
  },
  productSearchText: {
    marginLeft: spacing.sm,
    color: colors.text.muted,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  selectProductContainer: {
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    padding: spacing.xm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[50],
  },
  searchInput: {
    borderWidth: 1.5,
    borderColor: colors.gray[300],
  },
  cancelButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    color: colors.blue[500],
    fontWeight: typography.weights.medium,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xm,
    marginTop: spacing.sm,
    backgroundColor: colors.orange[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.orange[100],
  },
  addProductText: {
    marginLeft: spacing.xs,
    color: colors.orange[500],
    fontWeight: typography.weights.semibold,
    fontSize: typography.sizes.sm,
  },
  productList: {
    borderTopColor: colors.gray[200],
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.mg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
});
