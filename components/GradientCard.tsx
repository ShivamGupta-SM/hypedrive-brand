import { borderRadius, colors } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ColorValue, StyleSheet, ViewStyle } from 'react-native';

type GradientCardProps = {
  baseColor: string;
  style?: ViewStyle;
  children: React.ReactNode;
};

export default function GradientCard({ baseColor, style, children }: GradientCardProps) {
  // Generate gradient colors based on the base color
  const generateGradient = (color: string): readonly [ColorValue, ColorValue] => {
    // Default to orange if no color provided
    const baseColorToUse = color || colors.orange[600];

    // Create a lighter version for the gradient end
    const lighterColor = baseColorToUse.replace(/[^#]00/, '10');

    return [baseColorToUse, lighterColor] as const;
  };

  return (
    <LinearGradient
      colors={generateGradient(baseColor)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});
