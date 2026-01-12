import { useState } from 'react';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

export const useCloudinaryProfileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'user-profiles');
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadProfileImage, isUploading };
};