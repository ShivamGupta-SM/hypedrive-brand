import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { colors, spacing } from '@/constants/Design';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const height = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(isOpen ? height.value : 0),
    opacity: withTiming(isOpen ? 1 : 0),
  }));

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText>{isOpen ? '▼' : '▶'}</ThemedText>
      </TouchableOpacity>
      <Animated.View style={[animatedStyle, styles.content]}>
        <ThemedView
          onLayout={(e) => {
            height.value = e.nativeEvent.layout.height;
          }}>
          {children}
        </ThemedView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.gray[100],
  },
  content: {
    overflow: 'hidden',
  },
});
