import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { Bell, CheckCircle, FileText, UserPlus, WarningCircle } from 'phosphor-react-native';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Define notification types
type NotificationType = 'payment' | 'campaign' | 'invoice' | 'team' | 'update';

// Notification interface
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  date?: string; // For notifications not from today
}

export default function NotificationsScreen() {
  // Sample notification data
  const todayNotifications: Notification[] = [
    {
      id: '1',
      type: 'payment',
      title: 'Payment Received',
      description: 'Payment of ₹75,000 has been received and applied to your invoices.',
      time: '2 hours ago',
    },
    {
      id: '2',
      type: 'campaign',
      title: 'New Campaign Approval',
      description: 'Your campaign "Summer Collection Review" has been approved.',
      time: '5 hours ago',
    },
  ];

  const yesterdayNotifications: Notification[] = [
    {
      id: '3',
      type: 'invoice',
      title: 'New Invoice Generated',
      description: 'Invoice INV/2025/04/003 has been generated for ₹20,000.',
      time: '',
      date: 'Apr 22, 2025',
    },
    {
      id: '4',
      type: 'team',
      title: 'New Team Member Added',
      description: 'Sarah Johnson has been added to your team as Campaign Manager.',
      time: '',
      date: 'Apr 22, 2025',
    },
  ];

  const earlierNotifications: Notification[] = [
    {
      id: '5',
      type: 'update',
      title: 'Campaign Update Required',
      description: 'Please update the product details for "Spring Collection Review".',
      time: '',
      date: 'Apr 20, 2025',
    },
  ];

  // Function to render the appropriate icon based on notification type
  const renderNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'payment':
        return <CheckCircle size={24} color={colors.green[500]} weight="fill" />;
      case 'campaign':
        return <Bell size={24} color={colors.orange[500]} weight="fill" />;
      case 'invoice':
        return <FileText size={24} color={colors.blue[500]} weight="fill" />;
      case 'team':
        return <UserPlus size={24} color={colors.purple[500]} weight="fill" />;
      case 'update':
        return <WarningCircle size={24} color={colors.red[500]} weight="fill" />;
      default:
        return <Bell size={24} color={colors.gray[500]} weight="fill" />;
    }
  };

  // Function to render a notification item
  const renderNotificationItem = (notification: Notification) => {
    return (
      <TouchableOpacity key={notification.id} style={styles.notificationItem}>
        <View style={[styles.iconContainer, getIconContainerStyle(notification.type)]}>
          {renderNotificationIcon(notification.type)}
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationDescription}>{notification.description}</Text>
          <Text style={styles.notificationTime}>{notification.date || notification.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Function to get the background color for the icon container based on notification type
  const getIconContainerStyle = (type: NotificationType) => {
    switch (type) {
      case 'payment':
        return { backgroundColor: colors.green[50] };
      case 'campaign':
        return { backgroundColor: colors.orange[50] };
      case 'invoice':
        return { backgroundColor: colors.blue[50] };
      case 'team':
        return { backgroundColor: colors.purple[50] };
      case 'update':
        return { backgroundColor: colors.red[50] };
      default:
        return { backgroundColor: colors.gray[50] };
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Notifications"
        titleAlign="left"
        titleStyle={styles.headerTitle}
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Today's Notifications */}
        {todayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            <View style={styles.sectionContent}>
              {todayNotifications.map(renderNotificationItem)}
            </View>
          </View>
        )}

        {/* Yesterday's Notifications */}
        {yesterdayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yesterday</Text>
            <View style={styles.sectionContent}>
              {yesterdayNotifications.map(renderNotificationItem)}
            </View>
          </View>
        )}

        {/* Earlier Notifications */}
        {earlierNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            <View style={styles.sectionContent}>
              {earlierNotifications.map(renderNotificationItem)}
            </View>
          </View>
        )}

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
  },
  backButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  section: {
    // marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    paddingHorizontal: spacing.mg,
    paddingVertical: spacing.sm,
  },
  sectionContent: {},
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  notificationDescription: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
});
