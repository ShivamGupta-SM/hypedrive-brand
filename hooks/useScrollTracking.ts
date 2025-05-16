import { useScrollContext } from '@/store/TabScreenScrollContext';
import { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export function useScrollTracking() {
  const { setSetscrollDirection, setScrollPosition } = useScrollContext();
  const lastScrollY = useRef(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const previousY = lastScrollY.current;

    // Update scroll position
    setScrollPosition(currentY);

    if (currentY === 0) {
      setSetscrollDirection('top');
    } else if (currentY > previousY) {
      setSetscrollDirection('down');
    } else {
      setSetscrollDirection('up');
    }

    lastScrollY.current = currentY;
  };

  return { handleScroll };
}