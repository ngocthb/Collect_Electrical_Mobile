import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';
import AppButton from '../../components/ui/AppButton';
import Icon from 'react-native-vector-icons/Feather';
import { openCamera } from '../../services/imagePickerService';
import { uploadImageToCloudinary } from '../../config/cloudinary';
import { validateImageSize } from '../../utils/validations';
import routeService from '../../services/routeService';
import {
  getOrderAddress,
  getOrderName,
  getOrderId,
} from '../../utils/deliveryHelpers';
import { DEFAULT_BADGES } from '../../components/BadgeModal';

// badge list imported from BadgeModal (we send labels to API)

const DeliveryCancelScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const request = route.params?.request;
  const requestId = String(
    getOrderId(request) ?? route.params?.requestId ?? '',
  );

  const [fetchedRequest, setFetchedRequest] = useState<any | null>(null);

  // If the screen was navigated to with only requestId, fetch the full detail
  React.useEffect(() => {
    let mounted = true;
    const id = requestId || route.params?.requestId || route.params?.id;
    if (!id) return;

    // If we already have the full request object, skip fetching
    if (request) return;

    (async () => {
      try {
        const res = await routeService.getDetail(String(id));
        if (!mounted) return;
        setFetchedRequest(res ?? null);
      } catch (e) {
        console.warn('Failed to fetch route detail for cancel screen', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [requestId, request, route.params]);

  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    request?.badges ?? [],
  );
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectMessage, setRejectMessage] = useState<string>('');

  const toggleBadge = (id: string) => {
    setSelectedBadges(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id],
    );
  };

  const handleTakePhoto = async () => {
    const result = await openCamera();
    if (result.success && result.images) {
      // validate size
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

  const handleCancelConfirm = async () => {
    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const img of selectedImages) {
        try {
          const url = await uploadImageToCloudinary({
            uri: img.uri,
            mimeType: img.type,
            fileName: img.fileName,
          });
          if (url) uploadedUrls.push(url);
        } catch (e) {
          console.warn('Upload failed', e);
        }
      }

      const badgeLabels = selectedBadges.map(id => {
        const found = DEFAULT_BADGES.find(b => b.id === id);
        return found ? found.label : id;
      });

      await routeService.cancelRoute(
        requestId,
        badgeLabels,
        uploadedUrls,
        rejectMessage,
      );

      Alert.alert('Hoàn tất', 'Đã hủy đơn hàng');
      navigation.navigate('DeliveryOrder');
    } catch (e) {
      console.warn('Failed to cancel route', e);
      Alert.alert('Lỗi', 'Không thể hủy đơn hàng, thử lại sau');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubLayout title="Từ chối" onBackPress={() => navigation.goBack()}>
      <ScrollView className="flex-1 bg-gray-50">
        <View className="px-6 py-6">
          <Text className="text-base text-gray-700 mb-2">
            {getOrderName(request ?? fetchedRequest)}
          </Text>
          <Text className="text-sm text-gray-500 mb-4">
            {getOrderAddress(request ?? fetchedRequest)}
          </Text>

          <View className="bg-white rounded-xl p-4 mb-4">
            <Text className="text-base font-bold text-gray-900 mb-2">
              Lí do hủy
            </Text>
            <Text className="text-sm text-gray-500 mb-3">
              Chọn một hoặc nhiều nhãn mô tả lý do hủy
            </Text>
            {DEFAULT_BADGES.map(b => {
              const active = selectedBadges.includes(b.id);
              return (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => toggleBadge(b.id)}
                  className="flex-row items-center py-3"
                >
                  <View
                    className={`w-7 h-7 rounded-md border mr-3 items-center justify-center ${
                      active ? 'bg-red-600 border-red-600' : 'border-gray-200'
                    }`}
                  >
                    {active && <Icon name="check" size={14} color="#fff" />}
                  </View>
                  <Text className="text-base text-gray-800">{b.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="bg-white rounded-xl p-4 mb-4">
            <Text className="text-base font-bold text-gray-900 mb-2">
              Mô tả chi tiết
            </Text>
            <TextInput
              value={rejectMessage}
              onChangeText={setRejectMessage}
              placeholder="Viết mô tả hoặc lý do từ chối (tùy chọn)"
              multiline
              numberOfLines={3}
              style={{
                minHeight: 80,
                textAlignVertical: 'top',
                padding: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
              }}
            />
          </View>

          <View className="bg-white rounded-xl p-4 mb-6">
            <Text className="text-base font-medium text-gray-900 mb-2">
              Ảnh (tùy chọn)
            </Text>
            <Text className="text-sm text-gray-500 mb-3">
              Chụp ảnh hiện trạng nếu cần làm bằng chứng
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
            title="Xác nhận từ chối"
            color="#E53935"
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleCancelConfirm}
          />
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default DeliveryCancelScreen;
