import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import type { FileUploadData } from '../api/types/organization';

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

      return true;
    },
    [config.maxFileSize]
  );

  const processFile = useCallback(
    (asset: ImagePicker.ImagePickerAsset): FileUploadData => {
      // Determine MIME type
      let mimeType = 'image/jpeg'; // default
      if (asset.type === 'image') {
        if (asset.uri.toLowerCase().includes('.png')) {
          mimeType = 'image/png';
        } else if (asset.uri.toLowerCase().includes('.gif')) {
          mimeType = 'image/gif';
        } else if (asset.uri.toLowerCase().includes('.webp')) {
          mimeType = 'image/webp';
        }
      }

      // Generate filename if not provided
      const fileName = asset.fileName || `image_${Date.now()}.${mimeType.split('/')[1]}`;

      return {
        uri: asset.uri,
        type: mimeType,
        name: fileName,
        size: asset.fileSize,
      };
    },
    []
  );

  const selectFile = useCallback(async (): Promise<void> => {
    try {
      setIsUploading(true);
      setError(null);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library is required');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: config.allowedTypes!,
        allowsEditing: config.allowsEditing,
        quality: config.quality,
        aspect: [1, 1], // Square aspect ratio for logos
      });

      if (!validateFile(result)) {
        return;
      }

      const asset = result.assets![0];
      const fileData = processFile(asset);
      setSelectedFile(fileData);
    } catch (err) {
      console.error('File selection error:', err);
      setError('Failed to select file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [config, validateFile, processFile]);

  const selectFromCamera = useCallback(async (): Promise<void> => {
    try {
      setIsUploading(true);
      setError(null);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access camera is required');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: config.allowedTypes!,
        allowsEditing: config.allowsEditing,
        quality: config.quality,
        aspect: [1, 1], // Square aspect ratio for logos
      });

      if (!validateFile(result)) {
        return;
      }

      const asset = result.assets![0];
      const fileData = processFile(asset);
      setSelectedFile(fileData);
    } catch (err) {
      console.error('Camera capture error:', err);
      setError('Failed to capture image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [config, validateFile, processFile]);

  const removeFile = useCallback((): void => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const resetError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    selectedFile,
    isUploading,
    error,
    selectFile,
    removeFile,
    resetError,
    // Additional methods
    selectFromCamera,
  } as UseFileUploadReturn & { selectFromCamera: () => Promise<void> };
}

/**
 * Utility function to convert file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Utility function to validate image file type
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType.toLowerCase());
}