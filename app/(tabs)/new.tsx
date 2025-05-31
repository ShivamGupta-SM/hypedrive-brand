import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { DotsThreeVertical, MagnifyingGlass, Plus } from 'phosphor-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Product type definition
type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  image: string;
};

// Sample product data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Nike Air Max 270',
    sku: 'NKE-AM270-001',
    price: 15999,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
  },
  {
    id: '2',
    name: 'Nike ZoomX',
    sku: 'NKE-ZMX-002',
    price: 12999,
    image: 'https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg',
  },
  {
    id: '3',
    name: 'Nike LeBron XIX',
    sku: 'NKE-LBJ-003',
    price: 17999,
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
  },
  {
    id: '4',
    name: 'Nike Court Vision',
    sku: 'NKE-CRT-004',
    price: 7999,
    image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg',
  },
  {
    id: '5',
    name: 'Nike Air Force 1',
    sku: 'NKE-AF1-005',
    price: 9999,
    image: 'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg',
  },
  {
    id: '6',
    name: 'Nike Dunk Low',
    sku: 'NKE-DNK-006',
    price: 10999,
    image: 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg',
  },
  {
    id: '7',
    name: 'Nike React Infinity',
    sku: 'NKE-RCT-007',
    price: 13999,
    image: 'https://images.pexels.com/photos/1102777/pexels-photo-1102777.jpeg',
  },
  {
    id: '8',
    name: 'Nike Metcon 7',
    sku: 'NKE-MTC-008',
    price: 11999,
    image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg',
  },
  {
    id: '9',
    name: 'Nike Pegasus 38',
    sku: 'NKE-PGS-009',
    price: 12499,
    image: 'https://images.pexels.com/photos/1124466/pexels-photo-1124466.jpeg',
  },
  {
    id: '10',
    name: 'Nike Blazer Mid',
    sku: 'NKE-BLZ-010',
    price: 8999,
    image: 'https://images.pexels.com/photos/1580267/pexels-photo-1580267.jpeg',
  },
  {
    id: '11',
    name: 'Nike SB Dunk High',
    sku: 'NKE-SBD-011',
    price: 11499,
    image: 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg',
  },
  {
    id: '12',
    name: 'Nike Kyrie 8',
    sku: 'NKE-KYR-012',
    price: 14999,
    image: 'https://images.pexels.com/photos/1895019/pexels-photo-1895019.jpeg',
  },
];

// Product Card Component
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Pressable onPress={() => router.push(`/product/${product.id}`)} style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        <TouchableOpacity style={styles.optionsButton}>
          <DotsThreeVertical size={22} color={colors.gray[700]} weight="bold" />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productSku}>SKU: {product.sku}</Text>
        <Text style={styles.productPrice}>₹{product.price.toLocaleString()}</Text>
      </View>
    </Pressable>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <View style={styles.emptyStateContainer}>
      <Image
        source={require('@/assets/images/empty-products.png')}
        style={styles.emptyStateImage}
        defaultSource={require('@/assets/images/empty-products.png')}
      />
      <Text style={styles.emptyStateTitle}>No Products Yet</Text>
      <Text style={styles.emptyStateDescription}>
        Add your first product to showcase in your campaigns and track inventory
      </Text>
    </View>
  );
};

export default function ProductsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>(sampleProducts);

  // For demo purposes, we'll use the sample data
  // In a real app, you would fetch products from an API
  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Toggle this to test empty state
  const showEmptyState = false; // Set to true to show empty state

  // Calculate item size for grid layout
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - spacing.mg * 2 - spacing.md) / 2;

  // Render item for FlashList
  const renderItem = ({ item }: { item: Product }) => <ProductCard product={item} />;

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Products" titleAlign="left" />

      <View style={styles.searchContainer}>
        <MagnifyingGlass
          size={20}
          color={colors.gray[400]}
          weight="bold"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products by name or SKU"
          placeholderTextColor={colors.gray[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {showEmptyState || filteredProducts.length === 0 ? (
        <EmptyState />
      ) : (
        <View style={styles.listContainer}>
          <FlashList
            data={filteredProducts}
            renderItem={renderItem}
            estimatedItemSize={itemWidth + 200}
            numColumns={2}
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.id}
            extraData={searchQuery}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
            ListFooterComponent={<View style={styles.listFooter} />}
          />
          <View style={{ height: 50 }} />
        </View>
      )}

      {/* Add Product FAB */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={() => router.push('../product/add-new')}>
        <Plus size={24} color={colors.white} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.mg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  productList: {
    paddingTop: spacing.sm,
  },
  productCard: {
    flex: 1,
    margin: spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  productImageContainer: {
    position: 'relative',
    height: 140,
    padding: spacing.sm,
    backgroundColor: colors.white,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: borderRadius.lg,
  },
  optionsButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  productInfo: {
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  productName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  productSku: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.orange[500],
  },
  addButton: {
    position: 'absolute',
    bottom: spacing.xl * 3,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.orange[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.orange[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
    tintColor: colors.gray[300],
  },
  emptyStateTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  listFooter: {
    height: 80, // Space for FAB
  },
});
