import { Platform } from 'react-native';
import { apiClient } from '../client';
import type {
  OrganizationStep1Request,
  OrganizationResponse,
  FileUploadData,
} from '../types/organization';

/**
 * Organization API Service
 * Handles all organization-related API calls
 */
export class OrganizationService {
  private static readonly ENDPOINTS = {
    STEP1: '/api/organizations/step1',
  } as const;

  /**
   * Create organization step 1 with file upload
   * @param data Organization step 1 data
   * @param logoFile Optional logo file for upload
   * @returns Promise<OrganizationResponse>
   */
  static async createStep1(
    data: Omit<OrganizationStep1Request, 'logo'>,
    logoFile?: FileUploadData
  ): Promise<OrganizationResponse> {
    try {
      if (logoFile) {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add text fields
        formData.append('name', data.name);
        formData.append('category', data.category);
        formData.append('description', data.description);
        
        // Add file
        if (Platform.OS === 'web') {
          // For web, logoFile.uri might be a File object or blob URL
          if (typeof logoFile.uri === 'object' && logoFile.uri instanceof File) {
            formData.append('logo', logoFile.uri);
          } else {
            // Handle blob URL or base64
            const response = await fetch(logoFile.uri as string);
            const blob = await response.blob();
            formData.append('logo', blob, logoFile.name);
          }
        } else {
          // For React Native
          const fileObject = {
            uri: logoFile.uri,
            type: logoFile.type,
            name: logoFile.name,
          } as any;
          
          formData.append('logo', fileObject);
        }
        
        const response = await apiClient.uploadFile<OrganizationResponse>(
          this.ENDPOINTS.STEP1,
          formData
        );
        
        return response.data!;
      } else {
        // No file upload, send JSON
        const requestData: OrganizationStep1Request = {
          ...data,
          logo: '', // Empty string for no logo
        };
        
        const response = await apiClient.post<OrganizationResponse>(
          this.ENDPOINTS.STEP1,
          requestData
        );
        
        return response.data!;
      }
    } catch (error) {
      console.error('Organization Step 1 creation failed:', error);
      throw error;
    }
  }

  /**
   * Validate organization name availability
   * @param name Organization name to validate
   * @returns Promise<boolean>
   */
  static async validateName(name: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ available: boolean }>(
        '/api/organizations/validate-name',
        { name }
      );
      
      return response.data?.available ?? false;
    } catch (error) {
      console.error('Name validation failed:', error);
      return false;
    }
  }

  /**
   * Get organization by ID
   * @param id Organization ID
   * @returns Promise<OrganizationResponse>
   */
  static async getById(id: string): Promise<OrganizationResponse> {
    try {
      const response = await apiClient.get<OrganizationResponse>(
        `/api/organizations/${id}`
      );
      
      return response.data!;
    } catch (error) {
      console.error('Get organization failed:', error);
      throw error;
    }
  }

  /**
   * Update organization
   * @param id Organization ID
   * @param data Update data
   * @returns Promise<OrganizationResponse>
   */
  static async update(
    id: string,
    data: Partial<OrganizationStep1Request>
  ): Promise<OrganizationResponse> {
    try {
      const response = await apiClient.patch<OrganizationResponse>(
        `/api/organizations/${id}`,
        data
      );
      
      return response.data!;
    } catch (error) {
      console.error('Update organization failed:', error);
      throw error;
    }
  }
}

// Export default instance
export const organizationService = OrganizationService;