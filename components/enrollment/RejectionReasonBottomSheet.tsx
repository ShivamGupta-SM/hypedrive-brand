import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export type RejectionReasonBottomSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

type RejectionReasonBottomSheetProps = {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
};

const RejectionReasonBottomSheet = forwardRef<RejectionReasonBottomSheetHandle, RejectionReasonBottomSheetProps>(
  ({ onSubmit, onCancel }, ref) => {
    // Bottom sheet reference
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    // Snap points for the bottom sheet
    const snapPoints = useMemo(() => ['40%'], []);

    // Callbacks
    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        // Reset rejection reason when sheet is closed
        setRejectionReason('');
      }
    }, []);

    const handleCancel = () => {
      bottomSheetRef.current?.dismiss();
      onCancel();
    };

    const handleSubmit = () => {
      if (rejectionReason.trim()) {
        onSubmit(rejectionReason.trim());
        bottomSheetRef.current?.dismiss();
        setRejectionReason('');
      }
    };

    // Render backdrop component
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.bottomSheetBackground}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
      >
        <BottomSheetView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.content}>
              <Text style={styles.title}>Rejection Reason</Text>
              <Text style={styles.subtitle}>Please provide a reason for rejection...</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.submitButton, !rejectionReason.trim() && styles.submitButtonDisabled]} 
                  onPress={handleSubmit}
                  disabled={!rejectionReason.trim()}
                >
                  <Text style={[styles.submitButtonText, !rejectionReason.trim() && styles.submitButtonTextDisabled]}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  indicator: {
    backgroundColor: colors.gray[300],
    width: 40,
  },
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 120,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.red[500],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: colors.red[200],
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  submitButtonTextDisabled: {
    color: colors.white,
  },
});

export default RejectionReasonBottomSheet;
