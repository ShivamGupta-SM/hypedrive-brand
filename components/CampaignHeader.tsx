import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type CampaignHeaderProps = {
  title?: string;
  onBack?: () => void;
};

export function CampaignHeader({ title = 'Create Campaign', onBack }: CampaignHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <Pressable onPress={handleBack} style={styles.backButton}>
        <ArrowLeft size={22} color={colors.text.primary} weight="bold" />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  placeholder: {
    width: 24,
  },
});