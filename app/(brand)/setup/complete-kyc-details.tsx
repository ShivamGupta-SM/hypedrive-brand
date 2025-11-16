import { GradientButton } from '@/components/GradientButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  BuildingOffice,
  Buildings,
  ChartPieSlice,
  Check,
  Hash,
  MagnifyingGlass,
  PaperPlaneTilt,
  Plant,
  Receipt,
} from 'phosphor-react-native';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

// Define the schema for KYC details form
const kycDetailsSchema = z.object({
  gstNumber: z.string().min(15, 'GST number must be 15 characters').max(15),
  companySize: z.enum(['startup', 'growing', 'enterprise']),
});

type KYCDetailsFormData = z.infer<typeof kycDetailsSchema>;

// Company size options
const companySizeOptions = [
  {
    id: 'startup',
    name: 'Startup',
    range: '1-10',
    icon: <Plant size={22} color={colors.blue[400]} weight="fill" />,
  },
  {
    id: 'growing',
    name: 'Growing',
    range: '11-50',
    icon: <BuildingOffice size={22} color={colors.blue[400]} weight="fill" />,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    range: '50+',
    icon: <Buildings size={22} color={colors.blue[400]} weight="fill" />,
  },
];

type MockGSTDatabaseType = {
  [key: string]: {
    name: string;
    address: string;
    type?: string;
    status?: string;
  };
};

// Mock GST database for verification
const mockGSTDatabase: MockGSTDatabaseType = {
  '27AADCB2230M1ZT': {
    name: 'Acme Corporation Pvt Ltd',
    address: '123 Business Park, Sector 5, Mumbai, 400001',
    type: 'Regular',
    status: 'Active',
  },
  '29AAACR4849R1ZX': {
    name: 'Reliance Industries Limited',
    address: 'Maker Chambers IV, 222 Nariman Point, Mumbai, 400021',
    type: 'Regular',
    status: 'Active',
  },
};

export default function CompleteKYCDetailsScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [businessDetails, setBusinessDetails] = useState<{
    name: string;
    address: string;
    type?: string;
    status?: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<KYCDetailsFormData>({
    resolver: zodResolver(kycDetailsSchema),
    defaultValues: {
      gstNumber: '',
      companySize: 'startup',
    },
  });

  const gstNumber = watch('gstNumber');
  const companySize = watch('companySize');

  // Mock verification function
  const verifyGST = async (gst: string) => {
    if (gst.length !== 15) {
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if GST exists in our mock database
    if (mockGSTDatabase[gst]) {
      setIsVerified(true);
      setBusinessDetails(mockGSTDatabase[gst]);
      setValue('gstNumber', gst);
    } else {
      setIsVerified(false);
      setVerificationError('GST number not found. Please check and try again.');
    }

    setIsVerifying(false);
    return true;
  };

  // Mock mutation for saving KYC details
  const saveKYCDetailsMutation = useMutation({
    mutationFn: async (data: KYCDetailsFormData) => {
      // In a real app, this would be an API call to save the KYC details
      console.log('Saving KYC details:', data);
      return new Promise(resolve => setTimeout(() => resolve(data), 1000));
    },
    onSuccess: () => {
      // Navigate to the under review screen instead of tabs
      router.replace('/(brand)/under-review');
    },
  });

  const onSubmit = (data: KYCDetailsFormData) => {
    saveKYCDetailsMutation.mutate(data);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Complete KYC Details</Text>
          <Text style={styles.subtitle}>Add your verification details to get started</Text>

          {/* GST Number Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Receipt size={18} weight="fill" color={colors.text.muted} />
              <Label style={styles.sectionLabel}>GST Number</Label>
            </View>

            {!isVerified ? (
              <View>
                <Controller
                  control={control}
                  name="gstNumber"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.gstInputContainer}>
                      <Input
                        placeholder="ENTER GST NUMBER"
                        value={value}
                        onChangeText={text => {
                          onChange(text.toUpperCase());
                          setVerificationError(null);
                        }}
                        error={!!errors.gstNumber || !!verificationError}
                        leftIcon={<Hash size={18} color={colors.text.muted} weight="bold" />}
                        rightIcon={
                          <Pressable
                            style={styles.searchButton}
                            onPress={() => verifyGST(value)}
                            disabled={value.length !== 15 || isVerifying}>
                            {isVerifying ? (
                              <ActivityIndicator size="small" color={colors.blue[500]} />
                            ) : (
                              <MagnifyingGlass
                                size={18}
                                color={value.length === 15 ? colors.blue[500] : colors.gray[400]}
                                weight="bold"
                              />
                            )}
                          </Pressable>
                        }
                        autoCapitalize="characters"
                        style={styles.gstInput}
                        maxLength={15}
                      />
                    </View>
                  )}
                />

                {errors.gstNumber && (
                  <Text style={styles.errorText}>{errors.gstNumber.message}</Text>
                )}

                {verificationError && <Text style={styles.errorText}>{verificationError}</Text>}

                <Text style={styles.infoText}>We'll fetch your business details automatically</Text>

                <View style={styles.gstExamples}>
                  <Text style={styles.gstExampleTitle}>Try these sample GST numbers:</Text>
                  <Pressable
                    onPress={() => {
                      setValue('gstNumber', '27AADCB2230M1ZT');
                      verifyGST('27AADCB2230M1ZT');
                    }}>
                    <Text style={styles.gstExampleItem}>• 27AADCB2230M1ZT</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setValue('gstNumber', '29AAACR4849R1ZX');
                      verifyGST('29AAACR4849R1ZX');
                    }}>
                    <Text style={styles.gstExampleItem}>• 29AAACR4849R1ZX</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.verifiedContainer}>
                <View style={styles.verifiedHeader}>
                  <View style={styles.verifiedCheck}>
                    <Check size={20} color={colors.green[500]} weight="bold" />
                  </View>
                  <View style={styles.verifiedTextContainer}>
                    <Text style={styles.verifiedText}>{gstNumber}</Text>
                    <Text style={styles.verifiedSubText}>GST Verified</Text>
                  </View>
                  <Pressable onPress={() => setIsVerified(false)}>
                    <Text style={styles.changeText}>Change</Text>
                  </Pressable>
                </View>

                <View style={styles.businessDetails}>
                  <View style={styles.businessDetailRow}>
                    <Text style={styles.businessDetailLabel}>Business Name</Text>
                    <Text
                      style={styles.businessDetailValue}
                      lineBreakMode="middle"
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {businessDetails?.name}
                    </Text>
                  </View>
                  <View style={styles.businessDetailRow}>
                    <Text style={styles.businessDetailLabel}>Address</Text>
                    <Text style={styles.businessDetailValue}>{businessDetails?.address}</Text>
                  </View>
                  {businessDetails?.type && (
                    <View style={styles.businessDetailRow}>
                      <Text style={styles.businessDetailLabel}>Type</Text>
                      <Text style={styles.businessDetailValue}>{businessDetails.type}</Text>
                    </View>
                  )}
                  {businessDetails?.status && (
                    <View style={styles.businessDetailRow}>
                      <Text style={styles.businessDetailLabel}>Status</Text>
                      <Text
                        style={[
                          styles.businessDetailValue,
                          {
                            color:
                              businessDetails.status === 'Active'
                                ? colors.green[500]
                                : colors.red[500],
                          },
                        ]}>
                        {businessDetails.status}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Company Size Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ChartPieSlice size={18} weight="fill" color={colors.text.muted} />
              <Label style={styles.sectionLabel}>Company Size</Label>
            </View>

            <Controller
              control={control}
              name="companySize"
              render={({ field: { onChange, value } }) => (
                <View style={styles.companySizeContainer}>
                  {companySizeOptions.map(option => (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.companySizeOption,
                        value === option.id && styles.companySizeOptionSelected,
                      ]}
                      onPress={() => onChange(option.id)}>
                      <View
                        style={[
                          styles.companySizeIconContainer,
                          value === option.id && styles.companySizeIconContainerSelected,
                        ]}>
                        <Text style={styles.companySizeIcon}>{option.icon}</Text>
                      </View>
                      <Text style={styles.companySizeName}>{option.name}</Text>
                      <Text style={styles.companySizeRange}>{option.range}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <GradientButton
            title="Submit Details"
            onPress={handleSubmit(onSubmit)}
            loading={saveKYCDetailsMutation.isPending}
            icon={<PaperPlaneTilt size={18} color={colors.white} weight="duotone" />}
            iconPosition="right"
            gradientColors={
              isVerified && companySize
                ? [colors.blue[500], colors.blue[700]]
                : [colors.gray[400], colors.gray[500]]
            }
            disabled={!isVerified || !companySize}
            style={{ opacity: isVerified && companySize ? 1 : 0.6 }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  progressContainer: {
    padding: spacing.mg,
    paddingBottom: spacing.sm,
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
    width: '100%',
    backgroundColor: colors.blue[500],
    borderRadius: 3,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.mg,
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
  gstInputContainer: {
    position: 'relative',
    width: '100%',
  },
  gstInput: {
    width: '100%',
  },
  searchButton: {
    padding: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.red[500],
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  gstExamples: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue[400],
  },
  gstExampleTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  gstExampleItem: {
    fontSize: typography.sizes.sm,
    color: colors.blue[600],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: spacing.xs,
  },
  verifiedContainer: {
    borderWidth: 2.2,
    borderColor: colors.green[500],
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    overflow: 'hidden',
    padding: spacing.md,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xm,
  },
  verifiedCheck: {
    backgroundColor: colors.green[50],
    // width: 24,
    // height: 24,
    padding: spacing.xm,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  verifiedText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  verifiedSubText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
  },
  changeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.blue[500],
  },
  businessDetails: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    // overflow: 'hidden',
  },
  businessDetailRow: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  businessDetailLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  businessDetailValue: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.black,
    textAlign: 'right',
  },
  companySizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xm,
  },
  companySizeOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  companySizeOptionSelected: {
    borderColor: colors.blue[500],
    backgroundColor: colors.blue[50],
  },
  companySizeIconContainer: {
    backgroundColor: colors.gray[100],
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  companySizeIconContainerSelected: {
    backgroundColor: colors.blue[100],
  },
  companySizeIcon: {
    fontSize: 20,
  },
  companySizeName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  companySizeRange: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  buttonContainer: {
    padding: spacing.mg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.white,
  },
});
