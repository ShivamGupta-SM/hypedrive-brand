import { BrandSwitcher } from '@/components/brand/BrandSwitcher';
import { colors } from '@/constants/Design';
import BottomSheet from '@gorhom/bottom-sheet';
import React, { useRef, useState } from 'react';

export function useBrandSwitcher() {
  const [isBrandSwitcherVisible, setIsBrandSwitcherVisible] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openBrandSwitcher = () => {
    setIsBrandSwitcherVisible(true);
    bottomSheetRef.current?.expand();
  };

  const closeBrandSwitcher = () => {
    bottomSheetRef.current?.close();
    setTimeout(() => {
      setIsBrandSwitcherVisible(false);
    }, 300);
  };

  const BrandSwitcherComponent = isBrandSwitcherVisible ? (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={['50%', '80%']}
      enablePanDownToClose
      onClose={closeBrandSwitcher}
      handleIndicatorStyle={{ backgroundColor: colors.gray[300], width: 40 }}
      backgroundStyle={{ backgroundColor: colors.white }}>
      <BrandSwitcher
        isVisible={isBrandSwitcherVisible}
        onClose={closeBrandSwitcher}
        bottomSheetRef={bottomSheetRef}
      />
    </BottomSheet>
  ) : null;

  return {
    BrandSwitcherComponent,
    openBrandSwitcher,
    closeBrandSwitcher,
  };
}
