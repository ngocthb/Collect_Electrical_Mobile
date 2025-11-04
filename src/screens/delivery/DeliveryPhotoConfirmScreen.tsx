import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import { uploadImageToCloudinary } from '../../config/cloudinary';
import type { Asset } from 'react-native-image-picker';
import { openCamera } from '../../services/imagePickerService';
import { validateImageSize } from '../../utils/validations';
import Icon from 'react-native-vector-icons/Feather';
import SubLayout from '../../layout/SubLayout';
import { useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { saveImageUrls } from '../../store/slices/deliveryConfirmImage';

const DeliveryPhotoConfirmScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const routeProduct = route.params?.requestId;

  const handleTakePhoto = async () => {
    const result = await openCamera();

    if (result.success && result.images) {
      if (!validateImageSize(result.images[0].fileSize, 10)) {
        Alert.alert(
          'Ảnh quá lớn',
          'Ảnh có kích thước >= 10MB. Vui lòng chụp lại.',
        );
        return;
      }

      if (selectedImages.length >= 5) {
        Alert.alert('Giới hạn ảnh', 'Bạn chỉ có thể thêm tối đa 5 ảnh');
        return;
      }

      setSelectedImages(prev => [...prev, ...result.images!]);
    } else if (result.error && result.error !== 'User cancelled') {
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chụp ít nhất 1 ảnh sản phẩm');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];

      for (const img of selectedImages) {
        try {
          const url = await uploadImageToCloudinary(img);
          if (url) uploadedUrls.push(url);
        } catch (uploadErr) {
          console.warn('Upload failed for image', img?.uri, uploadErr);
        }
      }

      if (uploadedUrls.length === 0) {
        Alert.alert('Lỗi', 'Không thể tải lên ảnh. Vui lòng thử lại.');
        setIsSubmitting(false);
        return;
      }

      await dispatch(saveImageUrls(uploadedUrls));

      navigation.navigate('DeliveryCompleteScreen', {
        requestId: routeProduct,
      });
    } catch (e) {
      console.warn('Failed to confirm route', e);
      Alert.alert('Lỗi', 'Không thể xác nhận giao hàng, thử lại sau');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubLayout
      title="Xác nhận ảnh giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-6 py-8 items-center">
          <Text className="text-base mb-6 text-center text-gray-700">
            Chụp ảnh để xác nhận tình trạng sản phẩm trước khi bàn giao cho
            khách.
          </Text>

          <View className="w-full mb-4">
            <Text className="text-sm font-medium mb-2 text-gray-700">
              Ảnh sản phẩm ({selectedImages.length}/5)
            </Text>
            <View className="flex-row flex-wrap gap-4">
              {selectedImages.map((image, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri: image.uri }}
                    className="w-28 h-28 rounded-lg"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Text className="text-white text-xs font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {selectedImages.length < 5 && (
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  className="w-28 h-28 border-2 border-dashed border-gray-400 rounded-lg items-center justify-center bg-gray-50"
                >
                  <Icon name="camera" size={32} color="#9CA3AF" />
                  <Text className="text-gray-400 text-xs mt-1">Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <AppButton
            title="Xác nhận giao hàng"
            onPress={handleConfirm}
            disabled={selectedImages.length === 0 || isSubmitting}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default DeliveryPhotoConfirmScreen;
