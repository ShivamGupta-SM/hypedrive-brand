import { Stack } from 'expo-router';
import { View } from 'react-native';
import { colors } from '@/constants/Design';

export default function AuthLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.gray[50] },
          gestureEnabled: false, // Disable swipe to dismiss
          headerBackVisible: false,
        }}>
        <Stack.Screen
          name="login"
          options={{
            gestureEnabled: false,
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            gestureEnabled: false,
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
      </Stack>
    </View>
  );
}
