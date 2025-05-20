import { AppHeader } from '@/components/ui/AppHeader';
import { ProfileInfoItem } from '@/components/ui/ProfileInfoItem';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import * as Linking from 'expo-linking';
import {
  Buildings,
  CaretRight,
  Envelope,
  FacebookLogo,
  IdentificationCard,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Pencil,
  Phone,
  SealCheck,
  XLogo,
} from 'phosphor-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_URL_ADDRESS = 'www.google.com';

type SocialLinksType = {
  icon: React.ReactNode;
  label: string;
  iconColor: string;
  bgColor: string;
  link: string;
};

const socialLinks: SocialLinksType[] = [
  {
    icon: <XLogo size={22} weight="fill" color={colors.black} />,
    label: 'X',
    iconColor: colors.black,
    bgColor: colors.gray[50],
    link: `https://${MOCK_URL_ADDRESS}`,
  },
  {
    icon: <LinkedinLogo size={26} weight="fill" color={colors.blue[500]} />,
    label: 'LinkedIn',
    iconColor: colors.blue[800],
    bgColor: colors.blue[50],
    link: `https://${MOCK_URL_ADDRESS}`,
  },
  {
    icon: <InstagramLogo size={26} weight="fill" color={colors.rose[400]} />,
    label: 'Instagram',
    iconColor: colors.rose[400],
    bgColor: colors.rose[50],
    link: `https://${MOCK_URL_ADDRESS}`,
  },
  {
    icon: <FacebookLogo size={26} weight="fill" color={colors.blue[500]} />,
    label: 'Facebook',
    iconColor: colors.blue[500],
    bgColor: colors.blue[50],
    link: `https://${MOCK_URL_ADDRESS}`,
  },
];

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Profile" showBackButton={true} titleStyle={styles.headerTitle} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Brand Card */}
        <View style={styles.brandCard}>
          <View style={styles.brandHeaderDetails}>
            <View style={styles.brandImageWrapper}>
              <Image
                source={require('@/assets/icons/google-color-icon.png')}
                style={styles.brandImage}
              />
            </View>
            <View>
              <Text style={styles.brandName} numberOfLines={2} ellipsizeMode="tail">
                Apple India Pvt Ltd
              </Text>
              <View style={styles.brandPanDetails}>
                <IdentificationCard size={16} color={colors.text.muted} weight="fill" />
                <Text style={styles.brandPanText}>AABCU9603R</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <SealCheck size={18} color={colors.green[500]} weight="fill" />
                <Text style={styles.verifiedText}>Verified Brand</Text>
              </View>
            </View>
          </View>

          <View style={styles.brandDetails}>
            <View style={styles.socialLinks}>
              {socialLinks.map((item, index) => (
                <TouchableOpacity
                  key={'profile-social-links-' + index}
                  style={[styles.socialButton, { backgroundColor: item.bgColor }]}
                  onPress={() => Linking.openURL(item.link)}>
                  <View>{item.icon}</View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.infoSection}>
          <ProfileInfoItem
            label="Company Name"
            value="Apple India Pvt Ltd"
            icon={<Buildings size={20} color={colors.gray[500]} weight="fill" />}
          />

          <ProfileInfoItem
            label="Brand Name"
            value="Apple"
            icon={<Buildings size={20} color={colors.gray[500]} weight="fill" />}
          />

          <ProfileInfoItem
            label="GSTIN"
            value="29AABCU9603R1ZJ"
            icon={<Buildings size={20} color={colors.gray[500]} weight="fill" />}
          />

          <ProfileInfoItem
            label="Email"
            value="brand@apple.com"
            icon={<Envelope size={20} color={colors.gray[500]} weight="fill" />}
          />

          <ProfileInfoItem
            label="Phone"
            value="+91 98765 43210"
            icon={<Phone size={20} color={colors.gray[500]} weight="fill" />}
          />

          <ProfileInfoItem
            label="Address"
            value="Apple Park Way, Bangalore, Karnataka, India - 560001"
            icon={<MapPin size={20} color={colors.gray[500]} weight="fill" />}
          />

          <ProfileInfoItem
            label="Member Since"
            value="April 2025"
            icon={<Buildings size={20} color={colors.gray[500]} weight="fill" />}
            last
          />
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton}>
          <View style={styles.editButtonIcon}>
            <Pencil size={20} color={colors.orange[500]} weight="bold" />
          </View>
          <View style={styles.editButtonContent}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
            <CaretRight size={18} color={colors.text.muted} weight="bold" />
          </View>
        </TouchableOpacity>

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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  backButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  brandCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    marginVertical: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  brandHeaderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandImageWrapper: {
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 3,
    borderColor: colors.orange[300],
  },
  brandImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
  },
  brandName: {
    fontSize: typography.sizes.md * 1.1,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.xs / 2,
  },
  brandPanDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginBottom: spacing.xs,
  },
  brandPanText: {
    color: colors.text.muted,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: colors.green[50],
    // paddingHorizontal: spacing.sm,
    // paddingVertical: spacing.xs,
    // borderRadius: borderRadius.full,
    gap: spacing.xs / 2,
  },
  verifiedText: {
    color: colors.green[500],
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  brandDetails: {
    alignItems: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  infoSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    gap: spacing.sm,
  },
  editButtonIcon: {
    backgroundColor: colors.orange[100],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  editButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editButtonText: {
    color: colors.black,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
