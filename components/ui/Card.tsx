import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { StyleSheet, Text, TextProps, View, ViewProps } from 'react-native';

type BaseProps = {
  style?: ViewProps['style'];
  children?: React.ReactNode;
};

const Card = React.forwardRef<View, BaseProps>(({ style, children, ...props }, ref) => {
  return (
    <View ref={ref} style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
});

const CardHeader = React.forwardRef<View, BaseProps>(({ style, children, ...props }, ref) => (
  <View ref={ref} style={[styles.header, style]} {...props}>
    {children}
  </View>
));

const CardTitle = React.forwardRef<Text, TextProps & BaseProps>(
  ({ style, children, ...props }, ref) => (
    <Text ref={ref} style={[styles.title, style]} {...props}>
      {children}
    </Text>
  ),
);

const CardContent = React.forwardRef<View, BaseProps>(({ style, children, ...props }, ref) => (
  <View ref={ref} style={[styles.content, style]} {...props}>
    {children}
  </View>
));

const CardFooter = React.forwardRef<View, BaseProps>(({ style, children, ...props }, ref) => (
  <View ref={ref} style={[styles.footer, style]} {...props}>
    {children}
  </View>
));

// Component display names
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardFooter, CardHeader, CardTitle };

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    overflow: 'hidden',
    marginBottom: spacing.mg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    paddingHorizontal: spacing.mg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.gray[50],
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
  },
  content: {
    padding: spacing.mg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: 0,
  },
});
