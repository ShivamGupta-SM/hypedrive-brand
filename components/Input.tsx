import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React, { ReactNode } from 'react';
import { StyleSheet, TextInput, View, Text, ViewStyle } from 'react-native';

type InputProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: boolean;
  errorMessage?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
  disabled?: boolean;
  style?: ViewStyle;
  autoFocus?: boolean;
};

export function Input({
  placeholder,
  value,
  onChangeText,
  leftIcon,
  rightIcon,
  error,
  errorMessage,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  maxLength,
  disabled = false,
  style,
  autoFocus = false,
}: InputProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          error && styles.errorContainer,
          disabled && styles.disabledContainer,
          style,
        ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          editable={!disabled}
          placeholderTextColor={colors.text.muted}
          autoFocus={autoFocus}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
  },
  errorContainer: {
    borderColor: colors.red[500],
  },
  disabledContainer: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  leftIcon: {
    marginRight: spacing.sm,
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