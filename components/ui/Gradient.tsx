import { colors } from '@/constants/Design';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

interface GradientProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function Gradient({ style, children }: GradientProps) {
  return (
    <LinearGradient
      colors={[colors.blue[700], colors.blue[600], colors.blue[500], colors.blue[300]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={style}>
      {children}
    </LinearGradient>
  );
}
