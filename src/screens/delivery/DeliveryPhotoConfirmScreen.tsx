import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import toast from 'react-native-toast-message';
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
import routeService from '../../services/routeService';

const DeliveryPhotoConfirmScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const route = useRoute<any>();
  const dispatch = useDispatch();
  const routeProductId = route.params?.requestId;
  const productImages = route.params?.productImages || [];

  const handleTakePhoto = async () => {
    const result = await openCamera();
    if (result.success && result.images) {
      if (!validateImageSize(result.images[0].fileSize, 10)) {
        toast.show({
          type: 'warning',
          text1: 'Ảnh quá lớn',
          text2: 'Ảnh có kích thước >= 10MB. Vui lòng chụp lại.',
        });
        return;
      }

      if (selectedImages.length >= 5) {
        toast.show({
          type: 'warning',
          text1: 'Giới hạn ảnh',
          text2: 'Bạn chỉ có thể thêm tối đa 5 ảnh',
        });
        return;
      }

      setSelectedImages(prev => [...prev, ...result.images!]);
    } else if (result.error && result.error !== 'User cancelled') {
      toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể chụp ảnh' });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    if (selectedImages.length === 0) {
      toast.show({
        type: 'info',
        text1: 'Thông báo',
        text2: 'Vui lòng chụp ít nhất 1 ảnh sản phẩm',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const uploadedUrls: string[] = [];

      // Upload images
      for (const img of selectedImages) {
        try {
          const url = await uploadImageToCloudinary(img);
          if (url) uploadedUrls.push(url);
        } catch (uploadErr) {
          console.warn('Upload failed for image', img?.uri, uploadErr);
        }
      }

      if (uploadedUrls.length === 0) {
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể tải lên ảnh.',
        });
        setIsProcessing(false);
        return;
      }

      // Lưu URLs vào Redux
      await dispatch(saveImageUrls(uploadedUrls));

      // Check image matching
      const checkImage = await routeService.checkImage(
        productImages,
        uploadedUrls,
      );
      console.log(checkImage);

      setIsProcessing(false);

      if (!checkImage || !checkImage.areSimilar) {
        // Hiện modal cảnh báo
        setShowWarningModal(true);
      } else {
        toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Ảnh xác nhận khớp với ảnh sản phẩm.',
        });
        navigation.navigate('DeliveryCompleteScreen', {
          requestId: routeProductId,
        });
      }
    } catch (e) {
      console.warn('Image processing failed', e);
      setIsProcessing(false);
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Có lỗi khi xử lý ảnh',
      });
    }
  };

  const handleProceedAnyway = () => {
    setShowWarningModal(false);
    navigation.navigate('DeliveryCompleteScreen', {
      requestId: routeProductId,
    });
  };

  return (
    <SubLayout
      title="Xác nhận sản phẩm"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-gray-600 mb-6">
          Chụp ảnh để xác nhận tình trạng sản phẩm trước khi bàn giao cho khách.
        </Text>

        <Text className="text-base font-semibold mb-3">
          Ảnh sản phẩm ({selectedImages.length}/5)
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          {selectedImages.map((image, index) => (
            <View key={index} className="relative">
              <Image
                source={{ uri: image.uri }}
                className="w-24 h-24 rounded-lg"
              />
              <TouchableOpacity
                onPress={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
              >
                <Text className="text-white font-bold">×</Text>
              </TouchableOpacity>
            </View>
          ))}

          {selectedImages.length < 5 && (
            <TouchableOpacity
              onPress={handleTakePhoto}
              className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
            >
              <Icon name="camera" size={24} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 mt-1">Thêm ảnh</Text>
            </TouchableOpacity>
          )}
        </View>

        <AppButton
          title="Xác nhận"
          onPress={handleConfirm}
          disabled={selectedImages.length === 0 || isProcessing}
          loading={isProcessing}
        />
      </ScrollView>

      {/* Warning Modal */}
      <Modal
        visible={showWarningModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWarningModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="w-16 h-16 rounded-full bg-amber-100 items-center justify-center mb-3">
                <Icon name="alert-triangle" size={32} color="#F59E0B" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                Cảnh báo
              </Text>
              <Text className="text-sm text-gray-600 text-center">
                Ảnh xác nhận không khớp với ảnh sản phẩm ban đầu. Bạn có chắc
                chắn muốn tiếp tục?
              </Text>
            </View>

            <View className="flex-row justify-between">
              <View style={{ width: '48%' }}>
                <AppButton
                  title="Từ chối"
                  onPress={() =>
                    navigation.navigate('DeliveryCancel', {
                      requestId: routeProductId,
                    })
                  }
                  color="#ef4444"
                />
              </View>
              <View style={{ width: '48%' }}>
                <AppButton
                  title="Tiếp tục"
                  onPress={handleProceedAnyway}
                  color="#3366CC"
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SubLayout>
  );
};

export default DeliveryPhotoConfirmScreen;
