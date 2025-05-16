import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';

type ColorKeys = 'orange' | 'green' | 'blue' | 'purple' | 'yellow' | 'rose' | 'teal';

interface StatsCardProps extends ViewProps {
  label: string;
  value: string | number;
  color: ColorKeys;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export const StatsCard = React.forwardRef<View, StatsCardProps>(
  ({ label, value, color, icon, style, ...props }, ref) => {
    // Type assertion for the nested color object
    const colorGradient: [string, string, string] = [
      colors[color][400],
      colors[color][500],
      colors[color][600],
    ];

    return (
      <View ref={ref} style={[styles.container, style]} {...props}>
        <LinearGradient
          colors={colorGradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Background Icon */}
        <View style={styles.backgroundIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={100}
            color={colors[color][100]}
            style={{ opacity: 0.16 }}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
            {label.toUpperCase()}
          </Text>
          <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
            {value}
          </Text>
        </View>
      </View>
    );
  },
);

StatsCard.displayName = 'StatsCard';

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 100,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  backgroundIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    transform: [{ rotate: '-15deg' }],
  },
  label: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    letterSpacing: -0.5,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  value: {
    color: colors.white,
    fontSize: typography.sizes.xl * 1.1,
    letterSpacing: -0.5,
    fontWeight: typography.weights.bold,
  },
});
