import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import QRCode from 'react-native-qrcode-svg';
import type { Asset } from 'react-native-image-picker';
import { openCamera, validateImageSize } from '../../utils/imagePickerService';
import Icon from 'react-native-vector-icons/Feather';

import SubLayout from '../../layout/SubLayout';

const CONFIRM_CODE = 'DEL123456';

const DeliveryConfirmScreen = () => {
  const navigation = useNavigation<any>();
  const [qrScanned, setQrScanned] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);

  // Giả lập quét mã QR thành công
  const handleScanQr = () => {
    setQrScanned(true);
    Alert.alert('Xác nhận thành công', 'Bạn đã xác nhận lấy hàng!');
  };

  const handleTakePhoto = async () => {
    const result = await openCamera();

    if (result.success && result.images) {
      if (!validateImageSize(result.images[0].fileSize, 10)) {
        Alert.alert(
          'Ảnh quá lớn',
          'Ảnh có kích thước lớn hơn 10MB. Vui lòng chụp lại.',
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

  const handleConfirm = () => {
    if (selectedImages.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chụp ít nhất 1 ảnh sản phẩm');
      return;
    }
    navigation.navigate('DeliveryCompleteScreen');
  };

  return (
    <SubLayout
      title="Xác nhận giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-6 py-8 items-center">
          <Text className="text-base mb-6 text-center text-gray-700">
            Khi đến nơi, hãy đưa mã xác nhận này cho khách hàng để họ quét và
            xác nhận lấy hàng.
          </Text>
          <View className="bg-white p-6 rounded-xl shadow mb-8 items-center">
            <QRCode value={CONFIRM_CODE} size={160} />
            <Text className="mt-4 text-lg font-semibold tracking-widest text-primary-600">
              {CONFIRM_CODE}
            </Text>
          </View>

          {!qrScanned ? (
            <AppButton title="Khách quét mã xác nhận" onPress={handleScanQr} />
          ) : (
            <View className="w-full items-center">
              <Text className="text-base font-medium mb-4 text-green-600">
                Đã xác nhận lấy hàng!
              </Text>

              {/* Hiển thị các ảnh đã chụp và nút thêm ảnh */}
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

                  {/* Nút thêm ảnh - khung nét đứt với icon camera */}
                  {selectedImages.length < 5 && (
                    <TouchableOpacity
                      onPress={handleTakePhoto}
                      className="w-28 h-28 border-2 border-dashed border-gray-400 rounded-lg items-center justify-center bg-gray-50"
                    >
                      <Icon name="camera" size={32} color="#9CA3AF" />
                      <Text className="text-gray-400 text-xs mt-1">
                        Thêm ảnh
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Nút xác nhận */}
              <AppButton
                title="Xác nhận giao hàng"
                onPress={handleConfirm}
                disabled={selectedImages.length === 0}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default DeliveryConfirmScreen;
