import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { colors } from '@/constants/Design';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PortalProvider } from '@gorhom/portal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query/client';
import { useAuthStore } from '@/store/authStore';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a custom theme that's always light
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.white,
    card: colors.white,
    text: colors.text.black,
    border: colors.border.light,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
    InterLight: require('@/assets/fonts/Inter-Light.ttf'),
    InterRegular: require('@/assets/fonts/Inter-Regular.ttf'),
    InterMedium: require('@/assets/fonts/Inter-Medium.ttf'),
    InterSemiBold: require('@/assets/fonts/Inter-SemiBold.ttf'),
    InterBold: require('@/assets/fonts/Inter-Bold.ttf'),
  });

  // Initialize auth store
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <BottomSheetModalProvider>
          <PortalProvider>
            <ThemeProvider value={LightTheme}>
              <View style={{ flex: 1, backgroundColor: colors.white }}>
                <StatusBar style="dark" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.white },
                    animation: 'slide_from_right',
                  }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="brand-onboarding" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="(brand)" options={{ headerShown: false }} />
                  <Stack.Screen name="organization" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(modals)"
                    options={{
                      presentation: 'modal',
                    }}
                  />
                  <Stack.Screen
                    name="+not-found"
                    options={{
                      title: 'Oops!',
                      headerShown: true,
                    }}
                  />
                </Stack>
              </View>
            </ThemeProvider>
          </PortalProvider>
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
