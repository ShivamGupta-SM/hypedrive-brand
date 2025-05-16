import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SelectFieldProps = {
  placeholder: string;
  value: string;
  onPress: () => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
};

export function SelectField({
  placeholder,
  value,
  onPress,
  leftIcon,
  rightIcon,
  error,
  errorMessage,
  disabled = false,
}: SelectFieldProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.selectField,
          error && styles.errorField,
          disabled && styles.disabledField,
        ]}
        onPress={onPress}
        disabled={disabled}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholderText,
            disabled && styles.disabledText,
          ]}>
          {value || placeholder}
        </Text>
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </Pressable>
      {error && errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
  },
  errorField: {
    borderColor: colors.red[500],
  },
  disabledField: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  selectText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.muted,
  },
  disabledText: {
    color: colors.text.muted,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.xs,
    color: colors.red[500],
  },
});