import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';
import AppButton from '../../components/ui/AppButton';
import Icon from 'react-native-vector-icons/Feather';
import AppImageGallery from '../../components/ui/AppImageGallery';
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

  const handleCancelConfirm = async () => {
    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const img of selectedImages) {
        try {
          const url = await uploadImageToCloudinary({
            uri: img.uri,
            type: img.type,
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

      toast.show({
        type: 'success',
        text1: 'Hoàn tất',
        text2: 'Đã hủy đơn hàng',
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'DeliveryOrder' }],
      });
    } catch (e) {
      console.warn('Failed to cancel route', e);
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể hủy đơn hàng, thử lại sau',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SubLayout
      title="Lấy hàng thất bại"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 bg-background-50">
        <View className="px-6">
          <View className="bg-white rounded-xl p-4 mb-4 border-2 border-red-200">
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

          <View className="bg-white rounded-xl p-4 mb-4  border-2 border-red-200">
            <Text className="text-base font-bold text-gray-900 mb-2">
              Mô tả chi tiết
            </Text>
            <TextInput
              value={rejectMessage}
              onChangeText={setRejectMessage}
              placeholder="Viết mô tả hoặc lý do từ chối (tùy chọn)"
              multiline
              numberOfLines={2}
              style={{
                minHeight: 60,
                textAlignVertical: 'top',
                padding: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
              }}
            />
          </View>

          <View className="bg-white rounded-xl p-4 mb-6  border-2 border-red-200">
            <AppImageGallery
              images={selectedImages as any as any[]}
              onRemove={handleRemoveImage}
              onAddPress={handleTakePhoto}
            />
          </View>

          {/* Require at least one badge (reason) and at least one image before allowing submit */}
          {selectedBadges.length === 0 || selectedImages.length === 0 ? (
            <Text className="text-sm text-red-500 mb-2">
              Vui lòng chọn lý do và thêm ít nhất 1 ảnh để xác nhận từ chối
            </Text>
          ) : null}

          <AppButton
            title="Xác nhận từ chối"
            color="#E53935"
            loading={isSubmitting}
            disabled={
              isSubmitting ||
              selectedBadges.length === 0 ||
              selectedImages.length === 0
            }
            onPress={handleCancelConfirm}
          />
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default DeliveryCancelScreen;
