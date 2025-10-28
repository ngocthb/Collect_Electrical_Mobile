import { UPLOAD_PRESET, CLOUD_NAME } from '@env';

interface UploadImage {
  uri: string;
  mimeType?: string;
  fileName?: string;
}

export const uploadImageToCloudinary = async (
  image: UploadImage,
): Promise<string> => {
  const cloudName = CLOUD_NAME;
  const uploadPreset = UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are missing.');
  }

  const data = new FormData();

  // ⚠️ Khi dùng FormData trong React Native, cần cast rõ ràng
  data.append('file', {
    uri: image.uri,
    type: image.mimeType || 'image/jpeg',
    name: image.fileName || 'upload.jpg',
  } as any);

  data.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: data,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Upload failed');
    }

    // Kiểu trả về chính xác là string (URL ảnh)
    return result.secure_url as string;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
