import { AppHeader } from '@/components/ui/AppHeader';
import { SettingsSection, SettingsSectionItemType } from '@/components/ui/SettingsSection';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import {
  Bank,
  Bell,
  ClockCounterClockwise,
  FileText,
  Question,
  SealCheck,
  Shield,
  ShoppingBag,
  SignOut,
  User,
  Users,
} from 'phosphor-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SettingsSectionType = {
  title: string;
  items: SettingsSectionItemType[];
};

export default function MoreScreen() {
  // Define all settings sections
  const settingsSections: SettingsSectionType[] = [
    {
      title: 'ACCOUNT SETTINGS',
      items: [
        {
          id: 'profile',
          label: 'Profile',
          icon: <User size={22} color={colors.orange[500]} weight="fill" />,
          iconBg: colors.orange[50],
          route: '/(brand)/profile',
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <Bell size={22} color={colors.green[500]} weight="fill" />,
          iconBg: colors.green[50],
          route: '/(brand)/notification-settings',
        },
      ],
    },
    {
      title: 'BUSINESS',
      items: [
        {
          id: 'team-members',
          label: 'Team Members',
          icon: <Users size={22} color={colors.green[500]} weight="fill" />,
          iconBg: colors.green[50],
          route: '/(brand)/team-members',
        },
        {
          id: 'products',
          label: 'Products',
          icon: <ShoppingBag size={22} color={colors.blue[500]} weight="fill" />,
          iconBg: colors.blue[50],
          route: '/new',
        },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        {
          id: 'virtual-account',
          label: 'Virtual Account',
          icon: <Bank size={22} color={colors.orange[500]} weight="fill" />,
          iconBg: colors.orange[50],
          route: '/(brand)/virtual-account',
        },
        {
          id: 'payment-history',
          label: 'Payment History',
          icon: <ClockCounterClockwise size={22} color={colors.orange[500]} weight="fill" />,
          iconBg: colors.orange[50],
          route: '/(brand)/payment/payment-history',
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          id: 'help-center',
          label: 'Help Center',
          icon: <Question size={22} color={colors.green[500]} weight="fill" />,
          iconBg: colors.green[50],
          route: '/(brand)/contact-support',
        },
        {
          id: 'privacy-policy',
          label: 'Privacy Policy',
          icon: <Shield size={22} color={colors.orange[500]} weight="fill" />,
          iconBg: colors.orange[50],
          route: '/privacy-policy',
        },
        {
          id: 'terms-of-service',
          label: 'Terms of Service',
          icon: <FileText size={22} color={colors.green[500]} weight="fill" />,
          iconBg: colors.green[50],
          route: '/terms-of-service',
        },
      ],
    },
  ];

  const handleItemPress = (item: SettingsSectionItemType) => {
    router.push(item.route);
  };

  const handleSignOut = () => {
    // Handle sign out logic here
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="More"
        showNotification
        notificationCount={12}
        onNotificationPress={() => router.push('/(brand)/notifications')}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Brand/Account Card */}
        <TouchableOpacity style={styles.brandCard} onPress={() => router.push('/(brand)/profile')}>
          <View style={styles.brandInfo}>
            <Image
              source={require('@/assets/icons/google-color-icon.png')}
              style={styles.brandLogo}
            />
            <View>
              <Text style={styles.brandName}>Apple Brand</Text>
              <Text style={styles.brandEmail}>Brand@apple.com</Text>
              <View style={styles.verifiedBadge}>
                <SealCheck size={18} color={colors.green[500]} weight="fill" />
                <Text style={styles.verifiedText}>Verified Account</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Settings Sections */}
        {settingsSections.map(section => (
          <SettingsSection
            key={section.title}
            title={section.title}
            items={section.items}
            onItemPress={handleItemPress}
          />
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <SignOut size={22} color={colors.white} weight="bold" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.mg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.rose[400],
    borderWidth: 1,
    borderColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    padding: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandLogo: {
    width: 62,
    height: 62,
    borderRadius: borderRadius.full,
    backgroundColor: colors.black,
    padding: spacing.sm,
    objectFit: 'cover',
    borderWidth: 2.5,
    borderColor: colors.orange[600],
  },
  brandName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  brandEmail: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.green[50],
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  verifiedText: {
    fontSize: typography.sizes.xxs,
    color: colors.green[700],
    textAlign: 'center',
    fontWeight: typography.weights.semibold,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.rose[600],
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  signOutText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    fontWeight: typography.weights.semibold,
  },
});
