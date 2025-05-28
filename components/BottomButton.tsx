import { GradientButton } from '@/components/GradientButton';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React, { ReactNode } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Type for individual button in the bottom bar
type ButtonItem = {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
  flex?: number;
  variant?: 'gradient' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
};

// Props for the entire bottom button container
type BottomButtonsProps = {
  buttons: ButtonItem[] | ButtonItem;
  containerStyle?: ViewStyle;
  layout?: 'row' | 'column';
  spacing?: number;
  safeAreaOffset?: boolean;
  fixedHeight?: boolean;
  backgroundColor?: string;
  showShadow?: boolean;
  showBorder?: boolean;
};

// Legacy single button support
type BottomButtonProps = {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  style?: ViewStyle;
  gradientColors?: readonly [string, string, ...string[]];
};

// Outline button component for alternative button style
const OutlineButton = ({ 
  title, 
  onPress, 
  icon, 
  iconPosition = 'right',
  loading = false,
  size = 'md',
}: Omit<ButtonItem, 'gradientColors' | 'flex' | 'variant'>) => {
  // Get button size styles based on size prop
  const buttonHeight = size === 'sm' ? 42 : size === 'md' ? 52 : 64;
  const fontSize = size === 'sm' ? typography.sizes.sm : size === 'md' ? typography.sizes.md : typography.sizes.lg;
  const buttonRadius = size === 'sm' ? borderRadius.md : borderRadius.lg;
  
  return (
    <TouchableOpacity 
      style={[
        styles.outlineButton, 
        { height: buttonHeight, borderRadius: buttonRadius }
      ]} 
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <View style={styles.buttonContent}>
          <View style={styles.loadingIndicator} />
        </View>
      ) : (
        <View style={styles.buttonContent}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.outlineButtonText, { fontSize }]}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Text button component for minimal button style
const TextButton = ({ 
  title, 
  onPress, 
  icon, 
  iconPosition = 'right',
  size = 'md',
}: Omit<ButtonItem, 'gradientColors' | 'flex' | 'variant' | 'loading'>) => {
  const fontSize = size === 'sm' ? typography.sizes.sm : size === 'md' ? typography.sizes.md : typography.sizes.lg;
  
  return (
    <TouchableOpacity style={styles.textButton} onPress={onPress}>
      <View style={styles.buttonContent}>
        {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
        <Text style={[styles.textButtonText, { fontSize }]}>{title}</Text>
        {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
      </View>
    </TouchableOpacity>
  );
};

// Main component that supports multiple buttons
export function BottomButtons({
  buttons,
  containerStyle,
  layout = 'column',
  spacing: buttonSpacing = spacing.md,
  safeAreaOffset = true,
  fixedHeight = false,
  backgroundColor = colors.white,
  showShadow = true,
  showBorder = true,
}: BottomButtonsProps) {
  const insets = useSafeAreaInsets();
  const buttonArray = Array.isArray(buttons) ? buttons : [buttons];
  
  // Calculate safe area padding for different platforms
  const bottomPadding = safeAreaOffset 
    ? Platform.OS === 'ios' 
      ? Math.max(insets.bottom, spacing.md) 
      : spacing.xl // Increased padding for Android
    : spacing.md;
  
  // Calculate container height if fixed height is requested
  const containerHeight = fixedHeight 
    ? Platform.OS === 'ios' 
      ? 90 + insets.bottom 
      : 90 
    : undefined;
  
  return (
    <View 
      style={[
        styles.bottomButtonContainer, 
        {
          padding: spacing.md,
          paddingBottom: bottomPadding,
          backgroundColor,
          height: containerHeight,
          borderTopWidth: showBorder ? 1 : 0,
          ...(!showShadow && { shadowOpacity: 0, elevation: 0 })
        },
        containerStyle
      ]}
    >
      <View style={[
        layout === 'row' ? styles.rowLayout : styles.columnLayout,
        { gap: buttonSpacing }
      ]}>
        {buttonArray.map((button, index) => {
          const buttonStyle = { flex: button.flex || (layout === 'row' ? 1 : undefined) };
          
          if (button.variant === 'outline') {
            return (
              <View key={`button-${index}`} style={buttonStyle}>
                <OutlineButton
                  title={button.title}
                  onPress={button.onPress}
                  icon={button.icon}
                  iconPosition={button.iconPosition}
                  loading={button.loading}
                  size={button.size}
                />
              </View>
            );
          } else if (button.variant === 'text') {
            return (
              <View key={`button-${index}`} style={buttonStyle}>
                <TextButton
                  title={button.title}
                  onPress={button.onPress}
                  icon={button.icon}
                  iconPosition={button.iconPosition}
                  size={button.size}
                />
              </View>
            );
          } else {
            // Default gradient button
            return (
              <View key={`button-${index}`} style={buttonStyle}>
                <GradientButton
                  title={button.title}
                  onPress={button.onPress}
                  loading={button.loading}
                  gradientColors={button.gradientColors || [colors.orange[500], colors.orange[600]]}
                  icon={button.icon}
                  endPoint={{ x: 0, y: 1 }}
                  iconPosition={button.iconPosition || 'right'}
                  size={button.size}
                />
              </View>
            );
          }
        })}
      </View>
    </View>
  );
}

// Legacy support for single button use case
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
    <BottomButtons
      buttons={{
        title,
        onPress,
        icon,
        iconPosition,
        loading,
        gradientColors,
      }}
      containerStyle={style}
    />
  );
}

const styles = StyleSheet.create({
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 100,
  },
  rowLayout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  outlineButton: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: colors.gray[800],
    fontWeight: typography.weights.semibold,
  },
  textButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textButtonText: {
    color: colors.orange[500],
    fontWeight: typography.weights.semibold,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.orange[500],
    borderTopColor: 'transparent',
    alignSelf: 'center',
  },
});
