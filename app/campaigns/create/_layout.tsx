import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, spacing, typography } from '@/constants/Design';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CaretLeft } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function CreateCampaignLayout() {
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const router = useRouter();

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Update current step based on the pathname
  useEffect(() => {
    if (pathname.includes('/deliverables')) {
      setCurrentStep(2);
    } else if (pathname.includes('/budget')) {
      setCurrentStep(3);
    } else {
      setCurrentStep(1);
    }
  }, [pathname]);

  return (
    <BottomSheetModalProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <CaretLeft size={22} color={colors.text.primary} weight="bold" />
          </Pressable>
          <Text style={styles.headerTitle}>Create Campaign</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.container}>
          {/* Progress Bar - Stays consistent across all setup screens */}
          <View style={styles.progressContainer}>
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              title="Setup Your Campaign"
              barColor={colors.orange[500]}
              backgroundColor={colors.gray[200]}
              stepText="Step"
            />
          </View>

          {/* Content slot for each setup screen */}
          <Slot />
        </View>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  placeholder: {
    width: 24,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  progressContainer: {
    padding: spacing.mg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
});
