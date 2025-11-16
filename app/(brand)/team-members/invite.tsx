import { BottomButton } from '@/components/BottomButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  Envelope,
  EnvelopeSimple,
  Info,
  Key,
  PaperPlaneTilt,
  ShieldCheck,
  UserList,
} from 'phosphor-react-native';
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

  const RightHeaderContent = () => {
    return (
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.rightHeaderText}>Cancel</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Add Team Member" showBackButton rightContent={<RightHeaderContent />} />

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
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={styles.inviteLabelWithIcon}>
                <View style={styles.inviteLabelIcon}>
                  <Envelope size={20} color={colors.orange[500]} />
                </View>
                <Label>Invite via Email</Label>
              </View>
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
              <Label>Select Role Acess</Label>
              <Controller
                control={control}
                name="role"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <View style={styles.rolesContainer}>
                      <TouchableOpacity
                        style={[
                          styles.roleOption,
                          styles.adminRoleOption,
                          value === 'Admin' && styles.adminRoleOptionSelected,
                        ]}
                        onPress={() => onChange('Admin')}>
                        <View style={[styles.roleOptionIcon, styles.adminRoleOptionIcon]}>
                          <Key size={20} color={colors.white} weight="fill" />
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.roleOptionText,
                              value === 'Admin' && styles.roleOptionTextSelected,
                            ]}>
                            Admin
                          </Text>
                          <Text style={styles.roleDescriptionText}>
                            Full access to manage campaigns, team members, and billing.
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.roleOption,
                          styles.editorRoleOption,
                          value === 'Editor' && styles.editorRoleOptionSelected,
                        ]}
                        onPress={() => onChange('Editor')}>
                        <View style={[styles.roleOptionIcon, styles.editorRoleOptionIcon]}>
                          <ShieldCheck size={20} color={colors.white} weight="fill" />
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.roleOptionText,
                              value === 'Editor' && styles.roleOptionTextSelected,
                            ]}>
                            Editor
                          </Text>
                          <Text style={styles.roleDescriptionText}>
                            Can create and edit campaigns, but cannot manage team or billing.
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.roleOption,
                          styles.viewerRoleOption,
                          value === 'Viewer' && styles.viewerRoleOptionSelected,
                        ]}
                        onPress={() => onChange('Viewer')}>
                        <View style={[styles.roleOptionIcon, styles.viewerRoleOptionIcon]}>
                          <UserList size={20} color={colors.white} weight="fill" />
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.roleOptionText,
                              value === 'Viewer' && styles.roleOptionTextSelected,
                            ]}>
                            Viewer
                          </Text>
                          <Text style={styles.roleDescriptionText}>
                            Read-only access to view campaigns and reports.
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    {errors.role && <Text style={styles.errorText}>{errors.role.message}</Text>}
                  </View>
                )}
              />
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
          icon={<PaperPlaneTilt size={20} color={colors.white} weight="bold" />}
          iconPosition="left"
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
  rightHeaderText: {
    color: colors.orange[500],
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    backgroundColor: colors.gray[50],
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
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inviteLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inviteLabelIcon: {
    height: 36,
    width: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[50],
    borderWidth: 1,
    borderColor: colors.orange[100],
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
    shadowColor: colors.orange[400],
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  rolesContainer: {
    marginTop: spacing.xs,
    gap: spacing.xm,
  },
  roleOption: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.mg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminRoleOption: {
    borderColor: colors.orange[100],
    backgroundColor: colors.orange[50],
  },
  roleOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminRoleOptionIcon: {
    backgroundColor: colors.orange[500],
  },
  adminRoleOptionText: {
    color: colors.orange[500],
  },
  adminRoleOptionSelected: {
    borderWidth: 1.5,
    backgroundColor: colors.orange[50],
    borderColor: colors.orange[500],
  },
  editorRoleOption: {
    borderColor: colors.green[100],
    backgroundColor: colors.green[50],
  },
  editorRoleOptionIcon: {
    backgroundColor: colors.green[500],
  },
  editorRoleOptionText: {
    color: colors.green[500],
  },
  editorRoleOptionSelected: {
    borderWidth: 1.5,
    backgroundColor: colors.green[50],
    borderColor: colors.green[500],
  },
  viewerRoleOption: {
    borderColor: colors.gray[100],
    backgroundColor: colors.gray[50],
  },
  viewerRoleOptionIcon: {
    backgroundColor: colors.gray[500],
  },
  viewerRoleOptionText: {
    color: colors.text.primary,
  },
  viewerRoleOptionSelected: {
    borderWidth: 1.5,
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[500],
  },
  roleOptionSelected: {
    borderWidth: 1.5,
    backgroundColor: colors.orange[50],
    borderColor: colors.orange[500],
  },
  roleOptionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  roleOptionTextSelected: {
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
    fontWeight: typography.weights.medium,
    maxWidth: '90%',
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
