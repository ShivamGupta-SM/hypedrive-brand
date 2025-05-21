import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import { Bell, CaretLeft } from 'phosphor-react-native';
import React, { ReactNode } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AppHeaderProps = {
  title: string;
  hideTitle?: boolean;
  showBackButton?: boolean;
  showNotification?: boolean;
  notificationCount?: number;
  onBackPress?: () => void;
  onNotificationPress?: () => void;
  rightContent?: ReactNode;
  leftContent?: ReactNode;
  titleAlign?: 'left' | 'center';
  backgroundColor?: string;
  borderBottom?: boolean;
  elevation?: number;
  titleStyle?: TextStyle;
  containerStyle?: ViewStyle;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarColor?: string;
  statusBarTranslucent?: boolean;
  height?: number;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  hideTitle = false,
  showBackButton = false,
  showNotification = false,
  notificationCount = 0,
  onBackPress,
  onNotificationPress,
  rightContent,
  leftContent,
  titleAlign = 'left',
  backgroundColor = colors.white,
  borderBottom = false,
  elevation = 0,
  titleStyle,
  containerStyle,
  statusBarStyle = 'dark-content',
  statusBarColor = 'transparent',
  statusBarTranslucent = true,
  height,
}) => {
  const insets = useSafeAreaInsets();
  const paddingTop = Math.max(insets.top, Platform.OS === 'android' ? 20 : 0);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/(brand)/notifications');
    }
  };

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent={statusBarTranslucent}
      />
      <View
        style={[
          styles.container,
          {
            paddingTop,
            backgroundColor,
            borderBottomWidth: borderBottom ? 1 : 0,
            elevation,
            height: height ? height + paddingTop : undefined,
          },
          containerStyle,
        ]}>
        <View
          style={[
            styles.content,
            { justifyContent: titleAlign === 'center' ? 'center' : 'flex-start' },
          ]}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {leftContent ? (
              leftContent
            ) : showBackButton ? (
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <CaretLeft size={24} color={colors.text.primary} weight="regular" />
              </TouchableOpacity>
            ) : null}

            {!hideTitle && titleAlign === 'left' && (
              <Text
                style={[
                  styles.title,
                  showBackButton && styles.titleWhenShowBackButton,
                  titleStyle,
                ]}>
                {title}
              </Text>
            )}
          </View>

          {/* Center Section - Only used when title is centered */}
          {!hideTitle && titleAlign === 'center' && (
            <Text style={[styles.titleCenter, titleStyle]}>{title}</Text>
          )}

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightContent ? (
              rightContent
            ) : showNotification ? (
              <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
                <Bell size={24} color={colors.text.primary} weight="regular" />
                {notificationCount > 0 && (
                  <View
                    style={[
                      styles.notificationBadge,
                      notificationCount > 9 && styles.notificationBadgeMore,
                    ]}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.white,
    borderBottomColor: colors.gray[100],
    zIndex: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    position: 'relative',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  titleWhenShowBackButton: {
    fontSize: typography.sizes.lg,
  },
  titleCenter: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.rose[500],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeMore: {
    right: -2,
  },
  notificationBadgeText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
