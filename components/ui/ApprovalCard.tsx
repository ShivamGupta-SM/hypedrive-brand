import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CaretRight } from 'phosphor-react-native';
import React from 'react';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalItem = {
  id: string;
  name: string;
  productName?: string;
  productCode?: string;
  price?: string;
  marketplace?: string;
  approvedBy?: string;
  approvedTime?: string;
  status: ApprovalStatus;
  screenshots?: string[];
};

type ApprovalCardProps = {
  item: ApprovalItem;
  onPress: (item: ApprovalItem) => void;
};

export const ApprovalCard = ({ item, onPress }: ApprovalCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.userContainer}>
          {item.approvedBy ? (
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <View style={styles.checkIcon}>
                  <Text style={styles.checkIconText}>✓</Text>
                </View>
              </View>
              <View>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.approvalTime}>Approved {item.approvedTime}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.userName}>{item.name}</Text>
          )}
          
          {item.status === 'approved' && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Approved</Text>
            </View>
          )}
        </View>
      </View>
      
      {item.productName && (
        <View style={styles.productContainer}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.productName}</Text>
            {item.productCode && (
              <Text style={styles.productCode}>#{item.productCode}</Text>
            )}
          </View>
          {item.price && (
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.orderLabel}>Order Value</Text>
            </View>
          )}
        </View>
      )}
      
      {item.screenshots && item.screenshots.length > 0 && (
        <View style={styles.screenshotsContainer}>
          <Text style={styles.screenshotsLabel}>Deliverable Screenshots</Text>
          <View style={styles.screenshotsList}>
            {item.screenshots.map((screenshot, index) => (
              <View key={index} style={styles.screenshotItem}>
                <Image source={{ uri: screenshot }} style={styles.screenshotImage} />
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {item.approvedBy && (
        <View style={styles.footer}>
          <View style={styles.approvedByContainer}>
            <View style={styles.smallAvatar}></View>
            <Text style={styles.approvedByText}>Approved by {item.approvedBy}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    overflow: 'hidden',
    marginBottom: spacing.md,
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
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.green[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  userName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  approvalTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  statusBadge: {
    backgroundColor: colors.green[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  statusText: {
    color: colors.green[600],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  productContainer: {
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  productCode: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  orderLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  screenshotsContainer: {
    padding: spacing.md,
  },
  screenshotsLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  screenshotsList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  screenshotItem: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
  },
  screenshotImage: {
    width: '100%',
    height: '100%',
  },
  viewAllButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  viewAllText: {
    color: colors.blue[500],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  approvedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray[200],
  },
  approvedByText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});