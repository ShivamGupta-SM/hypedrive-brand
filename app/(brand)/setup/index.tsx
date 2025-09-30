import { GradientButton } from '@/components/GradientButton';
import { CategorySelector } from '@/components/ui/CategorySelector';
import { FileUploader } from '@/components/ui/FileUploader';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  ArrowRight,
  Briefcase,
  Building,
  Coffee,
  Desktop,
  Hamburger,
  Headphones,
  Heart,
  Image as ImageIcon,
  Info,
  Leaf,
  Palette,
  ShoppingBag,
  Signature,
  Tag,
  TextAlignLeft,
  Truck,
} from 'phosphor-react-native';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { z } from 'zod';

// Define the schema for brand setup form
const brandSetupSchema = z.object({
  brandName: z.string().min(2, 'Brand name must be at least 2 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  logoUri: z.string().optional(),
});

type BrandSetupFormData = z.infer<typeof brandSetupSchema>;

// Define categories
const categories = [
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    icon: <ShoppingBag size={20} weight="fill" color={colors.blue[500]} />,
  },
  {
    id: 'tech',
    name: 'Technology',
    icon: <Desktop size={20} weight="fill" color={colors.purple[500]} />,
  },
  {
    id: 'food',
    name: 'Food & Beverage',
    icon: <Hamburger size={20} weight="fill" color={colors.orange[500]} />,
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: <Heart size={20} weight="fill" color={colors.red[500]} />,
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    icon: <Palette size={20} weight="fill" color={colors.rose[500]} />,
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Media',
    icon: <Headphones size={20} weight="fill" color={colors.yellow[500]} />,
  },
  {
    id: 'services',
    name: 'Professional Services',
    icon: <Briefcase size={20} weight="fill" color={colors.gray[700]} />,
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Travel',
    icon: <Coffee size={20} weight="fill" color={colors.yellow[500]} />,
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    icon: <Truck size={20} weight="fill" color={colors.green[600]} />,
  },
  {
    id: 'sustainability',
    name: 'Sustainability & Green',
    icon: <Leaf size={20} weight="fill" color={colors.green[500]} />,
  },
];

export default function BrandSetupScreen() {
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BrandSetupFormData>({
    resolver: zodResolver(brandSetupSchema),
    defaultValues: {
      brandName: '',
      category: '',
      description: '',
      logoUri: '',
    },
  });

  // Watch the logoUri value
  const logoUri = watch('logoUri');

  // Mock mutation for saving brand data
  const saveBrandMutation = useMutation({
    mutationFn: async (data: BrandSetupFormData) => {
      // In a real app, this would be an API call to save the brand data
      console.log('Saving brand data:', data);
      return new Promise(resolve => setTimeout(() => resolve(data), 1000));
    },
    onSuccess: () => {
      // Navigate to next step
      router.push('/(brand)/setup/presence');
    },
  });

  const onSubmit = (data: BrandSetupFormData) => {
    saveBrandMutation.mutate(data);
  };

  // Function to scroll to a specific input
  const scrollToInput = (y: number) => {
    scrollViewRef.current?.scrollTo({
      y: y,
      animated: true,
    });
    // setTimeout(() => {

    // }, 300);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      // keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag">
        <Text style={styles.title}>Tell us about your brand</Text>
        <Text style={styles.subtitle}>
          This helps us customize your experience and provide relevant recommendations.
        </Text>

        {/* Brand Name Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Signature size={18} weight="bold" color={colors.text.muted} />
            <Label>Brand Name</Label>
          </View>
          <Controller
            control={control}
            name="brandName"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Enter your brand name"
                value={value}
                leftIcon={<Building size={16} color={colors.text.secondary} />}
                onChangeText={onChange}
                error={!!errors.brandName}
                autoCapitalize="words"
                keyboardType="default"
                onFocus={() => scrollToInput(0)}
              />
            )}
          />
          {errors.brandName && <Text style={styles.errorText}>{errors.brandName.message}</Text>}
        </View>

        {/* Brand Logo Upload */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <ImageIcon size={18} weight="fill" color={colors.text.muted} />
            <Label>Brand Logo</Label>
          </View>
          <Controller
            control={control}
            name="logoUri"
            render={({ field: { value } }) => (
              <FileUploader
                value={value}
                onFileSelect={uri => setValue('logoUri', uri)}
                title="Upload your brand logo"
                subtitle="PNG, JPG or SVG, max 2MB"
              />
            )}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Tag weight="fill" size={16} color={colors.text.muted} />
            <Label>Category</Label>
          </View>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <CategorySelector
                value={value}
                onChange={onChange}
                categories={categories}
                error={errors.category?.message}
              />
            )}
          />
        </View>

        {/* Brand Description */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <TextAlignLeft weight="bold" size={18} color={colors.text.muted} />
            <Label>Brand Description</Label>
          </View>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <Input
                style={[styles.textArea]}
                placeholder="Tell us about your brand"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                error={!!errors.description}
                autoCapitalize="sentences"
                keyboardType="default"
                onFocus={() => scrollToInput(200)}
              />
            )}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}
          <View style={styles.bottomInfoContainer}>
            <Info size={16} weight="fill" color={colors.blue[500]} />
            <Text style={styles.helperText}>Brief description about your brand and products</Text>
          </View>
        </View>

        {/* Dev shortcut link */}
        <Text style={styles.subtitle}>
          <Text style={{ color: colors.blue[500] }} onPress={() => router.push('/(tabs)')}>
            Skip for now
          </Text>
        </Text>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <GradientButton
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          loading={saveBrandMutation.isPending}
          icon={<ArrowRight size={18} color={colors.white} weight="bold" />}
          iconPosition="right"
          gradientColors={[colors.blue[500], colors.blue[700]]}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// Update your styles to match the consistent format
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: spacing.mg,
    paddingBottom: 2 * spacing.xxl,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  textArea: {
    minHeight: 130,
    paddingTop: spacing.md,
    borderWidth: 2,
  },
  selectInput: {
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.text.black,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  errorText: {
    color: colors.red[500],
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  bottomInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.mg,
    gap: spacing.xs,
  },
  helperText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  logoUploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
    backgroundColor: colors.gray[50],
    marginBottom: spacing.md,
  },
  logoPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  fileFormatText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  chooseFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.blue[100],
    gap: spacing.sm,
  },
  chooseFileText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.blue[500],
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.mg,
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
