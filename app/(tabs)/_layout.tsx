import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground.ios';
import { borderRadius, colors, spacing } from '@/constants/Design';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { BlurView } from 'expo-blur';
import {
  DotsThreeOutline,
  House,
  MegaphoneSimple,
  Receipt,
  ShoppingBag,
} from 'phosphor-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.blue[600],
          tabBarHideOnKeyboard: true,
          tabBarBadgeStyle: { backgroundColor: colors.rose[500] },
          headerShown: false,
          tabBarInactiveTintColor: colors.gray[700],
          tabBarLabelStyle: {
            marginTop: 6,
            fontSize: 9,
            letterSpacing: -0.2,
          },
          tabBarButton: HapticTab,
          tabBarBackground: () =>
            Platform.OS === 'ios' ? (
              <BlurView tint="extraLight" intensity={98} style={StyleSheet.absoluteFill} />
            ) : (
              <TabBarBackground />
            ),
          tabBarStyle: styles.tabBar,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <House color={color} size={26} weight={focused ? 'fill' : 'regular'} />
            ),
          }}
        />
        <Tabs.Screen
          name="campaigns"
          options={{
            title: 'Campaigns',
            tabBarIcon: ({ color, focused }) => (
              <MegaphoneSimple color={color} size={26} weight={focused ? 'fill' : 'regular'} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, focused }) => (
              <ShoppingBag color={color} size={26} weight={focused ? 'fill' : 'regular'} />
            ),
          }}
        />
        <Tabs.Screen
          name="invoices"
          options={{
            title: 'Invoices',
            tabBarIcon: ({ color, focused }) => (
              <Receipt color={color} size={26} weight={focused ? 'fill' : 'regular'} />
            ),
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            tabBarIcon: ({ color, focused }) => (
              <DotsThreeOutline color={color} size={26} weight={focused ? 'fill' : 'regular'} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: spacing.xs,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'white',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
    ...Platform.select({
      ios: {
        position: 'absolute',
        height: 90,
      },
      android: {
        height: 100,
      },
    }),
    position: 'absolute',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.orange[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
