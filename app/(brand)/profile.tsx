import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Camera, CaretRight, Check, Envelope, MapPin, Phone } from 'phosphor-react-native';
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
import { router } from 'expo-router';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text.primary} weight="regular" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={require('@/assets/icons/apple-icon.png')} 
              style={styles.profileImage} 
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={18} color={colors.white} weight="bold" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Apple</Text>
            <View style={styles.verifiedBadge}>
              <Check size={12} color={colors.white} weight="bold" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>
        
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT INFORMATION</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <Envelope size={20} color={colors.blue[500]} weight="fill" />
                <View>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>brand@apple.com</Text>
                </View>
              </View>
              <TouchableOpacity>
                <CaretRight size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.infoItem, styles.infoItemBorder]}>
              <View style={styles.infoItemLeft}>
                <Phone size={20} color={colors.green[500]} weight="fill" />
                <View>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>+1 (800) 275-2273</Text>
                </View>
              </View>
              <TouchableOpacity>
                <CaretRight size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <MapPin size={20} color={colors.orange[500]} weight="fill" />
                <View>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>One Apple Park Way, Cupertino, CA</Text>
                </View>
              </View>
              <TouchableOpacity>
                <CaretRight size={20} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Business Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BUSINESS INFORMATION</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoItem}>
              <View style={styles.infoItemLeft}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>Technology</Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.infoItem, styles.infoItemBorder]}>
              <View style={styles.infoItemLeft}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>
                  Apple Inc. is an American multinational technology company that designs, develops, 
                  and sells consumer electronics, computer software, and online services.
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
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
  },
  profileCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.black,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.blue[500],
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs / 2,
  },
  verifiedText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    paddingHorizontal: spacing.mg,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[100],
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.mg,
  },
  infoItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  infoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  infoValue: {
    fontSize: typography.sizes.md,
    color: colors.text.black,
    fontWeight: typography.weights.medium,
  },
  categoryBadge: {
    backgroundColor: colors.blue[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.blue[100],
  },
  categoryText: {
    color: colors.blue[600],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  descriptionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: colors.blue[500],
    marginHorizontal: spacing.mg,
    marginVertical: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});