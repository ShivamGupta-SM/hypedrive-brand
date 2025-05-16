import { colors, spacing, typography } from '@/constants/Design';
import * as React from 'react';
import { Text, TextProps } from 'react-native';

type LabelProps = TextProps & {
  children: React.ReactNode;
};

export const Label = React.forwardRef<Text, LabelProps>(({ style, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      style={[
        {
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.semibold,
          color: colors.text.primary,
          marginBottom: spacing.xs,
        },
        style,
      ]}
      {...props}
    />
  );
});

Label.displayName = 'Label';
