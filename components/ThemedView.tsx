import React from 'react';
import { View, ViewProps } from 'react-native';
import { colors } from '@/constants/Design';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = lightColor ?? colors.white;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
