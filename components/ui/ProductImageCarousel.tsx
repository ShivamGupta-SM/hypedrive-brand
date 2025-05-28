import { borderRadius, colors, spacing } from '@/constants/Design';
import { CaretLeft, CaretRight } from 'phosphor-react-native';
import React, { useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  ImageSourcePropType,
} from 'react-native';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

type ProductImageCarouselProps = {
  images: ImageSourcePropType[];
  height?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images,
  height = screenWidth * 0.8,
  showNavigation = true,
  showIndicators = true,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const autoPlayTimerRef = useRef<number | null>(null);

  // Handle carousel navigation
  const handleNext = () => {
    if (activeIndex < images.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * screenWidth,
        animated: true,
      });
      setActiveIndex(activeIndex + 1);
    } else if (autoPlay) {
      // If autoplay is enabled, loop back to the first image
      scrollViewRef.current?.scrollTo({
        x: 0,
        animated: true,
      });
      setActiveIndex(0);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollViewRef.current?.scrollTo({
        x: (activeIndex - 1) * screenWidth,
        animated: true,
      });
      setActiveIndex(activeIndex - 1);
    }
  };

  // Handle scroll events for the carousel
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: false,
  });

  const handleMomentumScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;
    const pageNum = Math.floor(contentOffset.x / viewSize.width);
    setActiveIndex(pageNum);
  };

  // Setup autoplay if enabled
  React.useEffect(() => {
    if (autoPlay && images.length > 1) {
      autoPlayTimerRef.current = setInterval(() => {
        handleNext();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, activeIndex, images.length]);

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <View key={index} style={[styles.carouselItem, { width: screenWidth }]}>
            <Image source={image} style={styles.productImage} resizeMode="contain" />
          </View>
        ))}
      </ScrollView>

      {/* Carousel Navigation */}
      {showNavigation && images.length > 1 && (
        <View style={styles.carouselNavigation}>
          <TouchableOpacity
            style={[styles.navButton, activeIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrev}
            disabled={activeIndex === 0}
          >
            <CaretLeft
              size={20}
              color={activeIndex === 0 ? colors.gray[300] : colors.white}
              weight="bold"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navButton,
              activeIndex === images.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={activeIndex === images.length - 1 && !autoPlay}
          >
            <CaretRight
              size={20}
              color={
                activeIndex === images.length - 1 && !autoPlay
                  ? colors.gray[300]
                  : colors.white
              }
              weight="bold"
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Carousel Indicator */}
      {showIndicators && images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { backgroundColor: index === activeIndex ? colors.primary : colors.gray[200] },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.gray[50],
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '90%',
    height: '90%',
  },
  carouselNavigation: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.md,
    top: '50%',
    transform: [{ translateY: -15 }],
  },
  navButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: spacing.md,
    width: '100%',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default ProductImageCarousel;
