import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

type ProductDetail = {
  label: string;
  value: string;
  isLink?: boolean;
  linkUrl?: string;
  isPlatform?: boolean;
  platformIcon?: string;
};

type ProductDetailsSectionProps = {
  details: ProductDetail[];
  title?: string;
  icon?: string;
};

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
  details,
  title = 'Product Details',
  icon = '📋',
}) => {
  const handleOpenLink = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionIconContainer}>
          <Text style={styles.sectionIcon}>{icon}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.detailsTable}>
        {details.map((detail, index) => (
          <View
            key={index}
            style={[
              styles.detailRow,
              index === details.length - 1 && styles.lastDetailRow,
            ]}
          >
            <Text style={styles.detailLabel}>{detail.label}</Text>
            {detail.isLink ? (
              <TouchableOpacity onPress={() => handleOpenLink(detail.linkUrl || '')}>
                <Text style={styles.productLink}>{detail.value}</Text>
              </TouchableOpacity>
            ) : detail.isPlatform ? (
              <View style={styles.platformContainer}>
                <Text style={styles.platformText}>{detail.platformIcon || 'a'}</Text>
                <Text style={styles.detailValue}>{detail.value}</Text>
              </View>
            ) : (
              <Text style={styles.detailValue}>{detail.value}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionIconContainer: {
    marginRight: spacing.sm,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  detailsTable: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
    backgroundColor: colors.orange[500],
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 16,
    marginRight: spacing.xs,
  },
  productLink: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
});

export default ProductDetailsSection;
