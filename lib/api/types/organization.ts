// Organization API Types
export interface OrganizationStep1Request {
  name: string;
  category: string;
  description: string;
  logo?: File | string; // File for upload or string for existing URL
}

export interface OrganizationProfile {
  id: string;
  organizationId: string;
  category: string;
  description: string;
  marketplacePlatforms: string[];
  website: string;
  socialMedia: {
    instagram: string;
    tiktok: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    youtube: string;
  };
  gstNumber: string;
  gstVerified: boolean;
  companySize: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  tdsRate: string;
  approvalStatus: string;
  adminApproved: boolean;
  approvedBy: string;
  approvedAt: string;
  rejectedBy: string;
  rejectedAt: string;
  rejectionReason: string;
  industry: string;
  foundedYear: string;
  size: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  creationStep: number;
  isComplete: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string;
  createdAt: string | null;
  metadata: string;
  profile: OrganizationProfile;
  role: string;
}

export interface OrganizationResponse {
  success: boolean;
  organization: Organization;
}

// Form Data Types for React Hook Form
export interface OrganizationStep1FormData {
  name: string;
  category: string;
  description: string;
  logoUri?: string;
}

// File Upload Types
export interface FileUploadData {
  uri: string | File;
  type: string;
  name: string;
  size?: number;
}

// API Error Types
export interface OrganizationApiError {
  message: string;
  field?: string;
  code?: string;
}