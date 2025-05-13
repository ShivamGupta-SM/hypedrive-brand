import Logo from '@/app/(auth)/components/Logo';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { GradientButton } from './(auth)/components/GradientButton';

export default function HomeScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.white,
      }}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Logo />

          <Text style={styles.title}>Welcome to Hypedrive!</Text>
          <Text style={styles.subtitle}>
            Create your shopper profile to start earning rebates on your favourite products
          </Text>

          <GradientButton
            title="Create Shopper Profile"
            onPress={() => {
              router.push('/register');
            }}
            style={{ marginTop: spacing.xxl * 1.5 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.mg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 50,
    height: 50,
    tintColor: colors.white,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginTop: spacing.xl,
    color: colors.text.black,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.gray[500],
    maxWidth: 310,
    marginHorizontal: 'auto',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  form: {
    marginTop: spacing.xl,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    marginBottom: spacing.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  passwordInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    paddingRight: spacing.xl * 2,
    fontWeight: typography.weights.medium,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  forgotPassword: {
    color: colors.primary,
    textAlign: 'right',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  // primaryButton: {
  //   backgroundColor: colors.primary,
  //   borderRadius: borderRadius.md,
  //   padding: spacing.md,
  //   alignItems: 'center',
  //   marginBottom: spacing.xl,
  // },
  // primaryButtonText: {
  //   color: colors.white,
  //   fontSize: typography.sizes.md,
  //   fontWeight: typography.weights.semibold,
  // },
  dividerText: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  appleButton: {
    borderColor: colors.black,
    backgroundColor: colors.black,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: spacing.sm,
  },
  socialButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  appleButtonText: {
    color: colors.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xm,
    fontWeight: typography.weights.semibold,
  },
  footerLink: {
    color: colors.primary,
    fontSize: typography.sizes.xm,
    fontWeight: typography.weights.semibold,
  },

  buttonContainer: {
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  gradient: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});
