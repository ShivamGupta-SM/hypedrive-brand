import { supabase } from '../client';
import type { 
  Brand, 
  BrandInsert, 
  BrandUpdate, 
  ProductCategory, 
  Platform,
  ApprovalStatus 
} from '../types';

export class BrandService {
  /**
   * Create a new brand
   */
  static async createBrand(brandData: BrandInsert): Promise<Brand> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .insert(brandData)
        .select()
        .single();

      if (error) {
        console.error('Error creating brand:', error);
        throw error;
      }

      return data as Brand;
    } catch (error) {
      console.error('Error in createBrand:', error);
      throw error;
    }
  }

  /**
   * Get brand by ID
   */
  static async getBrandById(brandId: string): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('id', brandId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting brand by ID:', error);
        throw error;
      }

      return data as Brand;
    } catch (error) {
      console.error('Error in getBrandById:', error);
      throw error;
    }
  }

  /**
   * Get brand by user ID
   */
  static async getBrandByUserId(userId: string): Promise<Brand | null> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error getting brand by user ID:', error);
        throw error;
      }

      return data as Brand;
    } catch (error) {
      console.error('Error in getBrandByUserId:', error);
      throw error;
    }
  }

  /**
   * Update brand
   */
  static async updateBrand(brandId: string, updates: BrandUpdate): Promise<Brand> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandId)
        .select()
        .single();

      if (error) {
        console.error('Error updating brand:', error);
        throw error;
      }

      return data as Brand;
    } catch (error) {
      console.error('Error in updateBrand:', error);
      throw error;
    }
  }

  /**
   * Get brands with optional filters
   */
  static async getBrands(filters?: {
    approval_status?: ApprovalStatus;
    gst_verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Brand[]> {
    try {
      let query = supabase.from('brands').select('*');

      if (filters?.approval_status) {
        query = query.eq('approval_status', filters.approval_status);
      }

      if (filters?.gst_verified !== undefined) {
        query = query.eq('gst_verified', filters.gst_verified);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting brands:', error);
        throw error;
      }

      return data as Brand[];
    } catch (error) {
      console.error('Error in getBrands:', error);
      throw error;
    }
  }

  /**
   * Search brands by name
   */
  static async searchBrands(searchTerm: string, limit: number = 10): Promise<Brand[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .ilike('brand_name', `%${searchTerm}%`)
        .limit(limit);

      if (error) {
        console.error('Error searching brands:', error);
        throw error;
      }

      return data as Brand[];
    } catch (error) {
      console.error('Error in searchBrands:', error);
      throw error;
    }
  }

  /**
   * Approve brand
   */
  static async approveBrand(brandId: string, approvedBy: string): Promise<Brand> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update({
          approval_status: 'approved' as ApprovalStatus,
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandId)
        .select()
        .single();

      if (error) {
        console.error('Error approving brand:', error);
        throw error;
      }

      return data as Brand;
    } catch (error) {
      console.error('Error in approveBrand:', error);
      throw error;
    }
  }

  /**
   * Reject brand
   */
  static async rejectBrand(brandId: string, rejectionReason: string): Promise<Brand> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update({
          approval_status: 'rejected' as ApprovalStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandId)
        .select()
        .single();

      if (error) {
        console.error('Error rejecting brand:', error);
        throw error;
      }

      return data as Brand;
    } catch (error) {
      console.error('Error in rejectBrand:', error);
      throw error;
    }
  }

  /**
   * Verify GST for brand
   */
  static async verifyGST(brandId: string): Promise<Brand> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .update({
          gst_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandId)
        .select()
        .single();

      if (error) {
        console.error('Error verifying GST:', error);
        throw error;
      }

      return data as Brand;
    } catch (error) {
      console.error('Error in verifyGST:', error);
      throw error;
    }
  }

  /**
   * Get brand statistics
   */
  static async getBrandStats(brandId?: string) {
    try {
      // This would typically involve complex queries
      // For now, return basic structure
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
      };
    } catch (error) {
      console.error('Error getting brand stats:', error);
      throw error;
    }
  }
}

export class CategoryService {
  /**
   * Get all product categories
   */
  static async getCategories(): Promise<ProductCategory[]> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error getting categories:', error);
        throw error;
      }

      return data as ProductCategory[];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(categoryId: string): Promise<ProductCategory | null> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error getting category by ID:', error);
        throw error;
      }

      return data as ProductCategory;
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      throw error;
    }
  }
}

export class PlatformService {
  /**
   * Get all platforms
   */
  static async getPlatforms(): Promise<Platform[]> {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error getting platforms:', error);
        throw error;
      }

      return data as Platform[];
    } catch (error) {
      console.error('Error in getPlatforms:', error);
      throw error;
    }
  }

  /**
   * Get platform by ID
   */
  static async getPlatformById(platformId: string): Promise<Platform | null> {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('id', platformId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error getting platform by ID:', error);
        throw error;
      }

      return data as Platform;
    } catch (error) {
      console.error('Error in getPlatformById:', error);
      throw error;
    }
  }
}