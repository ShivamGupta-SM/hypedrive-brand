import { BottomButton } from '@/components/BottomButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowRight, EnvelopeSimple, Info, User } from 'phosphor-react-native';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

// Define the schema for team member invitation
const inviteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['Admin', 'Editor', 'Viewer']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function InviteTeamMemberScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'Viewer',
    },
  });

  // Mock mutation for sending invitation
  const sendInviteMutation = useMutation({
    mutationFn: async (data: InviteFormData) => {
      // In a real app, this would be an API call to send the invitation
      console.log('Sending invitation:', data);
      return new Promise(resolve => setTimeout(() => resolve(data), 1000));
    },
    onSuccess: () => {
      // Navigate back to team members list
      router.back();
    },
  });

  const onSubmit = (data: InviteFormData) => {
    sendInviteMutation.mutate(data);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Invite Team Member" showBackButton />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled">
          {/* Instructions */}
          <View style={styles.instructionContainer}>
            <Info color={colors.blue[500]} size={20} weight="fill" />
            <View style={styles.instructionTextContainer}>
              <Text style={styles.instructionText}>
                Invite team members to collaborate on your brand campaigns. Each role has different
                permissions.
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Label>Team Member Name</Label>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Enter full name"
                    value={value}
                    onChangeText={onChange}
                    leftIcon={<User size={20} color={colors.text.muted} />}
                    error={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                )}
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Label>Email Address</Label>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="Enter email address"
                    value={value}
                    onChangeText={onChange}
                    leftIcon={<EnvelopeSimple size={20} color={colors.text.muted} />}
                    error={!!errors.email}
                    errorMessage={errors.email?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
            </View>

            {/* Role Selection */}
            <View style={styles.inputGroup}>
              <Label>Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <View style={styles.rolesContainer}>
                      <TouchableOpacity
                        style={[styles.roleOption, value === 'Admin' && styles.roleOptionSelected]}
                        onPress={() => onChange('Admin')}>
                        <Text
                          style={[
                            styles.roleOptionText,
                            value === 'Admin' && styles.roleOptionTextSelected,
                          ]}>
                          Admin
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.roleOption, value === 'Editor' && styles.roleOptionSelected]}
                        onPress={() => onChange('Editor')}>
                        <Text
                          style={[
                            styles.roleOptionText,
                            value === 'Editor' && styles.roleOptionTextSelected,
                          ]}>
                          Editor
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.roleOption, value === 'Viewer' && styles.roleOptionSelected]}
                        onPress={() => onChange('Viewer')}>
                        <Text
                          style={[
                            styles.roleOptionText,
                            value === 'Viewer' && styles.roleOptionTextSelected,
                          ]}>
                          Viewer
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}
                  </View>
                )}
              />
            </View>

            {/* Role Descriptions */}
            <View style={styles.roleDescriptions}>
              <View style={styles.roleDescriptionItem}>
                <Text style={styles.roleDescriptionTitle}>Admin</Text>
                <Text style={styles.roleDescriptionText}>
                  Full access to manage campaigns, team members, and billing.
                </Text>
              </View>

              <View style={styles.roleDescriptionItem}>
                <Text style={styles.roleDescriptionTitle}>Editor</Text>
                <Text style={styles.roleDescriptionText}>
                  Can create and edit campaigns, but cannot manage team or billing.
                </Text>
              </View>

              <View style={styles.roleDescriptionItem}>
                <Text style={styles.roleDescriptionTitle}>Viewer</Text>
                <Text style={styles.roleDescriptionText}>
                  Read-only access to view campaigns and reports.
                </Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />

          {/* Submit Button */}
          {/* <Button
            title="Send Invitation"
            variant="gradient"
            size="lg"
            icon={<ArrowRight size={20} weight="bold" />}
            iconPosition="right"
            onPress={handleSubmit(onSubmit)}
            loading={sendInviteMutation.isPending}
            style={styles.submitButton}
          /> */}
        </ScrollView>
        <BottomButton
          title="Send Invitation"
          onPress={handleSubmit(onSubmit)}
          icon={<ArrowRight size={20} color={colors.white} weight="bold" />}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  instructionContainer: {
    flexDirection: 'row',
    backgroundColor: colors.blue[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  instructionTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  instructionText: {
    fontSize: typography.sizes.xs,
    color: colors.blue[700],
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  rolesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  roleOption: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs / 2,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  roleOptionSelected: {
    borderWidth: 1.5,
    backgroundColor: colors.orange[50],
    borderColor: colors.orange[500],
  },
  roleOptionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  roleOptionTextSelected: {
    color: colors.orange[700],
    fontWeight: typography.weights.semibold,
  },
  errorText: {
    color: colors.rose[500],
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  roleDescriptions: {
    marginTop: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  roleDescriptionItem: {
    marginBottom: spacing.md,
  },
  roleDescriptionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  roleDescriptionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
