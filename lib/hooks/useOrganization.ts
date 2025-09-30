import { useState, useEffect } from 'react';
import { BrandService } from '@/lib/supabase/services/brand';
import { getCurrentUser } from '@/lib/supabase/client';
import type { 
  Brand, 
  BrandInsert, 
  BrandUpdate,
  BrandWithUser,
  Database 
} from '@/lib/supabase/types';

// Form data types aligned with database schema
export type OrganizationStep1FormData = {
  name: string;
  category: string;
  description: string;
  website_url?: string;
  contact_phone?: string;
};

export type FileUploadData = {
  uri: string;
  name: string;
  type: string;
};

// Standardized response type for consistency
export type OrganizationResponse = {
  data: Brand | null;
  error: string | null;
  success: boolean;
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
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create brand data using database schema types
      const brandData: BrandInsert = {
        user_id: user.id,
        brand_name: formData.name,
        description: formData.description,
        brand_logo_url: logoFile?.uri,
        website: formData.website_url,
        contact_person: user.user_metadata?.full_name || user.email || '',
        phone_number: formData.contact_phone || '',
        gst_number: '', // Will be filled later during verification
        // Default values from schema
        approval_status: 'pending',
        gst_verified: false,
        tds_rate: 10, // Default TDS rate
        is_complete: false,
      };

      // Create brand via Supabase
      const response = await BrandService.createBrand(brandData);

      const result: OrganizationResponse = {
        success: true,
        data: response,
        error: null,
      };

      setData(result);
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      
      const result: OrganizationResponse = {
        success: false,
        data: null,
        error: errorObj.message,
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
      // For now, we'll use a simple search by name since getBrandBySlug doesn't exist
      const brands = await BrandService.searchBrands(name, 1);
      
      const available = brands.length === 0;
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
      
      if (!response) {
        throw new Error('Failed to fetch organization');
      }

      const result: OrganizationResponse = {
        success: true,
        data: response,
        error: null,
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
      
      return {
        success: true,
        organization: response,
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