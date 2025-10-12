import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/Design';

interface EmptyStateScreenProps {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: any;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  children?: React.ReactNode;
}

export function EmptyStateScreen({
  title,
  message,
  icon,
  image,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  children,
}: EmptyStateScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {image ? (
          <Image source={image} style={styles.image} resizeMode="contain" />
        ) : icon ? (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={64} color={colors.text.secondary} />
          </View>
        ) : null}
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        {children}
        
        {(actionText || secondaryActionText) && (
          <View style={styles.buttonContainer}>
            {actionText && onAction && (
              <TouchableOpacity style={styles.primaryButton} onPress={onAction}>
                <Text style={styles.primaryButtonText}>{actionText}</Text>
              </TouchableOpacity>
            )}
            
            {secondaryActionText && onSecondaryAction && (
              <TouchableOpacity style={styles.secondaryButton} onPress={onSecondaryAction}>
                <Text style={styles.secondaryButtonText}>{secondaryActionText}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// No Campaigns Empty State
export function NoCampaignsEmpty({ onCreateCampaign }: { onCreateCampaign?: () => void }) {
  return (
    <EmptyStateScreen
      title="No Campaigns Yet"
      message="Create your first campaign to start engaging with shoppers and growing your brand."
      icon="megaphone-outline"
      actionText="Create Campaign"
      onAction={onCreateCampaign}
    />
  );
}

// No Products Empty State
export function NoProductsEmpty({ onAddProduct }: { onAddProduct?: () => void }) {
  return (
    <EmptyStateScreen
      title="No Products Added"
      message="Add products to your catalog to create campaigns and track performance."
      icon="cube-outline"
      actionText="Add Product"
      onAction={onAddProduct}
    />
  );
}

// No Search Results Empty State
export function NoSearchResultsEmpty({ searchQuery, onClearSearch }: { searchQuery?: string; onClearSearch?: () => void }) {
  return (
    <EmptyStateScreen
      title="No Results Found"
      message={searchQuery ? `No results found for "${searchQuery}". Try adjusting your search terms.` : "No results found. Try different search terms."}
      icon="search-outline"
      actionText="Clear Search"
      onAction={onClearSearch}
    />
  );
}

// No Notifications Empty State
export function NoNotificationsEmpty() {
  return (
    <EmptyStateScreen
      title="No Notifications"
      message="You're all caught up! New notifications will appear here when you receive them."
      icon="notifications-outline"
    />
  );
}

// No Activity Empty State
export function NoActivityEmpty() {
  return (
    <EmptyStateScreen
      title="No Recent Activity"
      message="Your recent activity will appear here as you interact with campaigns and shoppers."
      icon="time-outline"
    />
  );
}

// No Invoices Empty State
export function NoInvoicesEmpty() {
  return (
    <EmptyStateScreen
      title="No Invoices"
      message="Invoices will appear here once shoppers complete campaign deliverables."
      icon="document-text-outline"
    />
  );
}

// No Enrollments Empty State
export function NoEnrollmentsEmpty() {
  return (
    <EmptyStateScreen
      title="No Enrollments Yet"
      message="Enrollments will appear here when shoppers join your campaigns."
      icon="people-outline"
    />
  );
}

// Connection Lost Empty State
export function ConnectionLostEmpty({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyStateScreen
      title="Connection Lost"
      message="Unable to load content. Please check your internet connection and try again."
      icon="wifi-outline"
      actionText="Retry"
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  } as ViewStyle,
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  image: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl,
    opacity: 0.6,
  } as ImageStyle,
  iconContainer: {
    marginBottom: spacing.xl,
    opacity: 0.6,
  } as ViewStyle,
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  } as TextStyle,
  message: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: 280,
  } as TextStyle,
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  } as ViewStyle,
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  } as ViewStyle,
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  } as TextStyle,
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.medium,
  } as ViewStyle,
  secondaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  } as TextStyle,
});