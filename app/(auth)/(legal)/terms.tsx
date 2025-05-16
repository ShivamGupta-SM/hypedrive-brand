import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { colors, typography, spacing } from '@/constants/Design';

export default function TermsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Terms of Service',
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
        }}
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sizes.md,
            color: colors.text.primary,
            lineHeight: 24,
          }}>
          {/* Add your terms of service content here */}
          Terms of Service content...
        </Text>
      </ScrollView>
    </View>
  );
}
