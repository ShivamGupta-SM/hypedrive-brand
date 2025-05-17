import { Button } from '@/components/ui/Button';
import { CategorySelector } from '@/components/ui/CategorySelector';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  Camera,
  CurrencyInr,
  Globe,
  Link,
  Plus,
  ShoppingBag,
  Tag,
  TextT,
} from 'phosphor-react-native';
import React, { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Types
type PhotoItem = {
  id: string;
  uri: string | null;
};

type Category = {
  id: string;
  name: string;
  icon?: React.ReactNode;
};

type PlatformType = {
  id: string;
  name: string;
  icon?: React.ReactNode;
};

// Mock data for categories
const CATEGORIES: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: <Globe size={20} weight="fill" color={colors.blue[500]} />,
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: <Tag size={20} weight="fill" color={colors.rose[500]} />,
  },
  {
    id: 'home',
    name: 'Home & Kitchen',
    icon: <ShoppingBag size={20} weight="fill" color={colors.green[500]} />,
  },
  {
    id: 'beauty',
    name: 'Beauty',
    icon: <ShoppingBag size={20} weight="fill" color={colors.purple[500]} />,
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: <ShoppingBag size={20} weight="fill" color={colors.orange[500]} />,
  },
];

// Mock data for platforms
const PLATFORMS: PlatformType[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    icon: <Globe size={20} weight="fill" color={colors.blue[500]} />,
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    icon: <Globe size={20} weight="fill" color={colors.blue[500]} />,
  },
  {
    id: 'myntra',
    name: 'Myntra',
    icon: <Globe size={20} weight="fill" color={colors.blue[500]} />,
  },
  {
    id: 'meesho',
    name: 'Meesho',
    icon: <Globe size={20} weight="fill" color={colors.blue[500]} />,
  },
];

export default function AddNewProductScreen() {
  // State for form fields
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [platform, setPlatform] = useState('');
  const [productLink, setProductLink] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for photos
  const [photos, setPhotos] = useState<PhotoItem[]>([
    { id: '1', uri: null },
    { id: '2', uri: null },
    { id: '3', uri: null },
    { id: '4', uri: null },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  // Handle photo selection
  const handleSelectPhoto = async (photoId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPhotos(prevPhotos =>
          prevPhotos.map(photo =>
            photo.id === photoId ? { ...photo, uri: result.assets[0].uri } : photo,
          ),
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  // Add more photo slots
  const handleAddMorePhotos = () => {
    setPhotos(prevPhotos => [...prevPhotos, { id: `${prevPhotos.length + 1}`, uri: null }]);
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.back();
    }, 1500);
  };

  // Check if required photos are selected
  const requiredPhotosSelected = photos.slice(0, 4).every(photo => photo.uri !== null);

  // Check if form is valid
  const isFormValid =
    productName.trim() !== '' &&
    sku.trim() !== '' &&
    price.trim() !== '' &&
    category !== '' &&
    platform !== '' &&
    requiredPhotosSelected;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Product Photos Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Photos</Text>
            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoContainer}
                  onPress={() => handleSelectPhoto(photo.id)}
                  activeOpacity={0.8}>
                  {photo.uri ? (
                    <View style={styles.photoPreviewContainer}>
                      <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                      <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)']}
                        style={styles.photoGradient}
                      />
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Camera size={24} color={colors.orange[500]} weight="bold" />
                      <Text style={styles.photoText}>Photo {index + 1}</Text>
                      <Text style={styles.photoRequired}>
                        {index < 4 ? 'Required' : 'Optional'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {/* Add More Photos Button */}
              <TouchableOpacity
                style={styles.addMorePhotosButton}
                onPress={handleAddMorePhotos}
                activeOpacity={0.8}>
                <Plus size={24} color={colors.gray[400]} weight="bold" />
                <Text style={styles.addMorePhotosText}>Add More</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.photoHint}>PNG, JPG up to 10MB</Text>
          </View>

          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <View style={styles.inputContainer}>
                <TextT size={18} color={colors.gray[400]} weight="bold" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  placeholderTextColor={colors.gray[400]}
                  value={productName}
                  onChangeText={setProductName}
                />
              </View>
            </View>

            {/* SKU */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SKU</Text>
              <View style={styles.inputContainer}>
                <Tag size={18} color={colors.gray[400]} weight="bold" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter SKU"
                  placeholderTextColor={colors.gray[400]}
                  value={sku}
                  onChangeText={setSku}
                />
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price</Text>
              <View style={styles.inputContainer}>
                <CurrencyInr
                  size={18}
                  color={colors.gray[400]}
                  weight="bold"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  placeholderTextColor={colors.gray[400]}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Category & Platform Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category & Platform</Text>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <CategorySelector
                value={category}
                onChange={setCategory}
                placeholder="Select category"
                categories={CATEGORIES}
              />
            </View>

            {/* Platform Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Platform</Text>
              <CategorySelector
                value={platform}
                onChange={setPlatform}
                placeholder="Select platform"
                categories={PLATFORMS}
              />
            </View>

            {/* Product Link */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Link</Text>
              <View style={styles.inputContainer}>
                <Link size={18} color={colors.gray[400]} weight="bold" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter product URL"
                  placeholderTextColor={colors.gray[400]}
                  value={productLink}
                  onChangeText={setProductLink}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Description</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                placeholder="Enter product description"
                placeholderTextColor={colors.gray[400]}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Spacer for bottom button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Product Button - Fixed at bottom */}
      <View style={styles.bottomButtonContainer}>
        <Button
          title="Add Product"
          variant="gradient"
          gradientColor="orange"
          icon={<Plus size={20} color={colors.white} weight="bold" />}
          iconPosition="left"
          style={styles.addButton}
          loading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
          onPress={handleSubmit}
        />
      </View>
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
    paddingHorizontal: spacing.mg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  headerRight: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.mg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.md,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -spacing.xs,
  },
  photoContainer: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  photoPreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
  },
  photoText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  photoRequired: {
    fontSize: typography.sizes.xs,
    color: colors.orange[500],
    marginTop: spacing.xs,
  },
  addMorePhotosButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  addMorePhotosText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  photoHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: colors.white,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  textAreaContainer: {
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 120,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.mg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  addButton: {
    width: '100%',
  },
});
