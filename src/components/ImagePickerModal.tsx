import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { openCamera, openGallery } from '../services/imagePickerService';
import { validateImageSize } from '../utils/validations';
import type { Asset } from 'react-native-image-picker';

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  /** returns selected assets (may be multiple) to parent */
  onSelect: (assets: Asset[]) => void;
  currentCount?: number;
  maxItems?: number;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  currentCount = 0,
  maxItems = 5,
}) => {
  const handlePickFromGallery = async () => {
    const allowed = Math.max(1, maxItems - currentCount);
    try {
      const result = await openGallery(true, allowed);
      if (result.success && result.images) {
        const invalidImages = result.images.filter(
          (img: Asset) => !validateImageSize(img.fileSize, 10),
        );

        if (invalidImages.length > 0) {
          Alert.alert(
            'Ảnh quá lớn',
            'Một số ảnh có kích thước >= 10MB. Vui lòng chọn ảnh nhỏ hơn 10MB.',
          );
          return;
        }

        onSelect(result.images.slice(0, allowed));
      } else if (result.error && result.error !== 'User cancelled') {
        Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện');
      }
    } catch (e) {
      console.warn('openGallery failed', e);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await openCamera();
      if (result.success && result.images) {
        if (!validateImageSize(result.images[0].fileSize, 10)) {
          Alert.alert(
            'Ảnh quá lớn',
            'Ảnh có kích thước >= 10MB. Vui lòng chụp lại.',
          );
          return;
        }

        const allowed = Math.max(1, maxItems - currentCount);
        onSelect(result.images.slice(0, allowed));
      } else if (result.error && result.error !== 'User cancelled') {
        Alert.alert('Lỗi', 'Không thể chụp ảnh');
      }
    } catch (e) {
      console.warn('openCamera failed', e);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        videoQuality: 'high',
        selectionLimit: 1,
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Lỗi', 'Không thể chọn video từ thư viện');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const allowed = Math.max(1, maxItems - currentCount);
        onSelect(result.assets.slice(0, allowed) as Asset[]);
      }
    } catch (e) {
      console.warn('pick video failed', e);
      Alert.alert('Lỗi', 'Không thể chọn video từ thư viện');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable
          className="bg-white rounded-t-3xl"
          onPress={e => e.stopPropagation()}
        >
          {/* Header with handle */}
          <View className="items-center pt-3 pb-4">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Title */}
          <View className="px-6 pb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Chọn ảnh hoặc video
            </Text>
          </View>

          {/* Options */}
          <View className="px-4 pb-6">
            <TouchableOpacity
              onPress={() => {
                handleTakePhoto();
                onClose();
              }}
              className="flex-row items-center px-4 py-4 bg-gray-50 rounded-xl mb-3"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Icon name="camera" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  Chụp ảnh
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Mở camera để chụp ảnh mới
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handlePickFromGallery();
                onClose();
              }}
              className="flex-row items-center px-4 py-4 bg-gray-50 rounded-xl mb-3"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-4">
                <Icon name="images" size={24} color="#9333EA" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  Chọn từ thư viện
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Chọn ảnh có sẵn từ thư viện
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handlePickVideo();
                onClose();
              }}
              className="flex-row items-center px-4 py-4 bg-gray-50 rounded-xl"
              activeOpacity={0.7}
            >
              <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mr-4">
                <Icon name="videocam" size={24} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800">
                  Chọn video
                </Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  Chọn video từ thư viện
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Cancel button */}
          <View className="px-4 pb-6 pt-2">
            <TouchableOpacity
              onPress={onClose}
              className="bg-white border border-gray-200 rounded-xl py-4"
              activeOpacity={0.7}
            >
              <Text className="text-center text-base font-semibold text-gray-700">
                Hủy
              </Text>
            </TouchableOpacity>
          </View>

          {/* Safe area bottom padding */}
          <View className="pb-4" />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ImagePickerModal;
