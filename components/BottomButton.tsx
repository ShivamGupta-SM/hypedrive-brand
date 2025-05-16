import { GradientButton } from '@/components/GradientButton';
import { colors, spacing } from '@/constants/Design';
import React, { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type BottomButtonProps = {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  style?: ViewStyle;
  gradientColors?: readonly [string, string, ...string[]];
};

export function BottomButton({
  title,
  onPress,
  icon,
  iconPosition = 'right',
  loading = false,
  style,
  gradientColors = [colors.orange[500], colors.orange[600]],
}: BottomButtonProps) {
  return (
    <View style={[styles.bottomButtonContainer, style]}>
      <GradientButton
        title={title}
        onPress={onPress}
        loading={loading}
        gradientColors={gradientColors}
        icon={icon}
        iconPosition={iconPosition}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.mg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
});
