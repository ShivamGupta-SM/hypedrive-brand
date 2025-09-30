import { useState, useEffect } from 'react';
import { CategoryService } from '@/lib/supabase/services/brand';
import type { ProductCategory } from '@/lib/supabase/types';

export type Category = ProductCategory;

/**
 * Hook for fetching product categories from Supabase
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await CategoryService.getCategories();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch categories');
      }

      setCategories(response.data || []);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      console.error('Error fetching categories:', errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
  };
}

/**
 * Get category by ID
 */
export function getCategoryById(categories: Category[], id: string): Category | undefined {
  return categories.find(cat => cat.id === id);
}
