import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/Design';
import { LoadingSpinner } from './LoadingSpinner';

interface RetryButtonProps {
  onRetry: () => void;
  isRetrying?: boolean;
  text?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  showIcon?: boolean;
}

export function RetryButton({
  onRetry,
  isRetrying = false,
  text = 'Try Again',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  showIcon = true,
}: RetryButtonProps) {
  const isDisabled = disabled || isRetrying;

  const buttonStyle = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    isDisabled && styles.disabledButton,
  ];

  const textStyle = [
    styles.buttonText,
    styles[`${variant}ButtonText`],
    styles[`${size}ButtonText`],
    isDisabled && styles.disabledButtonText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onRetry}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {isRetrying ? (
        <LoadingSpinner 
          size="small" 
          color={variant === 'primary' ? colors.white : colors.primary} 
        />
      ) : (
        <>
          {showIcon && (
            <Ionicons 
              name="refresh" 
              size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
              color={variant === 'primary' ? colors.white : colors.primary} 
              style={styles.icon}
            />
          )}
          <Text style={textStyle}>{text}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: spacing.sm,
  } as ViewStyle,
  
  // Variants
  primaryButton: {
    backgroundColor: colors.primary,
  } as ViewStyle,
  
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.medium,
  } as ViewStyle,
  
  ghostButton: {
    backgroundColor: 'transparent',
  } as ViewStyle,
  
  // Sizes
  smallButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  } as ViewStyle,
  
  mediumButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  
  largeButton: {
    paddingVertical: spacing.mg,
    paddingHorizontal: spacing.xl,
  } as ViewStyle,
  
  // Disabled state
  disabledButton: {
    opacity: 0.5,
  } as ViewStyle,
  
  // Text styles
  buttonText: {
    fontWeight: typography.weights.semibold,
  } as TextStyle,
  
  primaryButtonText: {
    color: colors.white,
  } as TextStyle,
  
  secondaryButtonText: {
    color: colors.primary,
  } as TextStyle,
  
  ghostButtonText: {
    color: colors.primary,
  } as TextStyle,
  
  smallButtonText: {
    fontSize: typography.sizes.sm,
  } as TextStyle,
  
  mediumButtonText: {
    fontSize: typography.sizes.md,
  } as TextStyle,
  
  largeButtonText: {
    fontSize: typography.sizes.lg,
  } as TextStyle,
  
  disabledButtonText: {
    opacity: 0.7,
  } as TextStyle,
  
  icon: {
    marginRight: spacing.xs,
  } as TextStyle,
});