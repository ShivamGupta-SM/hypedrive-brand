import { Stack } from 'expo-router';
import { colors } from '@/constants/Design';

export default function BrandLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
        animation: 'slide_from_right',
      }}
    />
  );
}