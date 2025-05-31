import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Bell, CaretRight, Envelope, Info, WhatsappLogo } from 'phosphor-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Types for notification settings
type NotificationChannel = {
  id: string;
  name: string;
  enabled: boolean;
  icon: React.ReactNode;
};

type NotificationType = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  channel: string;
};

export default function NotificationSettingsScreen() {
  // State for notification channels
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: 'push',
      name: 'Push Notifications',
      enabled: true,
      icon: <Bell size={20} color={colors.orange[500]} weight="fill" />,
    },
    {
      id: 'email',
      name: 'Email Notifications',
      enabled: true,
      icon: <Envelope size={20} color={colors.blue[500]} weight="fill" />,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Notifications',
      enabled: true,
      icon: <WhatsappLogo size={20} color={colors.green[500]} weight="fill" />,
    },
  ]);

  // State for notification types
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([
    {
      id: 'campaign_updates',
      name: 'Campaign Updates',
      description: 'Get notified about campaign status changes',
      enabled: true,
      channel: 'push',
    },
    {
      id: 'invoice_reminders',
      name: 'Invoice Reminders',
      description: 'Receive reminders about pending invoices',
      enabled: true,
      channel: 'push',
    },
    {
      id: 'payment_confirmations',
      name: 'Payment Confirmations',
      description: 'Get notified about successful payments',
      enabled: true,
      channel: 'push',
    },
    {
      id: 'weekly_reports',
      name: 'Weekly Reports',
      description: 'Receive weekly campaign performance reports',
      enabled: true,
      channel: 'email',
    },
    {
      id: 'marketing_updates',
      name: 'Marketing Updates',
      description: 'Get news about platform features and updates',
      enabled: false,
      channel: 'email',
    },
  ]);

  // Mock mutation for saving notification settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: { channels: NotificationChannel[]; types: NotificationType[] }) => {
      // In a real app, this would be an API call to save the notification settings
      console.log('Saving notification settings:', data);
      return new Promise(resolve => setTimeout(() => resolve(data), 1000));
    },
  });

  // Toggle channel enabled state
  const toggleChannel = (channelId: string) => {
    const updatedChannels = channels.map(channel =>
      channel.id === channelId ? { ...channel, enabled: !channel.enabled } : channel,
    );
    setChannels(updatedChannels);

    // Also update all notification types for this channel
    const updatedTypes = notificationTypes.map(type =>
      type.channel === channelId
        ? { ...type, enabled: !channels.find(c => c.id === channelId)!.enabled }
        : type,
    );
    setNotificationTypes(updatedTypes);

    // Save changes
    saveSettingsMutation.mutate({ channels: updatedChannels, types: updatedTypes });
  };

  // Toggle notification type enabled state
  const toggleNotificationType = (typeId: string) => {
    const updatedTypes = notificationTypes.map(type =>
      type.id === typeId ? { ...type, enabled: !type.enabled } : type,
    );
    setNotificationTypes(updatedTypes);

    // Save changes
    saveSettingsMutation.mutate({ channels, types: updatedTypes });
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Notification Settings" showBackButton={true} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Info color={colors.blue[500]} size={20} weight="fill" />
          <View style={styles.instructionTextContainer}>
            <Text style={styles.instructionText}>
              Manage how you receive notifications. You can enable or disable different notification
              channels and specific notification types.
            </Text>
          </View>
        </View>

        {/* Notification Channels Section */}
        <View style={styles.section} key="notification-channels">
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          <Divider />

          {channels.map((channel, index) => (
            <>
              <View key={'channel-item-' + channel.id} style={styles.channelItem}>
                <View style={styles.channelInfo}>
                  <View
                    style={[styles.iconContainer, { backgroundColor: getIconBgColor(channel.id) }]}>
                    {channel.icon}
                  </View>
                  <Text style={styles.channelName}>{channel.name}</Text>
                </View>
                <Switch
                  value={channel.enabled}
                  onValueChange={() => toggleChannel(channel.id)}
                  trackColor={{ false: colors.gray[300], true: colors.green[500] }}
                  thumbColor={colors.white}
                  ios_backgroundColor={colors.gray[300]}
                />
              </View>
              {index !== channels.length - 1 && <Divider />}
            </>
          ))}
        </View>

        {/* Push Notifications Section */}
        <View style={styles.section} key="push-notifications">
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <Divider />

          {notificationTypes
            .filter(type => type.channel === 'push')
            .map((type, index) => (
              <View key={'push-notification-types-' + type.id}>
                <View style={styles.notificationItem}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationName}>{type.name}</Text>
                    <Text style={styles.notificationDescription}>{type.description}</Text>
                  </View>
                  <Switch
                    value={type.enabled}
                    onValueChange={() => toggleNotificationType(type.id)}
                    trackColor={{ false: colors.gray[300], true: colors.green[500] }}
                    thumbColor={colors.white}
                    ios_backgroundColor={colors.gray[300]}
                    disabled={!channels.find(c => c.id === 'push')?.enabled}
                  />
                </View>
                {index !== 2 && <Divider />}
              </View>
            ))}
        </View>

        {/* Email Notifications Section */}
        <View style={styles.section} key="email-notifications">
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          <Divider />

          {notificationTypes
            .filter(type => type.channel === 'email')
            .map((type, index) => (
              <View key={'notification-types-' + type.id}>
                <View style={styles.notificationItem}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationName}>{type.name}</Text>
                    <Text style={styles.notificationDescription}>{type.description}</Text>
                  </View>
                  <Switch
                    value={type.enabled}
                    onValueChange={() => toggleNotificationType(type.id)}
                    trackColor={{ false: colors.gray[300], true: colors.green[500] }}
                    thumbColor={colors.white}
                    ios_backgroundColor={colors.gray[300]}
                    disabled={!channels.find(c => c.id === 'email')?.enabled}
                  />
                </View>
                {index !== 1 && <Divider />}
              </View>
            ))}
        </View>

        {/* Additional Settings */}
        <View style={styles.section} key="additional-settings">
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          <Divider />

          <TouchableOpacity
            style={styles.additionalSettingItem}
            onPress={() => router.push('/(brand)/notification-settings/quiet-hours')}>
            <View>
              <Text style={styles.additionalSettingText}>Quiet Hours</Text>
              <Text style={styles.additionalSettingDescription}>
                Don't send notifications during these hours
              </Text>
            </View>
            <CaretRight size={18} color={colors.gray[400]} weight="bold" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

type DividerProps = {
  style?: ViewStyle;
};

const Divider = ({ style }: DividerProps) => <View style={[styles.divider, style]} />;

// Helper function to get icon background color based on channel ID
const getIconBgColor = (channelId: string): string => {
  switch (channelId) {
    case 'push':
      return colors.orange[50];
    case 'email':
      return colors.blue[50];
    case 'whatsapp':
      return colors.green[50];
    default:
      return colors.gray[50];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  instructionContainer: {
    flexDirection: 'row',
    backgroundColor: colors.blue[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  instructionTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  instructionText: {
    fontSize: typography.sizes.xs,
    color: colors.blue[700],
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1.5,
    backgroundColor: colors.gray[100],
    marginVertical: spacing.sm,
    marginHorizontal: -spacing.md,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.gray[100],
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  channelName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    // borderBottomWidth: 1,
    // borderBottomColor: colors.gray[100],
  },
  notificationInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  notificationName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  notificationDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  additionalSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  additionalSettingText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  additionalSettingDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    flex: 1,
    fontWeight: typography.weights.medium,
  },
});
