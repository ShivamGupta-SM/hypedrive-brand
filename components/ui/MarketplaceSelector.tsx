import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { Check } from 'phosphor-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type Marketplace = {
  id: string;
  name: string;
  logo: any;
};

type MarketplaceSelectorProps = {
  style?: StyleProp<ViewStyle>;
  options: Marketplace[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
};

export const MarketplaceSelector: React.FC<MarketplaceSelectorProps> = ({
  options,
  selectedValues,
  onChange,
  style,
}) => {
  const toggleSelection = (marketplaceId: string) => {
    const currentSelections = [...selectedValues];
    const index = currentSelections.indexOf(marketplaceId);

    if (index > -1) {
      currentSelections.splice(index, 1);
    } else {
      currentSelections.push(marketplaceId);
    }

    onChange(currentSelections);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}>
      {options.map(marketplace => {
        const isSelected = selectedValues.includes(marketplace.id);

        // Animated checkbox style
        const checkboxAnimatedStyle = useAnimatedStyle(() => {
          return {
            backgroundColor: withTiming(isSelected ? colors.blue[500] : colors.white, {
              duration: 200,
            }),
            borderColor: withTiming(isSelected ? colors.blue[500] : colors.gray[300], {
              duration: 200,
            }),
          };
        });

        return (
          <Pressable
            key={marketplace.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => toggleSelection(marketplace.id)}>
            <Image source={marketplace.logo} style={styles.logo} />
            <Text style={styles.name}>{marketplace.name}</Text>
            <Animated.View style={[styles.checkbox, checkboxAnimatedStyle]}>
              {isSelected && <Check size={14} weight="bold" color={colors.white} />}
            </Animated.View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.mg,
  },
  card: {
    width: 150,
    height: 100,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.blue[500],
    backgroundColor: colors.blue[50],
  },
  logo: {
    width: 40,
    height: 35,
    resizeMode: 'contain',
    marginBottom: spacing.sm,
    tintColor: colors.gray[400],
  },
  name: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  checkbox: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
