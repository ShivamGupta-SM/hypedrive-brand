import AsyncStorage from '@react-native-async-storage/async-storage';

const BRAND_REGISTRATION_KEY = 'brand_registration_status';

export interface BrandRegistrationStatus {
  isComplete: boolean;
  completedAt?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  lastUpdated: string;
}

export class BrandRegistrationSync {
  /**
   * Set brand registration completion status
   */
  static async setBrandRegistrationComplete(
    isComplete: boolean,
    approvalStatus?: 'pending' | 'approved' | 'rejected'
  ): Promise<void> {
    try {
      const status: BrandRegistrationStatus = {
        isComplete,
        completedAt: isComplete ? new Date().toISOString() : undefined,
        approvalStatus,
        lastUpdated: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(BRAND_REGISTRATION_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Error setting brand registration status:', error);
    }
  }

  /**
   * Get brand registration completion status
   */
  static async getBrandRegistrationStatus(): Promise<BrandRegistrationStatus | null> {
    try {
      const statusString = await AsyncStorage.getItem(BRAND_REGISTRATION_KEY);
      if (!statusString) return null;
      
      return JSON.parse(statusString) as BrandRegistrationStatus;
    } catch (error) {
      console.error('Error getting brand registration status:', error);
      return null;
    }
  }

  /**
   * Check if brand registration is complete
   */
  static async isBrandRegistrationComplete(): Promise<boolean> {
    try {
      const status = await this.getBrandRegistrationStatus();
      return status?.isComplete ?? false;
    } catch (error) {
      console.error('Error checking brand registration completion:', error);
      return false;
    }
  }

  /**
   * Clear brand registration status (useful for logout or reset)
   */
  static async clearBrandRegistrationStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BRAND_REGISTRATION_KEY);
    } catch (error) {
      console.error('Error clearing brand registration status:', error);
    }
  }

  /**
   * Update approval status only
   */
  static async updateApprovalStatus(approvalStatus: 'pending' | 'approved' | 'rejected'): Promise<void> {
    try {
      const currentStatus = await this.getBrandRegistrationStatus();
      if (currentStatus) {
        const updatedStatus: BrandRegistrationStatus = {
          ...currentStatus,
          approvalStatus,
          lastUpdated: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(BRAND_REGISTRATION_KEY, JSON.stringify(updatedStatus));
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  }
}