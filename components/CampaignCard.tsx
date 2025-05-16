import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Clock, UsersThree } from 'phosphor-react-native';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './ui/Button';

interface CampaignCardProps {
  id: string;
  title: string;
  category: string;
  rebatePercentage: number;
  originalPrice: string;
  afterRebate: string;
  spots: number;
  daysLeft: number;
  image: any;
  onEnroll?: () => void;
}

export function CampaignCard({
  id,
  title,
  category,
  rebatePercentage,
  originalPrice,
  afterRebate,
  spots,
  daysLeft,
  image,
  onEnroll,
}: CampaignCardProps) {
  return (
    <Link href={`/(screens)/campaigns/${id}`} asChild>
      <Pressable style={styles.container}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={image} style={styles.brandIcon} />
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.category}>{category}</Text>
            </View>
          </View>
          <View style={styles.rebateContainer}>
            <Text style={styles.rebate}>{rebatePercentage}% Rebate</Text>
          </View>
        </View>

        <Image source={image} style={styles.productImage} />

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Original Price</Text>
            <Text style={styles.price}>₹{originalPrice}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.text.muted} />
          <View style={[styles.priceContainer, styles.rebatePriceContainer]}>
            <Text style={styles.priceLabel}>After Rebate</Text>
            <Text style={[styles.price, styles.rebatePrice]}>₹{afterRebate}</Text>
          </View>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <UsersThree size={20} color={colors.text.secondary} weight="fill" />
            <Text style={styles.metaText}>{spots} spots</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={20} color={colors.text.secondary} />
            <Text style={styles.metaText}>{daysLeft} days left</Text>
          </View>
          <Button
            title="Enroll Now"
            variant="default"
            style={styles.enrollButton}
            size="sm"
            onPress={onEnroll}
          />
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  priceContainer: {
    flex: 1,
  },
  arrow: {
    width: 20,
    height: 20,
    backgroundColor: colors.gray[300],
    marginHorizontal: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  // Text styles
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  category: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  rebateContainer: {
    backgroundColor: colors.green[50],
    paddingHorizontal: spacing.xm,
    borderWidth: 1,
    borderColor: colors.green[100],
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  rebate: {
    fontSize: typography.sizes.xs,
    color: colors.green[600],
    fontWeight: typography.weights.semibold,
  },
  rebatePriceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  rebatePrice: {
    color: colors.green[600],
    fontWeight: typography.weights.bold,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  enrollButton: {
    backgroundColor: colors.gray[800],
    paddingHorizontal: spacing.md,
  },
});
