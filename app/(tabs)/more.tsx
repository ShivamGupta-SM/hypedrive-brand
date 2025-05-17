import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { Link, LinkProps, router } from 'expo-router';
import {
  Bank,
  Bell,
  Bell as BellIcon,
  CaretRight,
  ClockCounterClockwise,
  FileText,
  Question,
  Shield,
  ShoppingBag,
  User,
  Users,
} from 'phosphor-react-native';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Section type for our settings
type SettingsSectionItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  route: LinkProps['href'];
};

// Group settings by section
type SettingsSection = {
  title: string;
  items: SettingsSectionItem[];
};

export default function MoreScreen() {
  // Define all settings sections
  const settingsSections: SettingsSection[] = [
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        {
          id: 'profile',
          title: 'Profile',
          icon: <User size={22} color={colors.orange[500]} weight="fill" />,
          route: '/(brand)/profile',
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: <BellIcon size={22} color={colors.green[500]} weight="fill" />,
          route: '/(brand)/notifications',
        },
      ],
    },
    {
      title: 'BUSINESS',
      items: [
        {
          id: 'team-members',
          title: 'Team Members',
          icon: <Users size={22} color={colors.green[500]} weight="fill" />,
          route: '/team-members',
        },
        {
          id: 'products',
          title: 'Products',
          icon: <ShoppingBag size={22} color={colors.blue[500]} weight="fill" />,
          route: '/product/all',
        },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        {
          id: 'virtual-account',
          title: 'Virtual Account',
          icon: <Bank size={22} color={colors.orange[500]} weight="fill" />,
          route: '/(brand)/virtual-account',
        },
        {
          id: 'payment-history',
          title: 'Payment History',
          icon: <ClockCounterClockwise size={22} color={colors.orange[500]} weight="fill" />,
          route: '/(brand)/payment-history',
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          id: 'help-center',
          title: 'Help Center',
          icon: <Question size={22} color={colors.green[500]} weight="fill" />,
          route: '/help-center',
        },
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          icon: <Shield size={22} color={colors.orange[500]} weight="fill" />,
          route: '/privacy-policy',
        },
        {
          id: 'terms-of-service',
          title: 'Terms of Service',
          icon: <FileText size={22} color={colors.green[500]} weight="fill" />,
          route: '/terms-of-service',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/(brand)/notifications')}
        >
          <Bell size={24} color={colors.text.primary} weight="regular" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Brand/Account Card */}

        <TouchableOpacity style={styles.brandCard} onPress={() => router.push('/(brand)/profile')}>
          <View style={styles.brandInfo}>
            <Image source={require('@/assets/icons/apple-icon.png')} style={styles.brandLogo} />
            <View>
              <Text style={styles.brandName}>Apple</Text>
              <Text style={styles.brandEmail}>Brand@apple.com</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified Account</Text>
              </View>
            </View>
          </View>
          <CaretRight size={20} color={colors.gray[400]} />
        </TouchableOpacity>

        {/* Settings Sections */}
        {settingsSections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <Link href={item.route} key={item.id} asChild>
                  <TouchableOpacity
                    style={[
                      styles.settingItem,
                      index !== section.items.length - 1 && styles.settingItemBorder,
                    ]}>
                    <View style={styles.settingItemLeft}>
                      {item.icon}
                      <Text style={styles.settingItemText}>{item.title}</Text>
                    </View>
                    <CaretRight size={20} color={colors.gray[400]} />
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.mg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.orange[500],
    borderWidth: 2,
    borderColor: colors.white,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.mg,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.black,
  },
  brandName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  brandEmail: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: colors.green[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    color: colors.green[600],
    fontWeight: typography.weights.semibold,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingItemText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  signOutButton: {
    backgroundColor: colors.red[500],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  signOutText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
});
