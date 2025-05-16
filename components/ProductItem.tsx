import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { CheckCircle } from 'phosphor-react-native';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Product = {
  id: string;
  name: string;
  price: string;
  image?: any;
};

type ProductItemProps = {
  product: Product;
  isSelected: boolean;
  onSelect: () => void;
};

export function ProductItem({ product, isSelected, onSelect }: ProductItemProps) {
  return (
    <Pressable
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onSelect}>
      <Image source={product.image} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>{product.price}</Text>
      </View>
      <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
        {/* {isSelected && <View style={styles.radioButtonInner} />} */}
        {isSelected && <CheckCircle size={26} weight="fill" color={colors.orange[500]} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  selectedContainer: {
    borderColor: colors.orange[500],
    backgroundColor: colors.orange[50],
  },
  productImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
  },
  productPrice: {
    fontSize: typography.sizes.xxs,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    // width: 30,
    // height: 30,
    // borderColor: colors.orange[500],
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.orange[500],
  },
});
