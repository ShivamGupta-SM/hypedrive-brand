import { colors } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Switch, SwitchProps } from 'react-native';

interface ToggleSwitchProps extends Omit<SwitchProps, 'trackColor' | 'thumbColor' | 'ios_backgroundColor'> {
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  activeColor = colors.green[500],
  inactiveColor = colors.gray[300],
  thumbColor = colors.white,
  ...props
}) => {
  return (
    <Switch
      trackColor={{ false: inactiveColor, true: activeColor }}
      thumbColor={thumbColor}
      ios_backgroundColor={inactiveColor}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  // No styles needed as we're using the native Switch component with custom colors
});