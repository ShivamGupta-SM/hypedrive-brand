import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '../api/services/organizationService';
import type {
  OrganizationStep1Request,
  OrganizationResponse,
  FileUploadData,
  OrganizationStep1FormData,
} from '../api/types/organization';

// Query Keys
export const ORGANIZATION_QUERY_KEYS = {
  all: ['organizations'] as const,
  detail: (id: string) => ['organizations', id] as const,
  validateName: (name: string) => ['organizations', 'validate-name', name] as const,
} as const;

/**
 * Hook for creating organization step 1
 * Handles both form data and file upload
 */
export function useCreateOrganizationStep1() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      formData,
      logoFile,
    }: {
      formData: OrganizationStep1FormData;
      logoFile?: FileUploadData;
    }): Promise<OrganizationResponse> => {
      const requestData: Omit<OrganizationStep1Request, 'logo'> = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
      };

      return organizationService.createStep1(requestData, logoFile);
    },
    onSuccess: (data) => {
      // Invalidate and refetch organization queries
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
      
      // Set the new organization data in cache
      if (data.organization?.id) {
        queryClient.setQueryData(
          ORGANIZATION_QUERY_KEYS.detail(data.organization.id),
          data
        );
      }
    },
    onError: (error) => {
      console.error('Organization creation failed:', error);
    },
  });
}

/**
 * Hook for validating organization name
 * Uses debounced query for real-time validation
 */
export function useValidateOrganizationName(name: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ORGANIZATION_QUERY_KEYS.validateName(name),
    queryFn: () => organizationService.validateName(name),
    enabled: enabled && name.length >= 2, // Only validate if name has at least 2 characters
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook for fetching organization by ID
 */
export function useOrganization(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ORGANIZATION_QUERY_KEYS.detail(id),
    queryFn: () => organizationService.getById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook for updating organization
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<OrganizationStep1Request>;
    }): Promise<OrganizationResponse> => {
      return organizationService.update(id, data);
    },
    onSuccess: (data, variables) => {
      // Update the organization in cache
      queryClient.setQueryData(
        ORGANIZATION_QUERY_KEYS.detail(variables.id),
        data
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ORGANIZATION_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error('Organization update failed:', error);
    },
  });
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
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isLoading: createMutation.isPending || updateMutation.isPending,
    
    // Error states
    createError: createMutation.error,
    updateError: updateMutation.error,
    error: createMutation.error || updateMutation.error,
    
    // Success states
    isCreateSuccess: createMutation.isSuccess,
    isUpdateSuccess: updateMutation.isSuccess,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
    
    // Data
    createdOrganization: createMutation.data,
    updatedOrganization: updateMutation.data,
    
    // Reset functions
    resetCreate: createMutation.reset,
    resetUpdate: updateMutation.reset,
    resetAll: () => {
      createMutation.reset();
      updateMutation.reset();
    },
  };
}