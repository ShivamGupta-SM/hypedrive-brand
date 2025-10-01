import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ViewStyle,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Feather from '@expo/vector-icons/Feather';
import { colors, spacing, typography, borderRadius } from '@/constants/Design';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import TermsAgreement from './components/TermsAgreement';
import Logo from './components/Logo';
import Divider from './components/Divider';
import { GradientButton } from './components/GradientButton';
import { useSignUp } from '@/lib/query/auth';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';

export default function RegisterScreen() {
  const passwordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const signUpMutation = useSignUp();
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const watchShowPassword = watch('password');

  const onSubmit = (data: RegisterFormData) => {
    signUpMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

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
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        errors.email && { borderColor: colors.rose[500] }
                      ]}
                      placeholder="name@example.com"
                      placeholderTextColor={colors.text.secondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      submitBehavior={'blurAndSubmit'}
                      onFocus={() => focusOnInput(0)}
                    />
                  )}
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                )}

                <Text style={styles.label}>Password</Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.passwordContainer}>
                      <TextInput
                        ref={passwordRef}
                        style={[
                          styles.passwordInput,
                          errors.password && { borderColor: colors.rose[500] }
                        ]}
                        placeholder="Create a strong password"
                        placeholderTextColor={colors.text.secondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={true}
                        returnKeyType="done"
                        onFocus={() => focusOnInput(150)}
                      />
                    </View>
                  )}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}

                <Text style={styles.label}>Confirm Password</Text>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        errors.confirmPassword && { borderColor: colors.rose[500] }
                      ]}
                      placeholder="Confirm your password"
                      placeholderTextColor={colors.text.secondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={true}
                      returnKeyType="done"
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                )}

                <Controller
                  control={control}
                  name="agreeToTerms"
                  render={({ field: { onChange, value } }) => (
                    <TermsAgreement checked={value} onCheckChange={onChange} />
                  )}
                />
                {errors.agreeToTerms && (
                  <Text style={styles.errorText}>{errors.agreeToTerms.message}</Text>
                )}

                <GradientButton
                  title={isSubmitting || signUpMutation.isPending ? "Creating Account..." : "Create Account"}
                  onPress={handleSubmit(onSubmit)}
                  disabled={isSubmitting || signUpMutation.isPending}
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
  errorText: {
    color: colors.rose[500],
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
});
