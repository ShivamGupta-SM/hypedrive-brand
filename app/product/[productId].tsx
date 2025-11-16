import { BottomButtons } from '@/components/BottomButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import { router, useLocalSearchParams } from 'expo-router';
import { DotsThreeVertical, Info, Pen, Share, Tag } from 'phosphor-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

// Mock product data - in a real app, this would come from an API
const mockProduct = {
  id: 'NKE-AM270-001',
  name: 'Nike Air Max 270',
  sku: 'NKE-AM270-001',
  price: 15999,
  description:
    'The Nike Air Max 270 combines a large Air unit with super-soft foam for all-day comfort. The sleek, running-inspired design roots you to everything Nike Air.',
  category: 'Running Shoes',
  brand: 'Nike',
  platform: 'Amazon',
  productLink: 'https://www.amazon.com/product/nike-air-max-270',
  images: [
    require('@/assets/images/placeholder.png'),
    require('@/assets/images/placeholder.png'),
    require('@/assets/images/placeholder.png'),
  ],
};

const screenWidth = Dimensions.get('window').width;

export default function ProductDetails() {
  const params = useLocalSearchParams();
  const { productId } = params;

  console.log("Product ID: ", productId);

  // In a real app, you would fetch the product data based on productId
  const product = mockProduct;


  // State for carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef(null);

  // Handle opening product link
  const handleOpenProductLink = () => {
    if (product.productLink) {
      Linking.openURL(product.productLink);
    }
  };

  // Handle create campaign
  const handleCreateCampaign = () => {
    router.push('/campaigns/create/new');
  };

  // Handle edit product
  const handleEditProduct = () => {
    router.push(`/product/edit/${product.id}`);
  };

  // Format price to Indian Rupees
  const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const BORDER_WIDTH = 2;
  const CAROUSEL_WIDTH = screenWidth - 2 * spacing.md - 2 * spacing.sm -  BORDER_WIDTH;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Product Details"
        showBackButton
        rightContent={
          <TouchableOpacity style={styles.menuButton}>
            <DotsThreeVertical size={24} color={colors.text.primary} weight="bold" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Product Image Carousel */}
        <View style={styles.carouselContainer}>
          <Carousel
            ref={carouselRef}
            loop={false}
            width={CAROUSEL_WIDTH}
            height={CAROUSEL_WIDTH * 0.8}
            autoPlay={false}
            data={product.images}
            style={styles.carouselItem}
            scrollAnimationDuration={500}
            onSnapToItem={(index) => setActiveIndex(index)}
            renderItem={({ item }) => (
              // <View style={styles.carouselItem}>
                <Image source={item} style={styles.productImage} resizeMode="contain" />
              // </View>
            )}
          />
          
          {/* Carousel Indicator */}
          <View style={styles.indicatorContainer}>
            {product.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  { backgroundColor: index === activeIndex ? colors.primary : colors.gray[200] },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfoContainer}>
          <View style={styles.productHeader}>
            <View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productSku}>SKU: {product.sku}</Text>
            </View>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionIconContainer}>
              <Info size={18} color={colors.gray[400]} weight="fill" />
            </View>
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.descriptionText}>{product.description}</Text>

          {/* Product Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionIconContainer}>
              <Tag size={18} color={colors.gray[400]} weight="fill" />
            </View>
            <Text style={styles.sectionTitle}>Product Details</Text>
          </View>

          <View style={styles.detailsTable}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{product.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Brand</Text>
              <Text style={styles.detailValue}>{product.brand}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Platform</Text>
              <View style={styles.platformContainer}>
                <Text style={styles.detailValue}>{product.platform}</Text>
              </View>
            </View>
            <View style={[styles.detailRow, styles.lastDetailRow]}>
              <Text style={styles.detailLabel}>Product Link</Text>
              <TouchableOpacity style={styles.productLinkContainer} onPress={handleOpenProductLink}>
                <Text style={styles.productLink}>Open</Text>
                <Share size={16} color={colors.orange[500]} weight="bold" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Buttons */}
      <BottomButtons
  buttons={[
    {
      title: "Edit",
      onPress: handleEditProduct,
      variant: "outline",
      icon: <Pen size={18} color={colors.gray[800]} weight="bold" />,
      iconPosition: "left"
    },
    {
      title: "Create Campaign",
      onPress: handleCreateCampaign,
      flex: 2 // Takes up more space
    }
  ]}
  layout="row"
  spacing={10}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  menuButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
  },
  carouselContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  carouselItem: {
    position: 'relative',
    // width: screenWidth,
    
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
  },
  productImage: {
    width: '100%',
    height: "100%",
    objectFit: 'cover',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: spacing.md,
    width: '100%',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  productInfoContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  productName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.black,
    marginBottom: spacing.xs,
  },
  productSku: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  productPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionIconContainer: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  descriptionText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  detailsTable: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  lastDetailRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  platformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
    backgroundColor: colors.orange[500],
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 16,
    marginRight: spacing.xs,
  },
  productLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.orange[50],
    padding: spacing.xs,
    borderRadius: borderRadius.md,
  },
  productLink: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.primary,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  editButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  editButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  campaignButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  campaignButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.white,
  },
});
