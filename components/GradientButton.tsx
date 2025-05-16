import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  ColorValue,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type ButtonSize = 'sm' | 'md' | 'lg';

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loadingText?: string;
  loadingIndicatorColor?: ColorValue;
  loadingIndicatorSize?: number | 'small' | 'large';
  size?: ButtonSize;
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  gradientColors = [colors.primary, colors.secondary] as readonly [ColorValue, ColorValue],
  startPoint = { x: 0, y: 0 },
  endPoint = { x: 1, y: 1 },
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  loadingText,
  loadingIndicatorColor = colors.white,
  loadingIndicatorSize = 'small',
  size = 'md',
}) => {
  // Define the disabled colors with the correct type
  const disabledColors: readonly [ColorValue, ColorValue] = [colors.gray[300], colors.gray[400]];

  // Get the primary color for the shadow (first color in the gradient)
  const shadowColor = disabled ? colors.gray[300] : gradientColors[0];

  // Get button size styles
  const buttonSizeStyle = getButtonSizeStyle(size);
  const textSizeStyle = getTextSizeStyle(size);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonContainer,
        buttonSizeStyle,
        {
          shadowColor: shadowColor as string,
          elevation: 5,
        },
        style,
      ]}>
      <LinearGradient
        colors={disabled ? disabledColors : gradientColors}
        start={startPoint}
        end={endPoint}
        style={[styles.gradient, { height: '100%' }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={loadingIndicatorColor} size={loadingIndicatorSize} />
            {loadingText && (
              <Text
                style={[styles.buttonText, textSizeStyle, textStyle, { marginLeft: spacing.sm }]}>
                {loadingText}
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {icon && iconPosition === 'left' && (
              <View style={styles.iconContainerLeft}>{icon}</View>
            )}
            <Text
              style={[
                styles.buttonText,
                textSizeStyle,
                textStyle,
                disabled && styles.disabledText,
              ]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <View style={styles.iconContainerRight}>{icon}</View>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// Helper functions for size styles
const getButtonSizeStyle = (size: ButtonSize): ViewStyle => {
  switch (size) {
    case 'sm':
      return {
        height: 42,
        borderRadius: borderRadius.md,
      };
    case 'lg':
      return {
        height: 64,
        borderRadius: borderRadius.lg,
      };
    case 'md':
    default:
      return {
        height: 52,
        borderRadius: borderRadius.lg,
      };
  }
};

const getTextSizeStyle = (size: ButtonSize): TextStyle => {
  switch (size) {
    case 'sm':
      return {
        fontSize: typography.sizes.sm,
      };
    case 'lg':
      return {
        fontSize: typography.sizes.lg,
      };
    case 'md':
    default:
      return {
        fontSize: typography.sizes.md,
      };
  }
};

const styles = StyleSheet.create({
  buttonContainer: {
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  gradient: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  disabledText: {
    color: colors.gray[100],
  },
  iconContainerLeft: {
    marginRight: spacing.sm,
  },
  iconContainerRight: {
    marginLeft: spacing.sm,
  },
});
