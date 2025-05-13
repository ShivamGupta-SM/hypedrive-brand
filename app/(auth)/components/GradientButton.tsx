import { colors, spacing, typography } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
}

export function GradientButton({
  onPress,
  title,
  style,
  textStyle,
  leftIcon,
}: GradientButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.buttonContainer, style]}>
      <LinearGradient
        colors={[colors.primary, '#FF5500']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
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
});
