import { useState, useEffect } from 'react';
import { BrandService } from '@/lib/supabase/services/brand';
import { AuthService } from '@/lib/supabase/services/auth';
import type { Brand, CreateBrandData, UpdateBrandData } from '@/lib/supabase/types';

// Updated types for brand/organization data
export type OrganizationStep1FormData = {
  name: string;
  category: string;
  description: string;
};

export type FileUploadData = {
  uri: string;
  name: string;
  type: string;
};

export type OrganizationResponse = {
  success: boolean;
  organization?: Brand;
  message?: string;
};

/**
 * Hook for creating organization/brand step 1
 * Integrates with Supabase brand service
 */
export function useCreateOrganizationStep1() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<OrganizationResponse | null>(null);

  const mutate = async ({
    formData,
    logoFile,
  }: {
    formData: OrganizationStep1FormData;
    logoFile?: FileUploadData;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const userResponse = await AuthService.getCurrentUser();
      if (!userResponse.success || !userResponse.data) {
        throw new Error('User not authenticated');
      }

      // Generate slug from business name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create brand data
      const brandData: CreateBrandData = {
        business_name: formData.name,
        slug,
        description: formData.description,
        logo_url: logoFile?.uri,
      };

      // Create brand via Supabase
      const response = await BrandService.createBrand(userResponse.data.id, brandData);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create organization');
      }

      const result: OrganizationResponse = {
        success: true,
        organization: response.data,
        message: 'Organization created successfully',
      };

      setData(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      
      const result: OrganizationResponse = {
        success: false,
        message: errorObj.message,
      };
      
      setData(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setData(null);
    setIsLoading(false);
  };

  return {
    mutate,
    mutateAsync: mutate,
    isPending: isLoading,
    isLoading,
    error,
    data,
    isSuccess: !!data && !error,
    reset,
  };
}

/**
 * Hook for validating organization/brand name
 * Checks if brand slug is available
 */
export function useValidateOrganizationName(name: string, enabled: boolean = true) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{ available: boolean } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const validateName = async () => {
    if (!enabled || name.length < 2) {
      setData({ available: true });
      return { available: true };
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if brand with this slug exists
      const response = await BrandService.getBrandBySlug(slug);
      
      const available = !response.success || !response.data;
      const result = { available };
      
      setData(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Validation failed');
      setError(errorObj);
      return { available: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-validate when name changes
  useEffect(() => {
    if (enabled && name.length >= 2) {
      const timeoutId = setTimeout(validateName, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [name, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: validateName,
  };
}

/**
 * Hook for fetching organization/brand by ID
 */
export function useOrganization(id: string, enabled: boolean = true) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OrganizationResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrganization = async () => {
    if (!enabled || !id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await BrandService.getBrandById(id);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch organization');
      }

      const result: OrganizationResponse = {
        success: true,
        organization: response.data,
      };

      setData(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch when id changes
  useEffect(() => {
    if (enabled && id) {
      fetchOrganization();
    }
  }, [id, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchOrganization,
  };
}

/**
 * Hook for updating organization/brand
 */
export function useUpdateOrganization() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateOrganization = async (id: string, data: Partial<Brand>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await BrandService.updateBrand(id, data);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update organization');
      }

      return {
        success: true,
        organization: response.data,
      };
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Update failed');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateOrganization,
    isLoading,
    error,
  };
}

/**
 * Utility hook for organization form management
 * Combines creation and validation logic
 */
export function useOrganizationForm() {
  const createMutation = useCreateOrganizationStep1();
  const updateMutation = useUpdateOrganization();

  return {
    // Mutations
    create: createMutation,
    update: updateMutation,
    
    // Loading states
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isLoading: createMutation.isLoading || updateMutation.isLoading,
    
    // Error states
    createError: createMutation.error,
    updateError: updateMutation.error,
    error: createMutation.error || updateMutation.error,
    
    // Success states - based on absence of error and completion
    isCreateSuccess: !createMutation.isLoading && !createMutation.error,
    isUpdateSuccess: !updateMutation.isLoading && !updateMutation.error,
    isSuccess: (!createMutation.isLoading && !createMutation.error) || (!updateMutation.isLoading && !updateMutation.error),
    
    // Data - not available in current hook structure
    createdOrganization: null,
    updatedOrganization: null,
    
    // Reset functions - simplified
    resetCreate: () => {},
    resetUpdate: () => {},
    resetAll: () => {},
  };
}