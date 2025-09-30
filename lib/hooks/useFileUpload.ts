import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

// Mock FileUploadData type
export type FileUploadData = {
  uri: string;
  name: string;
  type: string;
};

export interface UseFileUploadOptions {
  allowedTypes?: ImagePicker.MediaTypeOptions;
  quality?: number;
  maxFileSize?: number; // in bytes
  allowsEditing?: boolean;
}

export interface UseFileUploadReturn {
  selectedFile: FileUploadData | null;
  isUploading: boolean;
  error: string | null;
  selectFile: () => Promise<void>;
  removeFile: () => void;
  resetError: () => void;
}

const DEFAULT_OPTIONS: UseFileUploadOptions = {
  allowedTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.8,
  maxFileSize: 2 * 1024 * 1024, // 2MB
  allowsEditing: true,
};

/**
 * Custom hook for handling file uploads with image picker
 * Supports both camera and gallery selection
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [selectedFile, setSelectedFile] = useState<FileUploadData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = { ...DEFAULT_OPTIONS, ...options };

  const validateFile = useCallback(
    (result: ImagePicker.ImagePickerResult): boolean => {
      if (result.canceled || !result.assets?.[0]) {
        return false;
      }

      const asset = result.assets[0];
      
      // Check file size if available
      if (asset.fileSize && config.maxFileSize && asset.fileSize > config.maxFileSize) {
        setError(`File size must be less than ${(config.maxFileSize / (1024 * 1024)).toFixed(1)}MB`);
        return false;
      }

      // Check file type
      if (asset.mimeType && !isValidImageType(asset.mimeType)) {
        setError('Please select a valid image file (JPEG, PNG, WebP)');
        return false;
      }

      return true;
    },
    [config.maxFileSize]
  );

  const selectFile = useCallback(async () => {
    try {
      setError(null);
      setIsUploading(true);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library is required');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: config.allowedTypes,
        allowsEditing: config.allowsEditing,
        aspect: [1, 1],
        quality: config.quality,
      });

      if (!validateFile(result)) {
        return;
      }

      const asset = result.assets![0];
      
      // Create file data object
      const fileData: FileUploadData = {
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.${getFileExtension(asset.mimeType || 'image/jpeg')}`,
        type: asset.mimeType || 'image/jpeg',
      };

      setSelectedFile(fileData);
    } catch (err) {
      console.error('File selection error:', err);
      setError('Failed to select file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [config, validateFile]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    selectedFile,
    isUploading,
    error,
    selectFile,
    removeFile,
    resetError,
  };
}

/**
 * Hook for camera-based file selection
 */
export function useCameraUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [selectedFile, setSelectedFile] = useState<FileUploadData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = { ...DEFAULT_OPTIONS, ...options };

  const selectFile = useCallback(async () => {
    try {
      setError(null);
      setIsUploading(true);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access camera is required');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: config.allowedTypes,
        allowsEditing: config.allowsEditing,
        aspect: [1, 1],
        quality: config.quality,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      
      // Create file data object
      const fileData: FileUploadData = {
        uri: asset.uri,
        name: asset.fileName || `camera_${Date.now()}.${getFileExtension(asset.mimeType || 'image/jpeg')}`,
        type: asset.mimeType || 'image/jpeg',
      };

      setSelectedFile(fileData);
    } catch (err) {
      console.error('Camera capture error:', err);
      setError('Failed to capture image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [config]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    selectedFile,
    isUploading,
    error,
    selectFile,
    removeFile,
    resetError,
  };
}

/**
 * Utility function to format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Utility function to check if the file type is a valid image
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Utility function to get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };
  
  return extensions[mimeType.toLowerCase()] || 'jpg';
}