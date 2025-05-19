import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { CaretRight } from 'phosphor-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SectionItemProps = {
  icon: React.ReactNode;
  label: string;
  iconColor?: string;
  iconBg?: string;
  onPress?: () => void;
};

export const SectionItem = ({
  icon,
  label,
  iconBg,
  iconColor,
  onPress = () => {},
}: SectionItemProps) => {
  return (
    <Pressable 
      style={styles.button} 
      onPress={onPress}
      android_ripple={{ color: colors.gray[100] }}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg || colors.gray[50] }]}>
          {icon}
        </View>
        <Text style={styles.label}>{label}</Text>
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
