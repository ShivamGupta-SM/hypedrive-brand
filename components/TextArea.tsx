import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { StyleSheet, TextInput, View, Text } from 'react-native';

type TextAreaProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  numberOfLines?: number;
  maxLength?: number;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
};

export function TextArea({
  placeholder,
  value,
  onChangeText,
  numberOfLines = 4,
  maxLength,
  error,
  errorMessage,
  disabled = false,
}: TextAreaProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.textArea,
          { height: numberOfLines * 24 }, // Approximate line height
          error && styles.errorField,
          disabled && styles.disabledField,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        editable={!disabled}
        placeholderTextColor={colors.text.muted}
      />
      {error && errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  textArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  errorField: {
    borderColor: colors.red[500],
  },
  disabledField: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.xs,
    color: colors.red[500],
  },
  characterCount: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'right',
  },
});