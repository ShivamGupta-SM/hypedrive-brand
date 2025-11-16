import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React, { useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  leftIcon?: React.ReactNode;
  leftIconStyle?: StyleProp<ViewStyle>;
  leftIconColor?: string;
  rightIcon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

interface IconProps {
  color: string;
  size: number;
  weight?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      leftIcon,
      leftIconStyle,
      leftIconColor,
      rightIcon,
      rightAddon,
      error,
      errorMessage,
      style,
      containerStyle,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const inputStyles = [
      styles.input,
      leftIcon && styles.inputWithLeftIcon,
      rightIcon && styles.inputWithRightIcon,
      isFocused && styles.inputFocused,
      error && styles.inputError,
      style,
    ].filter(Boolean) as StyleProp<TextStyle>;

    const getIconStyle = (position: 'left' | 'right'): StyleProp<ViewStyle> => {
      const positionStyles = position === 'left' ? styles.leftIcon : styles.rightIcon;
      return [
        styles.iconBase,
        positionStyles,
        {
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        },
      ] as StyleProp<ViewStyle>;
    };

    const getIconColor = () => {
      if (leftIconColor) return leftIconColor;
      if (error) return colors.rose[500];
      if (isFocused) return colors.orange[500];
      return colors.text.muted;
    };

    const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {leftIcon && (
          <View style={[getIconStyle('left'), styles.iconWrapper]}>
            {React.cloneElement(leftIcon as React.ReactElement<IconProps>, {
              color: getIconColor(),
              size: 20,
              weight: 'fill',
            })}
          </View>
        )}
        <TextInput
          ref={ref}
          style={inputStyles}
          placeholderTextColor={colors.text.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <View style={[getIconStyle('right'), styles.iconWrapper]}>
            {React.cloneElement(rightIcon as React.ReactElement<IconProps>, {
              color: getIconColor(),
              size: 20,
              weight: 'fill',
            })}
          </View>
        )}
        {rightAddon && <View style={styles.rightAddon}>{rightAddon}</View>}
        {error && errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xl * 1.5,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xl * 2,
  },
  inputFocused: {
    borderColor: colors.orange[500],
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.rose[500],
    backgroundColor: colors.rose[50],
  },
  iconBase: {
    position: 'absolute',
    width: spacing.xl * 1.6,
    zIndex: 1,
    paddingHorizontal: spacing.md,
  },
  leftIcon: {
    left: 0,
  },
  rightIcon: {
    right: 0,
  },
  rightAddon: {
    position: 'absolute',
    right: spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  iconWrapper: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  errorMessage: {
    color: colors.rose[500],
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
    position: 'absolute',
    top: '100%',
    left: 0,
  },
});
