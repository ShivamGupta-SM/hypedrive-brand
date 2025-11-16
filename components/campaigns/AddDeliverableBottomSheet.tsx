import { Label } from '@/components/ui/Label';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { CaretDown, X } from 'phosphor-react-native';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { BottomButton } from '../BottomButton';

// Types
type DeliverableType = {
  id: string;
  name: string;
};

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

type AddDeliverableBottomSheetProps = {
  onAddDeliverable: (deliverable: Deliverable) => void;
};

// Export the handle type for parent components
export type AddDeliverableBottomSheetHandle = {
  present: () => void;
  dismiss: () => void;
};

const DELIVERABLE_TYPES: DeliverableType[] = [
  { id: 'amazon_review', name: 'Amazon Review' },
  { id: 'instagram_post', name: 'Instagram Post' },
  { id: 'tiktok_video', name: 'TikTok Video' },
  { id: 'youtube_review', name: 'YouTube Review' },
  { id: 'facebook_post', name: 'Facebook Post' },
];

export const AddDeliverableBottomSheet = forwardRef<
  AddDeliverableBottomSheetHandle,
  AddDeliverableBottomSheetProps
>(({ onAddDeliverable }, ref) => {
  // Bottom sheet reference
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetRef.current?.present();
    },
    dismiss: () => {
      bottomSheetRef.current?.dismiss();
    },
  }));

  // State for form fields
  const [selectedType, setSelectedType] = useState<string>('');
  const [minWordCount, setMinWordCount] = useState<string>('100');
  const [photoCount, setPhotoCount] = useState<string>('0');
  const [videoCount, setVideoCount] = useState<string>('0');
  const [mentions, setMentions] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newMention, setNewMention] = useState<string>('');
  const [newHashtag, setNewHashtag] = useState<string>('');

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['70%'], []);

  // Callbacks
  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const closeBottomSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  // Render backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    [],
  );

  // Handle adding a new deliverable
  const handleAddDeliverable = () => {
    const newDeliverable: Deliverable = {
      id: Date.now().toString(),
      name: DELIVERABLE_TYPES.find(type => type.id === selectedType)?.name || '',
      description:
        selectedType === 'amazon_review' ? 'Product feedback with media' : 'Social media content',
      requirements: [],
    };

    if (selectedType === 'amazon_review') {
      newDeliverable.requirements = [
        { id: '1', type: 'Words', count: parseInt(minWordCount) || 100 },
        { id: '2', type: 'Photos', count: parseInt(photoCount) || 0 },
        { id: '3', type: 'Video', count: parseInt(videoCount) || 0 },
      ];
    } else {
      // For social media posts
      newDeliverable.tags = [...mentions, ...hashtags];
    }

    onAddDeliverable(newDeliverable);
    bottomSheetRef.current?.dismiss();
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setSelectedType('');
    setMinWordCount('100');
    setPhotoCount('0');
    setVideoCount('0');
    setMentions([]);
    setHashtags([]);
    setNewMention('');
    setNewHashtag('');
  };

  // Add a new mention
  const handleAddMention = () => {
    if (newMention && !mentions.includes(`@${newMention}`)) {
      setMentions([...mentions, `@${newMention}`]);
      setNewMention('');
    }
  };

  // Add a new hashtag
  const handleAddHashtag = () => {
    if (newHashtag && !hashtags.includes(`#${newHashtag}`)) {
      setHashtags([...hashtags, `#${newHashtag}`]);
      setNewHashtag('');
    }
  };

  // Remove a mention
  const handleRemoveMention = (mention: string) => {
    setMentions(mentions.filter(m => m !== mention));
  };

  // Remove a hashtag
  const handleRemoveHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter(h => h !== hashtag));
  };

  // Format data for dropdown
  const dropdownData = DELIVERABLE_TYPES.map(type => ({
    label: type.name,
    value: type.id,
  }));

  return (
    <>
      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.bottomSheetBackground}
        onDismiss={resetForm}>
        <BottomSheetView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Deliverable</Text>
            <TouchableOpacity onPress={closeBottomSheet} style={styles.closeButton}>
              <X size={22} weight="bold" color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            {/* Deliverable Type Selector - Using Dropdown */}
            <View style={styles.formGroup}>
              <Label>Select Deliverable Type</Label>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={styles.dropdownContainerStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={dropdownData}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select deliverable type"
                value={selectedType}
                onChange={item => {
                  setSelectedType(item.value);
                }}
                renderRightIcon={() => (
                  <CaretDown size={20} color={colors.text.muted} weight="bold" />
                )}
              />
            </View>

            {/* Dynamic Form Fields based on selected type */}
            {selectedType === 'amazon_review' ? (
              // Amazon Review Form
              <>
                <View style={styles.formGroup}>
                  <Label>Minimum Word Count</Label>
                  <TextInput
                    style={styles.input}
                    value={minWordCount}
                    onChangeText={setMinWordCount}
                    keyboardType="number-pad"
                    placeholder="100"
                  />
                  <Text style={styles.inputSuffix}>words</Text>
                </View>

                <View style={styles.formGroup}>
                  <Label>Media Requirements</Label>
                  <View style={styles.mediaRequirements}>
                    <View style={styles.mediaItem}>
                      <Text style={styles.mediaLabel}>Photos</Text>
                      <TextInput
                        style={styles.mediaInput}
                        value={photoCount}
                        onChangeText={setPhotoCount}
                        keyboardType="number-pad"
                        placeholder="0"
                      />
                    </View>
                    <View style={styles.mediaItem}>
                      <Text style={styles.mediaLabel}>Videos</Text>
                      <TextInput
                        style={styles.mediaInput}
                        value={videoCount}
                        onChangeText={setVideoCount}
                        keyboardType="number-pad"
                        placeholder="0"
                      />
                    </View>
                  </View>
                </View>
              </>
            ) : selectedType === 'instagram_post' ? (
              // Instagram Post Form
              <>
                <View style={styles.formGroup}>
                  <Label>Social Tags</Label>
                  <View style={styles.tagsSection}>
                    <Text style={styles.tagsSectionTitle}>Required Mentions</Text>
                    <View style={styles.tagsInputContainer}>
                      <TextInput
                        style={styles.tagsInput}
                        value={newMention}
                        onChangeText={setNewMention}
                        placeholder="Enter username"
                      />
                      <TouchableOpacity style={styles.addTagButton} onPress={handleAddMention}>
                        <Text style={styles.addTagButtonText}>Add @mention</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.tagsContainer}>
                      {mentions.map((mention, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{mention}</Text>
                          <TouchableOpacity
                            style={styles.removeTagButton}
                            onPress={() => handleRemoveMention(mention)}>
                            <X size={12} weight="bold" color={colors.text.muted} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.tagsSection}>
                    <Text style={styles.tagsSectionTitle}>Required Hashtags</Text>
                    <View style={styles.tagsInputContainer}>
                      <TextInput
                        style={styles.tagsInput}
                        value={newHashtag}
                        onChangeText={setNewHashtag}
                        placeholder="Enter hashtag"
                      />
                      <TouchableOpacity style={styles.addTagButton} onPress={handleAddHashtag}>
                        <Text style={styles.addTagButtonText}>Add #hashtag</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.tagsContainer}>
                      {hashtags.map((hashtag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{hashtag}</Text>
                          <TouchableOpacity
                            style={styles.removeTagButton}
                            onPress={() => handleRemoveHashtag(hashtag)}>
                            <X size={12} weight="bold" color={colors.text.muted} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            ) : null}
          </ScrollView>

          <BottomButton
            title="Add Deliverable"
            onPress={handleAddDeliverable}
            style={{ shadowColor: 'transparent' }}
          />
        </BottomSheetView>
      </BottomSheetModal>

      {/* Expose the open method */}
      <View style={{ display: 'none' }}>
        <Pressable onPress={openBottomSheet} />
      </View>
    </>
  );
});

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl * 1.2,
    borderTopRightRadius: borderRadius.xxl * 1.2,
  },
  indicator: {
    backgroundColor: colors.gray[400],
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  closeButton: {
    padding: spacing.xs,
  },
  formGroup: {
    marginBottom: spacing.md,
  },

  input: {
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    backgroundColor: colors.white,
    fontWeight: typography.weights.medium,
  },
  inputSuffix: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -8 }],
    marginTop: 10,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
  },
  mediaRequirements: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  mediaItem: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  mediaLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  mediaInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.sizes.md,
    backgroundColor: colors.white,
    textAlign: 'center',
  },
  tagsSection: {
    marginBottom: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  tagsSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tagsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.sizes.md,
    backgroundColor: colors.white,
    marginRight: spacing.sm,
  },
  addTagButton: {
    backgroundColor: colors.orange[50],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.orange[200],
  },
  addTagButtonText: {
    color: colors.orange[500],
    fontWeight: typography.weights.medium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  tagText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  removeTagButton: {
    padding: 2,
  },
  addButton: {
    backgroundColor: colors.orange[500],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  disabledButton: {
    backgroundColor: colors.gray[300],
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  selectText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 50 : 50,
  },
  buttonContainer: {
    marginTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : 0,
  },
  gradientButton: {
    width: '100%',
  },

  // Dropdown styles
  dropdown: {
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray[100],
  },
  dropdownContainerStyle: {
    borderRadius: borderRadius.xl,
  },
  placeholderStyle: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
  selectedTextStyle: {
    fontSize: typography.sizes.md,
    color: colors.text.black,
    fontWeight: typography.weights.medium,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: typography.sizes.md,
    borderRadius: borderRadius.md,
  },
});
