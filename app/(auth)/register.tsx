import { Link, router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors, spacing, typography, borderRadius } from '@/constants/Design';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import TermsAgreement from './components/TermsAgreement';
import Logo from './components/Logo';
import Divider from './components/Divider';
import { GradientButton } from './components/GradientButton';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const focusOnInput = (y: number) => {
    scrollViewRef.current?.scrollTo({
      y: y,
      animated: true,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray[50] }}>
      <StatusBar style="dark" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
              <Logo />

              <Text style={styles.title}>Welcome to Hypedrive</Text>
              <Text style={styles.subtitle}>Register to start earning rebates</Text>

              <View style={styles.form}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.text.secondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  submitBehavior={'blurAndSubmit'}
                  onFocus={() => focusOnInput(0)}
                  onBlur={() => focusOnInput(0)}
                />

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={passwordRef}
                    style={styles.passwordInput}
                    placeholder="Create a strong password"
                    placeholderTextColor={colors.text.secondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onFocus={() => focusOnInput(150)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}>
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={24}
                      color={colors.text.muted}
                    />
                  </TouchableOpacity>
                </View>

                <TermsAgreement checked={agreedToTerms} onCheckChange={setAgreedToTerms} />

                <GradientButton
                  title="Create Account"
                  onPress={() => {
                    router.replace('/(tabs)');
                  }}
                />

                <Divider text="or sign up with" />

                {/* <Text style={styles.dividerText}>or sign up with</Text> */}

                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require('@/assets/icons/google-color-icon.png')}
                    style={styles.socialIcon}
                  />
                  <Text style={styles.socialButtonText}>Sign up with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
                  <Image
                    source={require('@/assets/icons/apple-icon.png')}
                    style={[styles.socialIcon, { tintColor: 'white' }]}
                  />
                  <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                    Sign up with Apple
                  </Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <Link href="/login">
                    <Text style={styles.footerLink}>Sign In</Text>
                  </Link>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.mg,
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
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
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

  // primaryButtonText: {
  //   color: colors.white,
  //   fontSize: typography.sizes.md,
  //   fontWeight: typography.weights.semibold,
  // },
  dividerText: {
    marginVertical: spacing.lg,
    textAlign: 'center',
    color: colors.text.secondary,
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
});
