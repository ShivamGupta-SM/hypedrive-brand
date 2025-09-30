import { borderRadius, colors, spacing, typography } from '@/constants/Design';
import * as ImagePicker from 'expo-image-picker';
import { CloudArrowUp, Trash, Upload } from 'phosphor-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface FileUploaderProps {
  onFileSelect: (uri: string) => void;
  title?: string;
  subtitle?: string;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  value?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  title = 'Upload your file',
  subtitle = 'PNG, JPG or SVG, max 2MB',
  maxSize = 2, // 2MB default
  allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'],
  value,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    setError(null);
    setLoading(true);

    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setError('Permission to access media library is required');
        return;
      }

      // Launch image picker with updated API
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];

        // Check file size (if available)
        if (selectedAsset.fileSize && selectedAsset.fileSize > maxSize * 1024 * 1024) {
          setError(`File size exceeds ${maxSize}MB limit`);
          return;
        }

        // Pass the URI to the parent component
        onFileSelect(selectedAsset.uri);
      }
    } catch (err) {
      setError('Error selecting image');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    onFileSelect('');
  };

  return (
    <View style={styles.container}>
      {value ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: value }} style={styles.previewImage} />
          <Pressable style={styles.removeButton} onPress={removeImage}>
            <Trash size={20} weight="fill" color={colors.white} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.uploadContainer}>
          <View style={styles.uploadPlaceholder}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.blue[500]} />
            ) : (
              <>
                <CloudArrowUp weight="fill" size={24} color={colors.blue[500]} />
                <Text style={styles.uploadText}>{title}</Text>
                <Text style={styles.fileFormatText}>{subtitle}</Text>
                {error && <Text style={styles.errorText}>{error}</Text>}
              </>
            )}
          </View>
          <Pressable style={styles.chooseFileButton} onPress={pickImage} disabled={loading}>
            <Upload weight="bold" size={16} color={colors.blue[500]} />
            <Text style={styles.chooseFileText}>{loading ? 'Selecting...' : 'Choose File'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
    backgroundColor: colors.gray[50],
  },
  uploadPlaceholder: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  fileFormatText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  errorText: {
    color: colors.red[500],
    fontSize: typography.sizes.xs,
    marginTop: spacing.sm,
    fontWeight: typography.weights.medium,
  },
  chooseFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.blue[100],
    gap: spacing.sm,
  },
  chooseFileText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.blue[500],
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.rose[600],
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});
