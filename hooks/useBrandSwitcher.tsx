import { BrandSwitcher } from '@/components/brand/BrandSwitcher';
import { borderRadius, colors } from '@/constants/Design';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useBrandSwitcher() {
  const [isBrandSwitcherVisible, setIsBrandSwitcherVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  const openBrandSwitcher = useCallback(() => {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // First set the visibility to true
    setIsBrandSwitcherVisible(true);

    // Remove the timeout and directly present the sheet
    // The component will be mounted in the next render cycle
    requestAnimationFrame(() => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.expand();
      }
    });
  }, []);

  const closeBrandSwitcher = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }

    // Use a shorter timeout for hiding the component
    setTimeout(() => {
      setIsBrandSwitcherVisible(false);
    }, 100);
  }, []);

  // Define snap points
  const snapPoints = useMemo(() => ['60%'], []);

  // Render backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.2}
        style={{ maxHeight: '80%' }}
      />
    ),
    [],
  );

  const BrandSwitcherComponent = isBrandSwitcherVisible ? (
    <Portal>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={closeBrandSwitcher}
        handleIndicatorStyle={{ backgroundColor: colors.gray[300], width: 40 }}
        backgroundStyle={styles.backgroundStyle}
        backdropComponent={renderBackdrop}
        bottomInset={insets.bottom}
        style={styles.bottomSheet}>
        <BottomSheetView style={styles.contentContainer}>
          <BrandSwitcher
            isVisible={isBrandSwitcherVisible}
            onClose={closeBrandSwitcher}
            bottomSheetRef={bottomSheetRef}
          />
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  ) : null;

  return {
    BrandSwitcherComponent,
    openBrandSwitcher,
    closeBrandSwitcher,
  };
}

const styles = StyleSheet.create({
  bottomSheet: {
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
  },
  backgroundStyle: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
  },
  contentContainer: {
    flex: 1,
  },
});
