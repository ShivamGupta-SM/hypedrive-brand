import { borderRadius, colors, getGradient, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'gradient';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
type ColorIntensity = 'light' | 'default' | 'dark';

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  title?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  gradientIntensity?: ColorIntensity;
  gradientColor?: 'orange' | 'blue' | 'green' | 'purple' | 'rose';
}

interface IconProps {
  color?: string;
  size?: number;
  weight?: string;
}

export const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      title,
      style,
      textStyle,
      disabled,
      gradientIntensity = 'default',
      gradientColor = 'orange',
      ...props
    },
    ref,
  ) => {
    // Get gradient colors using our helper function
    const gradientColors =
      variant === 'gradient' ? getGradient(gradientColor, gradientIntensity) : undefined;

    // Dynamic styles based on variant and size
    const sizeKey = `size${size.charAt(0).toUpperCase()}${size.slice(1)}` as keyof typeof styles;
    const variantKey = variant as keyof typeof styles;
    const variantTextKey = `${variant}Text` as keyof typeof styles;
    const sizeTextKey =
      `text${size.charAt(0).toUpperCase()}${size.slice(1)}` as keyof typeof styles;

    const buttonStyles = [
      styles.base,
      styles[sizeKey],
      styles[variantKey],
      disabled && styles.disabled,
      style,
    ].filter(Boolean) as StyleProp<ViewStyle>[];

    const textStyles = [styles.text, styles[variantTextKey], styles[sizeTextKey], textStyle].filter(
      Boolean,
    ) as StyleProp<TextStyle>[];

    // Get the current text color for both text and icons
    const getTextColor = () => {
      if (variant === 'outline') return colors.text.primary;
      if (variant === 'link') return colors.orange[500];
      if (variant === 'ghost' || variant === 'secondary') return colors.text.primary;
      return colors.white;
    };

    const textColor = getTextColor();

    // Clone icon with the correct color
    const renderIcon = (iconElement: React.ReactNode) => {
      if (React.isValidElement<IconProps>(iconElement)) {
        return React.cloneElement(iconElement, {
          color: textColor,
          size: size === 'sm' ? 16 : size === 'lg' ? 24 : 20,
          weight: 'bold',
        });
      }
      return iconElement;
    };

    const content = (
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <>
            {icon && iconPosition === 'left' && renderIcon(icon)}
            {title && <Text style={textStyles}>{title}</Text>}
            {icon && iconPosition === 'right' && renderIcon(icon)}
          </>
        )}
      </View>
    );

    return (
      <TouchableOpacity
        ref={ref}
        style={buttonStyles}
        disabled={disabled || loading}
        activeOpacity={0.7}
        {...props}>
        {variant === 'gradient' && gradientColors ? (
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            {content}
          </LinearGradient>
        ) : (
          content
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 2, // Add vertical padding for better alignment
    zIndex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  // Variants
  default: {
    backgroundColor: colors.orange[500],
  },
  destructive: {
    backgroundColor: colors.red[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border.medium,
  },
  secondary: {
    backgroundColor: colors.gray[200],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
    padding: 0,
  },
  gradient: {
    // Empty because gradient is handled by LinearGradient
  },
  // Sizes
  sizeSm: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sizeMd: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sizeLg: {
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sizeIcon: {
    width: 44,
    height: 44,
    padding: 0,
  },
  // Text Styles
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  defaultText: {
    color: colors.white,
  },
  destructiveText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.text.primary,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  ghostText: {
    color: colors.text.primary,
  },
  linkText: {
    color: colors.orange[500],
    textDecorationLine: 'underline',
  },
  gradientText: {
    color: colors.white,
  },
  // Size-specific text styles
  textSm: {
    fontSize: typography.sizes.sm,
  },
  textMd: {
    fontSize: typography.sizes.md,
  },
  textLg: {
    fontSize: typography.sizes.lg,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
});
