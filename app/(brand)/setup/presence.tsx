import { GradientButton } from '@/components/GradientButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { MarketplaceSelector } from '@/components/ui/MarketplaceSelector';
import { colors, spacing, typography } from '@/constants/Design';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  ArrowRight,
  FacebookLogo,
  Globe,
  InstagramLogo,
  Link,
  ShareNetwork,
  Storefront,
  TiktokLogo,
} from 'phosphor-react-native';
import React, { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

// Define the schema for brand presence form
const brandPresenceSchema = z.object({
  marketplaces: z.array(z.string()).optional(),
  website: z.string().url('Please enter a valid URL').or(z.string().length(0)),
  instagramHandle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  facebookPage: z.string().optional(),
});

type BrandPresenceFormData = z.infer<typeof brandPresenceSchema>;

// Define marketplace options
const marketplaceOptions = [
  {
    id: 'flipkart',
    name: 'Flipkart',
    icon: <Storefront size={32} color={colors.primary} />,
  },
  {
    id: 'amazon',
    name: 'Amazon.in',
    icon: <Storefront size={32} color={colors.primary} />,
  },
  {
    id: 'myntra',
    name: 'Myntra',
    icon: <Storefront size={32} color={colors.primary} />,
  },
  {
    id: 'meesho',
    name: 'Meesho',
    icon: <Storefront size={32} color={colors.primary} />,
  },
  {
    id: 'snapdeal',
    name: 'Snapdeal',
    icon: <Storefront size={32} color={colors.primary} />,
  },
  {
    id: 'ajio',
    name: 'Ajio',
    icon: <Storefront size={32} color={colors.primary} />,
  },
];

export default function BrandPresenceScreen() {
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BrandPresenceFormData>({
    resolver: zodResolver(brandPresenceSchema),
    defaultValues: {
      marketplaces: [],
      website: '',
      instagramHandle: '',
      tiktokHandle: '',
      facebookPage: '',
    },
  });

  // Watch the marketplaces value
  watch('marketplaces');

  // Mock mutation for saving brand presence data
  const saveBrandPresenceMutation = useMutation({
    mutationFn: async (data: BrandPresenceFormData) => {
      // In a real app, this would be an API call to save the brand presence data
      console.log('Saving brand presence data:', data);
      return new Promise(resolve => setTimeout(() => resolve(data), 1000));
    },
    onSuccess: () => {
      // Navigate to next step or complete the setup
      router.push('/(brand)/setup/complete-kyc-details');
    },
  });

  const onSubmit = (data: BrandPresenceFormData) => {
    saveBrandPresenceMutation.mutate(data);
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="on-drag">
        <Text style={styles.title}>Where can customers find you?</Text>
        <Text style={styles.subtitle}>
          Help customers discover your brand across different platforms.
        </Text>

        {/* Indian Marketplace Presence */}
        <View style={[styles.inputGroup, { marginHorizontal: -spacing.mg }]}>
          <View style={[styles.labelContainer, { paddingHorizontal: spacing.mg }]}>
            <Storefront size={18} weight="fill" color={colors.text.muted} />
            <Label style={styles.sectionLabel}>Indian Marketplace Presence</Label>
          </View>
          <Controller
            control={control}
            name="marketplaces"
            render={({ field: { value, onChange } }) => (
              <MarketplaceSelector
                options={marketplaceOptions}
                selectedValues={value || []}
                onChange={onChange}
              />
            )}
          />
        </View>

        {/* Website Input */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Link size={18} weight="bold" color={colors.text.muted} />
            <Label style={styles.sectionLabel}>Website (Optional)</Label>
          </View>
          <Controller
            control={control}
            name="website"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="www.yourwebsite.com"
                value={value}
                leftIcon={<Globe size={16} color={colors.text.secondary} />}
                onChangeText={onChange}
                error={!!errors.website}
                autoCapitalize="none"
                keyboardType="url"
              />
            )}
          />
          {errors.website && <Text style={styles.errorText}>{errors.website.message}</Text>}
        </View>

        {/* Social Media Section */}
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <ShareNetwork size={18} weight="fill" color={colors.text.muted} />
            <Label style={styles.sectionLabel}>Social Media (Optional)</Label>
          </View>

          {/* Social Handle Inputs */}
          <View style={styles.socialHandles}>
            {/* Instagram Handle */}
            <Controller
              control={control}
              name="instagramHandle"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Instagram handle"
                  value={value}
                  leftIcon={<InstagramLogo weight="fill" size={16} color={colors.text.secondary} />}
                  onChangeText={onChange}
                />
              )}
            />

            {/* TikTok Handle */}
            <Controller
              control={control}
              name="tiktokHandle"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="TikTok handle"
                  value={value}
                  leftIcon={<TiktokLogo size={16} weight="fill" color={colors.text.secondary} />}
                  onChangeText={onChange}
                />
              )}
            />

            {/* Facebook Page */}
            <Controller
              control={control}
              name="facebookPage"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Facebook page"
                  value={value}
                  leftIcon={<FacebookLogo size={16} weight="fill" color={colors.text.secondary} />}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <GradientButton
          title="Continue"
          onPress={handleSubmit(onSubmit)}
          loading={saveBrandPresenceMutation.isPending}
          icon={<ArrowRight size={18} color={colors.white} weight="bold" />}
          iconPosition="right"
          gradientColors={[colors.blue[600], colors.blue[600], colors.blue[800]]}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: spacing.mg,
    paddingBottom: spacing.xxl * 2,
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
    marginBottom: spacing.xl,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionLabel: {
    marginBottom: 0,
  },
  socialHandles: {
    gap: spacing.md,
  },
  errorText: {
    color: colors.red[500],
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  buttonContainer: {
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
