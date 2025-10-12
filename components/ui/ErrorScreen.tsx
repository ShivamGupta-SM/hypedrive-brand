import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/Design';
import { LoadingSpinner } from './LoadingSpinner';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  isRetrying?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  children?: React.ReactNode;
}

export function ErrorScreen({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  retryText = 'Try Again',
  isRetrying = false,
  showBackButton = false,
  onBack,
  icon = 'alert-circle-outline',
  children,
}: ErrorScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={64} color={colors.rose[500]} />
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        {children}
        
        <View style={styles.buttonContainer}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <LoadingSpinner size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="refresh" size={20} color={colors.white} />
                  <Text style={styles.retryButtonText}>{retryText}</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          {showBackButton && onBack && (
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={onBack}
            >
              <Ionicons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Network Error Screen
export function NetworkErrorScreen({ onRetry, isRetrying }: { onRetry?: () => void; isRetrying?: boolean }) {
  return (
    <ErrorScreen
      title="No Internet Connection"
      message="Please check your internet connection and try again."
      icon="wifi-outline"
      onRetry={onRetry}
      isRetrying={isRetrying}
      retryText="Retry Connection"
    />
  );
}

// Server Error Screen
export function ServerErrorScreen({ onRetry, isRetrying }: { onRetry?: () => void; isRetrying?: boolean }) {
  return (
    <ErrorScreen
      title="Server Error"
      message="Our servers are experiencing issues. Please try again in a moment."
      icon="server-outline"
      onRetry={onRetry}
      isRetrying={isRetrying}
    />
  );
}

// Not Found Screen
export function NotFoundScreen({ onBack }: { onBack?: () => void }) {
  return (
    <ErrorScreen
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      icon="search-outline"
      showBackButton={true}
      onBack={onBack}
    />
  );
}

// Unauthorized Screen
export function UnauthorizedScreen({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorScreen
      title="Access Denied"
      message="You don't have permission to access this content. Please sign in or contact support."
      icon="lock-closed-outline"
      onRetry={onRetry}
      retryText="Sign In"
    />
  );
}

// Maintenance Screen
export function MaintenanceScreen() {
  return (
    <ErrorScreen
      title="Under Maintenance"
      message="We're currently performing maintenance to improve your experience. Please check back soon."
      icon="construct-outline"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
  },
  retryButton: {
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.white,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
});