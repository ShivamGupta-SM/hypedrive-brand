import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { CaretRight } from 'phosphor-react-native';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

type SectionItemProps = {
  icon: React.ReactNode;
  label: string;
  iconColor?: string;
  iconBg?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  onPress?: () => void;
};

export const SectionItem = ({
  icon,
  label,
  iconBg,
  iconColor,
  containerStyle = {},
  labelStyle = {},
  onPress = () => {},
}: SectionItemProps) => {
  return (
    <Pressable
      style={[styles.button, containerStyle]}
      onPress={onPress}
      android_ripple={{ color: colors.gray[100] }}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg || colors.gray[50] }]}>
          {icon}
        </View>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </View>
      <CaretRight size={20} color={iconColor || colors.gray[400]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.sizes.md,
    color: colors.text.black,
    fontWeight: typography.weights.medium,
  },
});
