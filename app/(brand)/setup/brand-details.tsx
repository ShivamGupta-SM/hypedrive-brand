import { GradientButton } from '@/components/GradientButton';
import { colors, spacing, typography } from '@/constants/Design';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { CaretRight, Globe, MapPin, Phone } from 'phosphor-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { z } from 'zod';

// Define the schema for brand details form
const brandDetailsSchema = z.object({
  website: z.string().url('Please enter a valid URL').or(z.string().length(0)),
  phone: z.string().min(10, 'Please enter a valid phone number').or(z.string().length(0)),
  address: z.string().min(5, 'Please enter a valid address').or(z.string().length(0)),
});

type BrandDetailsFormData = z.infer<typeof brandDetailsSchema>;

export default function BrandDetailsScreen() {
  const currentStep = 2;
  const totalSteps = 3;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BrandDetailsFormData>({
    resolver: zodResolver(brandDetailsSchema),
    defaultValues: {
      website: '',
      phone: '',
      address: '',
    },
  });

  // Mock mutation for saving brand details
  const saveBrandDetailsMutation = useMutation({
    mutationFn: async (data: BrandDetailsFormData) => {
      console.log('Saving brand details:', data);
      return new Promise(resolve => setTimeout(() => resolve(data), 1000));
    },
    onSuccess: () => {
      //   router.push('/brand/setup/brand-visuals');
    },
  });

  const onSubmit = (data: BrandDetailsFormData) => {
    saveBrandDetailsMutation.mutate(data);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>Setup Progress</Text>
            <Text style={styles.progressCounter}>
              {currentStep} of {totalSteps}
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[styles.progressBarFill, { width: `${(currentStep / totalSteps) * 100}%` }]}
            />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Brand Contact Details</Text>
          <Text style={styles.subtitle}>
            Add your brand's contact information to help customers reach you
          </Text>

          {/* Website Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Globe size={16} color={colors.text.secondary} />
              <Text style={styles.label}>Website (Optional)</Text>
            </View>
            <Controller
              control={control}
              name="website"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="https://yourbrand.com"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              )}
            />
            {errors.website && <Text style={styles.errorText}>{errors.website.message}</Text>}
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Phone size={16} color={colors.text.secondary} />
              <Text style={styles.label}>Phone Number (Optional)</Text>
            </View>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="+1 (555) 123-4567"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
          </View>

          {/* Address Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <MapPin size={16} color={colors.text.secondary} />
              <Text style={styles.label}>Business Address (Optional)</Text>
            </View>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter your business address"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <GradientButton
            title="Continue"
            onPress={handleSubmit(onSubmit)}
            loading={saveBrandDetailsMutation.isPending}
            icon={<CaretRight size={20} color={colors.white} weight="bold" />}
            iconPosition="right"
            gradientColors={[colors.blue[500], colors.blue[600], colors.blue[700]]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  progressContainer: {
    padding: spacing.mg,
    paddingBottom: 0,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  progressCounter: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.blue[500],
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: colors.blue[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.blue[500],
    borderRadius: 3,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.mg,
    paddingBottom: spacing.xxl * 3, // Add extra padding for the fixed button
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
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
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.md,
  },
  errorText: {
    color: colors.red[500],
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
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
