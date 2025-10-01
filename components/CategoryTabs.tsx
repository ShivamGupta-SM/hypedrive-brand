import { colors, spacing } from '@/constants/Design';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  Cpu,
  Headphones,
  Laptop,
  MagnifyingGlass,
  SquaresFour,
  Watch,
} from 'phosphor-react-native';
import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { CategoryTab } from './CategoryTab';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryPress: (category: string) => void;
  scrollY?: SharedValue<number>;
  showBackground?: boolean;
  scrollToTop?: () => void; // Optional prop to scroll main content to top
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function CategoryTabs({
  activeCategory,
  onCategoryPress,
  scrollY,
  showBackground = false,
  scrollToTop,
}: CategoryTabsProps) {
  // Fix: Change the ref type to use the instance type instead of the component class
  const categoriesScrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleCategoryPress = async (category: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Call scrollToTop if provided - this will position the tabs at the top of the screen
    if (scrollToTop) {
      scrollToTop();
    }

    onCategoryPress(category);

    const categories = ['all', 'electronics', 'audio', 'watches', 'computers'];
    const index = categories.indexOf(category);

    // Modified calculation to position the active tab at the left
    // instead of centering it
    const buttonWidth = 100; // Fixed width of each button
    const gapWidth = spacing.sm;
    const totalItemWidth = buttonWidth + gapWidth;

    // Calculate position to make the active tab the leftmost visible tab
    // with a small padding from the left edge
    const leftPadding = spacing.md; // Padding from the left edge
    const calculatedPosition = Math.max(0, totalItemWidth * index - leftPadding);

    // Scroll to the calculated position
    categoriesScrollRef.current?.scrollTo({
      x: calculatedPosition,
      animated: true,
    });
  };

  const handleSearchPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/campaigns/search');
  };

  // Animated style for the categories background
  const categoriesBackgroundStyle = useAnimatedStyle(() => {
    if (!scrollY) return { opacity: showBackground ? 0.8 : 0 };

    const opacity = interpolate(scrollY.value, [0, 10, 50], [0, 0.3, 0.8], {
      extrapolateRight: 'clamp',
    });

    return {
      opacity,
      backgroundColor: colors.white,
    };
  });

  // Adjusted thresholds to make the search icon appear later in the scroll
  const searchButtonStyle = useAnimatedStyle(() => {
    if (!scrollY) return { transform: [{ translateX: -50 }], opacity: 0 };

    // Increased threshold values to delay the search icon appearance
    const translateX = interpolate(
      scrollY.value,
      [80, 110, 180], // Higher threshold values to make it appear later
      [-50, -20, 0],
      { extrapolateRight: 'clamp' },
    );

    const opacity = interpolate(
      scrollY.value,
      [80, 110, 180], // Matching thresholds
      [0, 0.5, 1],
      { extrapolateRight: 'clamp' },
    );

    return {
      transform: [{ translateX }],
      opacity,
    };
  });

  // Dynamic padding style with adjusted thresholds
  const categoriesContainerStyle = useAnimatedStyle(() => {
    if (!scrollY) return { paddingLeft: 0 };

    // Match the same higher thresholds as the search button
    const paddingLeft = interpolate(scrollY.value, [80, 110, 180], [0, 25, 50], {
      extrapolateRight: 'clamp',
    });

    return {
      paddingLeft,
    };
  });

  return (
    <View style={styles.categoriesWrapper}>
      {/* Search Button with delayed appearance */}
      <AnimatedPressable
        style={[styles.searchIconContainer, searchButtonStyle]}
        onPress={handleSearchPress}>
        <View style={styles.searchIconButton}>
          <MagnifyingGlass size={20} color={colors.text.primary} weight="bold" />
        </View>
      </AnimatedPressable>

      <AnimatedScrollView
        ref={categoriesScrollRef as any} // Use type assertion to fix the type error
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
        style={[styles.categoriesContainer, categoriesContainerStyle]}>
        <View style={styles.categories}>
          <CategoryTab
            title="All Campaigns"
            icon={
              <SquaresFour
                size={20}
                color={activeCategory === 'all' ? colors.white : colors.text.primary}
                weight="fill"
              />
            }
            isActive={activeCategory === 'all'}
            onPress={() => handleCategoryPress('all')}
          />
          <CategoryTab
            title="Electronics"
            icon={
              <Cpu
                size={20}
                color={activeCategory === 'electronics' ? colors.white : colors.text.primary}
                weight="fill"
              />
            }
            isActive={activeCategory === 'electronics'}
            onPress={() => handleCategoryPress('electronics')}
          />
          <CategoryTab
            title="Audio"
            icon={
              <Headphones
                size={20}
                color={activeCategory === 'audio' ? colors.white : colors.text.primary}
                weight="fill"
              />
            }
            isActive={activeCategory === 'audio'}
            onPress={() => handleCategoryPress('audio')}
          />
          <CategoryTab
            title="Watches"
            icon={
              <Watch
                size={20}
                color={activeCategory === 'watches' ? colors.white : colors.text.primary}
                weight="fill"
              />
            }
            isActive={activeCategory === 'watches'}
            onPress={() => handleCategoryPress('watches')}
          />
          <CategoryTab
            title="Computers"
            icon={
              <Laptop
                size={20}
                color={activeCategory === 'computers' ? colors.white : colors.text.primary}
                weight="fill"
              />
            }
            isActive={activeCategory === 'computers'}
            onPress={() => handleCategoryPress('computers')}
          />
        </View>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesWrapper: {
    position: 'relative',
    zIndex: 10,
    backgroundColor: colors.white,
    marginHorizontal: -spacing.md,
  },
  categoriesBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  categoriesContainer: {
    paddingVertical: spacing.md,
    // Remove the fixed paddingLeft here since we're using animated padding
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
  },
  categories: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchIconContainer: {
    position: 'absolute',
    backgroundColor: colors.white,
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    left: 0,
    top: 0,
    zIndex: 10,
  },
  searchIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
});
