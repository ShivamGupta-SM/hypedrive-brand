import { spacing } from '@/constants/Design';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function EnrollmentCard() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardTop}>
        <Image
          source={{
            uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/6534036631-c60508c48fca817f2939.png',
          }}
          style={styles.productImage}
        />
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle} numberOfLines={1}>
              Apple AirPods Pro - 2025 Model with 2GB RAM and 64GB Storage
            </Text>
            <Text style={styles.statusBadge}>Pending</Text>
          </View>
          <View style={styles.idRow}>
            <Text style={styles.orderId} numberOfLines={1}>
              #112-7447943-37852669-87709
            </Text>
            <Text style={styles.amount}>₹1,26,499</Text>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
              <Text style={styles.metaText} numberOfLines={1}>
                Amazon · Jan 19, 2025
              </Text>
            </View>
            <View style={styles.metaRight}>
              <Text style={styles.metaTime}>2h ago</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.cardBottom}>
        <Image
          source={{
            uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
          }}
          style={styles.avatar}
        />
        <View style={styles.enrolledBy}>
          <Text style={styles.enrolledByLabel}>Enrolled by</Text>
          <Text style={styles.enrolledByName} numberOfLines={1}>
            Alex Chen
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f3f3',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
    gap: 16,
  },
  productImage: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f3f3',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: '#fff7ed',
    color: '#ea580c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
  },
  amount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#16a34a',
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  metaText: {
    fontSize: 11,
    color: '#6b7280',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaTime: {
    fontSize: 11,
    color: '#6b7280',
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  enrolledBy: {
    flex: 1,
  },
  enrolledByLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  enrolledByName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
});
