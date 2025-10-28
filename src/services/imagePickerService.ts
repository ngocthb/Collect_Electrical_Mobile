// utils/imagePickerService.ts
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { ImagePickerResponse, Asset } from 'react-native-image-picker';

export interface ImagePickerResult {
  success: boolean;
  images?: Asset[];
  error?: string;
}

/**
 * Request camera permission for Android
 */
const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Quyền truy cập Camera',
          message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      console.log('Camera permission result:', granted);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;
      if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Quyền bị chặn',
          'Bạn đã chặn quyền Camera. Mở cài đặt để cấp quyền?',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
        return false;
      }
      return false;
    } catch (err) {
      console.warn('Camera permission error:', err);
      return false;
    }
  }
  return true; // iOS handles permissions automatically
};

/**
 * Request gallery permission for Android
 */
const requestGalleryPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const androidVersion = Platform.Version;

      // Android 13+ (API 33+) uses READ_MEDIA_IMAGES
      if (androidVersion >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Quyền truy cập Thư viện ảnh',
            message: 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );
        console.log('Gallery (API33) permission result:', granted);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;
        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Quyền bị chặn',
            'Bạn đã chặn quyền truy cập Thư viện. Mở cài đặt để cấp quyền?',
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
            ],
          );
          return false;
        }
        return false;
      }

      // Below Android 13 uses READ_EXTERNAL_STORAGE
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Quyền truy cập Thư viện ảnh',
          message: 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      console.log('Gallery (legacy) permission result:', granted);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;
      if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Quyền bị chặn',
          'Bạn đã chặn quyền truy cập Thư viện. Mở cài đặt để cấp quyền?',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
        return false;
      }
      return false;
    } catch (err) {
      console.warn('Gallery permission error:', err);
      return false;
    }
  }
  return true; // iOS handles permissions automatically
};

/**
 * Open camera to take a photo
 */
export const openCamera = async (): Promise<ImagePickerResult> => {
  try {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert(
        'Quyền truy cập bị từ chối',
        'Vui lòng cấp quyền camera trong cài đặt để sử dụng tính năng này',
      );
      return { success: false, error: 'Camera permission denied' };
    }

    const result: ImagePickerResponse = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      saveToPhotos: true,
      includeBase64: false,
    });

    if (result.didCancel) {
      return { success: false, error: 'User cancelled' };
    }

    if (result.errorCode) {
      return { success: false, error: result.errorMessage || 'Camera error' };
    }

    if (result.assets && result.assets.length > 0) {
      return { success: true, images: result.assets };
    }

    return { success: false, error: 'No image captured' };
  } catch (error) {
    console.error('Camera error:', error);
    return { success: false, error: 'Failed to open camera' };
  }
};

/**
 * Open gallery to pick images
 */
export const openGallery = async (
  multiple: boolean = false,
  maxSelection: number = 5,
): Promise<ImagePickerResult> => {
  try {
    const hasPermission = await requestGalleryPermission();

    if (!hasPermission) {
      Alert.alert(
        'Quyền truy cập bị từ chối',
        'Vui lòng cấp quyền thư viện ảnh trong cài đặt để sử dụng tính năng này',
      );
      return { success: false, error: 'Gallery permission denied' };
    }

    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1920,
      selectionLimit: multiple ? maxSelection : 1,
      includeBase64: false,
    });

    if (result.didCancel) {
      return { success: false, error: 'User cancelled' };
    }

    if (result.errorCode) {
      return { success: false, error: result.errorMessage || 'Gallery error' };
    }

    if (result.assets && result.assets.length > 0) {
      return { success: true, images: result.assets };
    }

    return { success: false, error: 'No image selected' };
  } catch (error) {
    console.error('Gallery error:', error);
    return { success: false, error: 'Failed to open gallery' };
  }
};
