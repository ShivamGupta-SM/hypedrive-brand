import { Category } from '@/lib/api/types/category';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  Briefcase,
  Desktop,
  Coffee,
  Heart,
  Palette,
  Headphones,
  Building,
  Hamburger,
  Truck,
  Leaf,
} from 'phosphor-react-native';
import { colors } from '@/constants/Design';

// Mock categories data - replace with real API call later
const mockCategories: Category[] = [
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    description: 'Online and offline retail businesses',
    isActive: true,
    icon: React.createElement(Briefcase, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
  {
    id: 'tech',
    name: 'Technology',
    description: 'Software, hardware, and tech services',
    isActive: true,
    icon: React.createElement(Desktop, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
  {
    id: 'food',
    name: 'Food & Beverage',
    description: 'Restaurants, cafes, and food services',
    isActive: true,
    icon: React.createElement(Coffee, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Healthcare, fitness, and wellness services',
    isActive: true,
    icon: React.createElement(Heart, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    description: 'Clothing, accessories, and fashion brands',
    isActive: true,
    icon: React.createElement(Palette, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Media',
    description: 'Media, entertainment, and content creation',
    isActive: true,
    icon: React.createElement(Headphones, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
  {
    id: 'services',
    name: 'Professional Services',
    description: 'Consulting, legal, and professional services',
    isActive: true,
    icon: React.createElement(Building, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Travel',
    description: 'Hotels, travel, and hospitality services',
    isActive: true,
    icon: React.createElement(Hamburger, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    description: 'Shipping, delivery, and transportation',
    isActive: true,
    icon: React.createElement(Truck, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
  {
    id: 'sustainability',
    name: 'Sustainability & Green',
    description: 'Eco-friendly and sustainable businesses',
    isActive: true,
    icon: React.createElement(Leaf, { weight: 'fill', size: 20, color: colors.text.muted }),
  },
];

// Mock API function - replace with real API call
const fetchCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate potential API error (uncomment to test error handling)
  // if (Math.random() > 0.8) {
  //   throw new Error('Failed to fetch categories');
  // }

  return mockCategories.filter(category => category.isActive);
};

export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for getting a specific category by ID
export const useCategory = (categoryId: string) => {
  const { data: categories, ...rest } = useCategories();

  const category = categories?.find(cat => cat.id === categoryId);

  return {
    ...rest,
    data: category,
  };
};
