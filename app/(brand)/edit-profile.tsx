import { AppHeader } from '@/components/ui/AppHeader';
import GradientButton from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/Input';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Buildings,
  Envelope,
  FacebookLogo,
  IdentificationCard,
  InstagramLogo,
  LinkedinLogo,
  MapPin,
  Phone,
  SealCheck,
  XLogo,
} from 'phosphor-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function EditProfileScreen() {
  // Mock data for the profile
  const [formData, setFormData] = useState({
    brandName: 'Apple India Pvt Ltd.',
    email: 'brand@apple.com',
    phone: '+91 9876543210',
    gstin: '29AABCU9603R1ZJ',
    businessName: 'Apple India Private Limited',
    address: 'Apple Park Way, Whitefield\nBangalore, Karnataka\n560001',
    socialMedia: {
      twitter: 'https://twitter.com/apple',
      linkedin: 'https://linkedin.com/company/apple',
      instagram: 'https://instagram.com/apple',
      facebook: 'https://facebook.com/apple',
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }));
  };

  const handleSaveChanges = () => {
    // Here you would typically save the changes to your backend
    console.log('Saving profile changes:', formData);
    router.back();
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Edit Profile" showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}>
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
                Apple India Pvt Ltd.
              </Text>
              <View style={styles.brandPanDetails}>
                <IdentificationCard size={16} color={colors.text.muted} weight="fill" />
                <Text style={styles.brandPanText}>AABCU9603R</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <SealCheck size={18} color={colors.green[500]} weight="fill" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Brand Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome6 name="building-user" size={20} color={colors.text.muted} />
            <Text style={styles.sectionTitle}>Brand Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Brand Name</Text>
            <Input
              value={formData.brandName}
              onChangeText={value => handleInputChange('brandName', value)}
              leftIcon={<Buildings />}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <Input
              value={formData.email}
              onChangeText={value => handleInputChange('email', value)}
              leftIcon={<Envelope />}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <Input
              value={formData.phone}
              onChangeText={value => handleInputChange('phone', value)}
              leftIcon={<Phone />}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Business Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={20} color={colors.text.muted} />
            <Text style={styles.sectionTitle}>Business Details</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GSTIN</Text>
            <Input
              value={formData.gstin}
              onChangeText={value => handleInputChange('gstin', value)}
              leftIcon={<IdentificationCard />}
              style={[styles.input, styles.businessNameInput]}
              rightAddon={
                <View style={styles.verifiedTag}>
                  <SealCheck size={14} color={colors.green[500]} weight="fill" />
                  <Text style={styles.verifiedTagText}>Verified</Text>
                </View>
              }
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Name (GST)</Text>
            <Input
              value={formData.businessName}
              onChangeText={value => handleInputChange('businessName', value)}
              leftIcon={<Buildings />}
              style={[styles.input, styles.businessNameInput]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Registered Address</Text>
            <Input
              value={formData.address}
              onChangeText={value => handleInputChange('address', value)}
              leftIcon={<MapPin />}
              style={[styles.input, styles.businessNameInput]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Social Media Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="share-social-sharp" size={20} color={colors.text.muted} />
            <Text style={styles.sectionTitle}>Social Media</Text>
          </View>

          <View style={styles.inputGroup}>
            <Input
              value={formData.socialMedia.twitter}
              onChangeText={value => handleSocialMediaChange('twitter', value)}
              leftIcon={<XLogo />}
              leftIconColor={colors.black}
              style={[styles.input, styles.socialInput]}
              placeholder="https://twitter.com/yourbrand"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              value={formData.socialMedia.linkedin}
              onChangeText={value => handleSocialMediaChange('linkedin', value)}
              leftIcon={<LinkedinLogo />}
              leftIconColor={colors.blue[700]}
              style={[styles.input, styles.socialInput]}
              placeholder="https://linkedin.com/company/yourbrand"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              value={formData.socialMedia.instagram}
              onChangeText={value => handleSocialMediaChange('instagram', value)}
              leftIcon={<InstagramLogo />}
              leftIconColor={colors.rose[500]}
              style={[styles.input, styles.socialInput]}
              placeholder="https://instagram.com/yourbrand"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              value={formData.socialMedia.facebook}
              onChangeText={value => handleSocialMediaChange('facebook', value)}
              leftIcon={<FacebookLogo />}
              leftIconColor={colors.blue[600]}
              style={[styles.input, styles.socialInput]}
              placeholder="https://facebook.com/yourbrand"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <GradientButton
            title="Save Changes"
            onPress={handleSaveChanges}
            style={styles.saveButton}
          />
        </View>

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
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  brandCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  brandHeaderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.orange[100],
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  brandImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  brandName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  brandPanDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  brandPanText: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    color: colors.green[500],
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },
  section: {
    backgroundColor: colors.white,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
  },
  businessNameInput: {
    backgroundColor: colors.gray[50],
    color: colors.text.muted,
  },
  socialInput: {
    backgroundColor: colors.gray[50],
    borderWidth: 0,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.md,
  },
  verifiedTagText: {
    fontSize: typography.sizes.xs,
    color: colors.green[500],
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs / 2,
  },
  buttonContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  saveButton: {
    width: '100%',
  },
});
