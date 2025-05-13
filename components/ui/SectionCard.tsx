import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { StyleSheet, Text, View } from 'react-native';

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  titleWithBackground?: boolean;
  style?: object;
  titleStyle?: object;
  contentStyle?: object;
};

export const SectionCard = ({
  title,
  children,
  titleWithBackground = false,
  ...props
}: SectionCardProps) => {
  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          titleWithBackground && styles.sectionTitleWithBackground,
          props.titleStyle,
        ]}>
        {title}
      </Text>
      <View style={[styles.content, props.contentStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.mg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    overflow: 'hidden',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    padding: spacing.mg,
    paddingVertical: spacing.md,
    backgroundColor: colors.gray[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitleWithBackground: {
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.mg,
  },
});
