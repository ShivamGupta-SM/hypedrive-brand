import { ProgressBar } from '@/components/ui/ProgressBar';
import { colors, spacing } from '@/constants/Design';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function SetupLayout() {
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Update current step based on the pathname
  useEffect(() => {
    if (pathname.includes('/presence')) {
      setCurrentStep(2);
    } else if (pathname.includes('/complete-kyc-details')) {
      setCurrentStep(3);
    } else {
      setCurrentStep(1);
    }
  }, [pathname]);

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />
          <View style={styles.container}>
            {/* Progress Bar - Stays consistent across all setup screens */}
            <View style={styles.progressContainer}>
              <ProgressBar
                currentStep={currentStep}
                totalSteps={totalSteps}
                title="Setup Your Brand"
              />
            </View>

            {/* Content slot for each setup screen */}
            <Slot />
          </View>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
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
    paddingBottom: spacing.md,
  },
});
