import { colors, spacing, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
}

export function GradientButton({
  onPress,
  title,
  style,
  textStyle,
  leftIcon,
  disabled = false,
}: GradientButtonProps) {
  return (
    <TouchableOpacity 
      onPress={disabled ? undefined : onPress} 
      style={[styles.buttonContainer, style, disabled && styles.disabled]}
      disabled={disabled}
    >
      <LinearGradient
        colors={disabled ? [colors.gray[300], colors.gray[400]] : [colors.primary, '#FF5500']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <Text style={[styles.buttonText, textStyle, disabled && styles.disabledText]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default GradientButton;

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: spacing.xm,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  gradient: {
    borderRadius: spacing.xm,
    padding: spacing.md,
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: colors.gray[500],
  },
});
