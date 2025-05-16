import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { colors, typography, spacing } from '@/constants/Design';

export default function PrivacyScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Privacy Policy',
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
          {/* Add your privacy policy content here */}
          Privacy Policy content...
        </Text>
      </ScrollView>
    </View>
  );
}
