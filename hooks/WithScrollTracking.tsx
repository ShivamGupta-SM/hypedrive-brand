import { useScrollContext } from '@/store/TabScreenScrollContext';
import { useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

export const WithScrollTracking = (WrappedComponent: React.ComponentType<any>) => {
  return function WithScrollTrackingWrapper(props: any) {
    const { setSetscrollDirection } = useScrollContext();
    const lastScrollY = useRef(0);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const previousY = lastScrollY.current;

      if (currentY === 0) {
        setSetscrollDirection('top');
      } else if (currentY > previousY) {
        setSetscrollDirection('down');
      } else {
        setSetscrollDirection('up');
      }

      lastScrollY.current = currentY;
    };

    return (
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
        <WrappedComponent {...props} />
      </ScrollView>
    );
  };
};
