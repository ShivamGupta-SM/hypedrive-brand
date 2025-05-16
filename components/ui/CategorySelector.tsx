import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { CaretDown, Check, Storefront, X } from 'phosphor-react-native';
import React, { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Using type instead of interface for better hover definitions
type Category = {
  id: string;
  name: string;
  icon?: React.ReactNode;
};

// Using type instead of interface
type CategorySelectorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  categories: Category[];
  error?: string;
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  placeholder = 'Select a category',
  categories,
  error,
}) => {
  // Bottom sheet reference
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['50%', '80%'], []);

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

  const selectedCategory = categories.find(cat => cat.id === value);

  return (
    <View>
      <Pressable
        style={[styles.selectInput, error ? styles.inputError : {}]}
        onPress={openBottomSheet}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          {selectedCategory?.icon || (
            <Storefront weight="fill" size={20} color={colors.text.muted} />
          )}
          <Text style={value ? styles.selectedText : styles.placeholderText}>
            {selectedCategory?.name || placeholder}
          </Text>
        </View>
        <CaretDown size={18} weight="bold" color={colors.text.muted} />
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.bottomSheetBackground}>
        <View style={styles.headerContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={closeBottomSheet}>
              <X size={24} weight="bold" color={colors.text.black} />
            </TouchableOpacity>
          </View>
        </View>

        <BottomSheetFlatList
          data={categories}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => {
                onChange(item.id);
                closeBottomSheet();
              }}>
              <View style={styles.categoryContent}>
                {item.icon}
                <Text style={styles.categoryText}>{item.name}</Text>
              </View>
              {item.id === value && <Check size={20} weight="bold" color={colors.blue[500]} />}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
        />
      </BottomSheetModal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectInput: {
    borderWidth: 2,
    borderColor: colors.gray[200],
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56,
  },
  inputError: {
    borderColor: colors.red[500],
  },
  placeholderText: {
    color: colors.text.muted,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  selectedText: {
    color: colors.text.black,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  errorText: {
    color: colors.red[500],
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetContent: {
    flex: 1,
  },
  indicator: {
    backgroundColor: colors.gray[400],
    width: 40,
    height: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryText: {
    fontSize: typography.sizes.md,
    color: colors.text.black,
    fontWeight: typography.weights.medium,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  headerContainer: {
    // This ensures the header doesn't scroll with the list
    zIndex: 1,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
});
