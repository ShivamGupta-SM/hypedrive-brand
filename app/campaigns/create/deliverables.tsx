import { BottomButton } from '@/components/BottomButton';
import {
  AddDeliverableBottomSheet,
  AddDeliverableBottomSheetHandle,
} from '@/components/campaigns/AddDeliverableBottomSheet';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Info, Plus, Trash } from 'phosphor-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Types
type DeliverableRequirement = {
  id: string;
  type: string;
  count: number;
};

type Deliverable = {
  id: string;
  name: string;
  description: string;
  requirements: DeliverableRequirement[];
  tags?: string[];
};

export default function DeliverableRequirementsScreen() {
  const router = useRouter();
  const bottomSheetRef = useRef<AddDeliverableBottomSheetHandle>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    {
      id: '1',
      name: 'Amazon Review',
      description: 'Product feedback with media',
      requirements: [
        { id: '1', type: 'Words', count: 100 },
        { id: '2', type: 'Photos', count: 2 },
        { id: '3', type: 'Video', count: 1 },
      ],
    },
    {
      id: '2',
      name: 'Instagram Post',
      description: 'Social media content',
      requirements: [],
      tags: ['@brand', '@influencer', '#trending', '#lifestyle'],
    },
  ]);

  // Handle continue to next step
  const handleContinue = () => {
    // Navigate to next step or validate form
    router.push('/campaigns/create/budget');
  };

  // Add new deliverable
  const handleAddDeliverable = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  // Handle adding a new deliverable from the bottom sheet
  const onAddDeliverable = (newDeliverable: Deliverable) => {
    setDeliverables([...deliverables, newDeliverable]);
  };

  // Remove deliverable
  const handleRemoveDeliverable = (id: string) => {
    setDeliverables(deliverables.filter(deliverable => deliverable.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Instructions */}
          <View style={styles.instructionContainer}>
            <Info color={colors.orange[500]} size={20} weight="fill" />
            <View style={styles.instructionTextContainer}>
              <Text style={styles.instructionText}>
                Add multiple deliverables for your campaign. Each deliverable can have specific
                requirements like word count, media, or social tags.
              </Text>
            </View>
          </View>

          {/* Deliverables Section */}
          <View style={styles.deliverablesSection}>
            <Text style={styles.sectionTitle}>Campaign Deliverables</Text>
            <Text style={styles.deliverableCount}>{deliverables.length} added</Text>
          </View>

          {/* Add New Deliverable Button */}
          <TouchableOpacity style={styles.addDeliverableButton} onPress={handleAddDeliverable}>
            <Plus size={18} color={colors.orange[500]} weight="bold" />
            <Text style={styles.addDeliverableText}>Add New Deliverable</Text>
          </TouchableOpacity>

          {/* Deliverable Cards */}
          {deliverables.map(deliverable => (
            <View key={deliverable.id} style={styles.deliverableCard}>
              <View style={styles.deliverableHeader}>
                <View style={styles.deliverableIconContainer}>
                  {deliverable.name.includes('Amazon') ? (
                    <View style={styles.amazonIcon}>
                      <Text style={styles.amazonIconText}>a</Text>
                    </View>
                  ) : (
                    <View style={styles.instagramIcon}>
                      <Text style={styles.instagramIconText}>📷</Text>
                    </View>
                  )}
                </View>
                <View style={styles.deliverableInfo}>
                  <Text style={styles.deliverableName}>{deliverable.name}</Text>
                  <Text style={styles.deliverableDescription}>{deliverable.description}</Text>
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleRemoveDeliverable(deliverable.id)}>
                  <Trash size={20} color={colors.gray[400]} weight="bold" />
                </Pressable>
              </View>

              {/* Requirements Section */}
              {deliverable.name.includes('Amazon') ? (
                <View style={styles.requirements}>
                  <Text style={styles.requirementsTitle}>Review Requirements</Text>
                  <View style={styles.requirementsContainer}>
                    {deliverable.requirements.map(requirement => (
                      <View key={requirement.id} style={styles.requirementItem}>
                        <Text style={styles.requirementCount}>{requirement.count}</Text>
                        <Text style={styles.requirementType}>{requirement.type}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.requirements}>
                  <Text style={styles.requirementsTitle}>Required Tags</Text>
                  <View style={styles.tagsContainer}>
                    {deliverable.tags?.map((tag, index) => (
                      <View key={index} style={styles.tagItem}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Spacer for bottom button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Sheet for Adding Deliverables */}
      <AddDeliverableBottomSheet ref={bottomSheetRef} onAddDeliverable={onAddDeliverable} />

      {/* Continue Button - Fixed at bottom */}
      <BottomButton
        title="Continue to Budget"
        onPress={handleContinue}
        icon={<ArrowRight size={20} color={colors.white} weight="bold" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  placeholder: {
    width: 24,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stepText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  stepLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.orange[500],
    borderRadius: borderRadius.full,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: spacing.md,
  },
  instructionContainer: {
    flexDirection: 'row',
    backgroundColor: colors.orange[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.orange[100],
  },
  instructionNumber: {
    color: colors.white,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  instructionTextContainer: {
    flex: 1,
    paddingLeft: spacing.xs,
  },
  instructionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  deliverablesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  deliverableCount: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  deliverableCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  deliverableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deliverableIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  amazonIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.blue[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  amazonIconText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.blue[500],
  },
  instagramIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.rose[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  instagramIconText: {
    fontSize: typography.sizes.md,
  },
  deliverableInfo: {
    flex: 1,
  },
  deliverableName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
  },
  deliverableDescription: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  deleteButton: {
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.full,
  },
  requirements: {
    padding: spacing.xm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
  },
  requirementsTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  requirementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  requirementItem: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.sm,
    flex: 1,
    borderRadius: borderRadius.sm,
  },
  requirementCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  requirementType: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagItem: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  addDeliverableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orange[50],
    borderWidth: 1.3,
    borderColor: colors.orange[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addDeliverableText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.orange[500],
    marginLeft: spacing.sm,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.mg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
});
