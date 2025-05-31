import { BrandSwitcher } from '@/components/brand/BrandSwitcher';
import { borderRadius, colors } from '@/constants/Design';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useBrandSwitcher() {
  // State to control visibility of the brand switcher
  const [isBrandSwitcherVisible, setIsBrandSwitcherVisible] = useState(false);
  // Reference to the bottom sheet component
  const bottomSheetRef = useRef<BottomSheet>(null);
  // Get safe area insets for proper positioning
  const insets = useSafeAreaInsets();

  // Function to open the brand switcher
  const openBrandSwitcher = useCallback(() => {
    console.log('Opening brand switcher');
    // Dismiss keyboard if it's open
    Keyboard.dismiss();

    // Provide haptic feedback on iOS
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Set visibility to true to render the component
    setIsBrandSwitcherVisible(true);
    bottomSheetRef.current?.expand();
  }, []);

  // Function to close the brand switcher
  const closeBrandSwitcher = useCallback(() => {
    // Simply hide the component
    setIsBrandSwitcherVisible(false);
    bottomSheetRef.current?.close();
  }, []);

  // Define snap points - adjust height for better UX
  const snapPoints = useMemo(() => ['65%'], []);

  // Handle changes in the bottom sheet state
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // Sheet was closed by gesture, ensure we clean up
      setIsBrandSwitcherVisible(false);
      bottomSheetRef.current?.close();
    }
  }, []);

  // Render backdrop component with improved styling
  // const renderBackdrop = useCallback(
  //   (props: any) => (
  //     <BottomSheetBackdrop
  //       {...props}
  //       disappearsOnIndex={-1}
  //       appearsOnIndex={0}
  //       opacity={0.5}
  //       pressBehavior="close"
  //       enableTouchThrough={false}
  //       style={{ maxHeight: '100%' }}
  //     />
  //   ),
  //   [],
  // );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    [],
  );

  // Create the brand switcher component
  const BrandSwitcherComponent = useMemo(() => {
    // if (!isBrandSwitcherVisible) return null;

    return (
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          onClose={closeBrandSwitcher}
          onChange={handleSheetChanges}
          animateOnMount
          handleIndicatorStyle={{ backgroundColor: colors.gray[300], width: 40 }}
          backgroundStyle={styles.backgroundStyle}
          backdropComponent={renderBackdrop}
          // bottomInset={insets.bottom}
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
    );
  }, [isBrandSwitcherVisible, snapPoints, closeBrandSwitcher, handleSheetChanges, insets.bottom]);

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
    zIndex: 9999, // Ensure the bottom sheet appears above other content
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
