import { AppHeader } from '@/components/ui/AppHeader';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { useMutation } from '@tanstack/react-query';
import { Clock, Info, Moon } from 'phosphor-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Types
type TimeRange = {
  start: string;
  end: string;
};

export default function QuietHoursScreen() {
  // State for quiet hours settings
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: '22:00',
    end: '08:00',
  });

  // Mock mutation for saving quiet hours settings
  const saveQuietHoursMutation = useMutation({
    mutationFn: async (data: { enabled: boolean; timeRange: TimeRange }) => {
      // In a real app, this would be an API call to save the quiet hours settings
      console.log('Saving quiet hours settings:', data);
      return new Promise(resolve => setTimeout(() => resolve(data), 1000));
    },
  });

  // Toggle quiet hours enabled state
  const toggleQuietHours = () => {
    const newState = !quietHoursEnabled;
    setQuietHoursEnabled(newState);
    saveQuietHoursMutation.mutate({ enabled: newState, timeRange });
  };

  // Handle time selection (in a real app, this would open a time picker)
  const handleTimeSelection = (type: 'start' | 'end') => {
    // This would open a time picker in a real implementation
    console.log(`Select ${type} time`);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Quiet Hours" showBackButton={true} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.instructionContainer}>
          <Info color={colors.blue[500]} size={20} weight="fill" />
          <View style={styles.instructionTextContainer}>
            <Text style={styles.instructionText}>
              Set quiet hours to prevent notifications from disturbing you during specific times.
              Notifications will be delivered once quiet hours end.
            </Text>
          </View>
        </View>

        {/* Quiet Hours Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <View style={styles.iconContainer}>
                <Moon size={20} color={colors.purple[500]} weight="fill" />
              </View>
              <Text style={styles.toggleTitle}>Enable Quiet Hours</Text>
            </View>
            <ToggleSwitch
              value={quietHoursEnabled}
              onValueChange={toggleQuietHours}
              activeColor={colors.purple[500]}
            />
          </View>
        </View>

        {/* Time Range Selection */}
        {quietHoursEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Silence Period</Text>

            <View style={styles.timeRangeContainer}>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => handleTimeSelection('start')}>
                <Clock size={18} color={colors.text.secondary} weight="fill" />
                <Text style={styles.timeText}>{timeRange.start}</Text>
              </TouchableOpacity>

              <Text style={styles.toText}>to</Text>

              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => handleTimeSelection('end')}>
                <Clock size={18} color={colors.text.secondary} weight="fill" />
                <Text style={styles.timeText}>{timeRange.end}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.timeDescription}>
              Notifications will not be sent between {timeRange.start} and {timeRange.end}
            </Text>
          </View>
        )}
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
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.purple[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  toggleTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flex: 2,
  },
  timeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  toText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    flex: 1,
    textAlign: 'center',
  },
  timeDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
});
