import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import SubLayout from '../../layout/SubLayout';
import AppDropdown from '../../components/ui/AppDropdown';
import AppInput from '../../components/ui/AppInput';
import PickupTimeSelector from '../../components/PickupTimeSelector';
import PickupAddressSelector from '../../components/PickupAddressSelector';
import ImagePickerModal from '../../components/ImagePickerModal';
import {
  openCamera,
  openGallery,
  validateImageSize,
} from '../../utils/imagePickerService';
import { launchImageLibrary } from 'react-native-image-picker';
import type { Asset } from 'react-native-image-picker';
import AppButton from '../../components/ui/AppButton';
import mockRequest from '../../services/mockRequestService';
import draftService from '../../services/draftService';
const categories = [
  { id: 2, label: 'Gia dụng' },
  { id: 3, label: 'Điện thoại' },
  { id: 4, label: 'Khác' },
];

const tags = ['Đã hỏng', 'Có thể sửa', 'Không hoạt động'];

const CreateRequestScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [productName, setProductName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [timeSlots, setTimeSlots] = useState<Record<string, string[]>>({
    T2: ['09:00 AM', '09:00 PM'],
    T3: ['09:00 AM', '09:00 PM'],
    T4: ['09:00 AM', '09:00 PM'],
    T5: ['09:00 AM', '09:00 PM'],
    T6: ['09:00 AM', '09:00 PM'],
    T7: ['09:00 AM', '09:00 PM'],
    CN: ['09:00 AM', '09:00 PM'],
  });

  const [selectedAddress, setSelectedAddress] = useState({
    address:
      'Vinhomes Grand Park, Nguyễn Xiển Tòa S902, Phường Long Thạnh Mỹ, Thành Phố Thủ Đức, TP. Hồ Chí Minh',
  });

  // Load draft on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await draftService.getCreateRequestDraft();
        if (!d || !mounted) return;

        if (d.name) setProductName(d.name);
        if (d.category) {
          const found = categories.find(c => c.label === d.category);
          if (found) setSelectedCategory(found);
        }
        if (d.description)
          setSelectedTags(
            d.description
              .split(',')
              .map(s => s.trim())
              .filter(Boolean),
          );
        if (d.images) setSelectedImages(d.images as any[]);

        // ✅ CHỈ LOAD ADDRESS TỪ DRAFT NÕU KHÔNG CÓ PARAMS
        if (d.address && !route.params?.selectedAddress) {
          setSelectedAddress({ address: d.address });
        }

        if (d.timeSlots) setTimeSlots(d.timeSlots);
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, []); // ← Giữ nguyên dependency array rỗng
  // Nhận params từ AddressSelection (dependency thêm selectedAddress để check)
  useEffect(() => {
    console.log(
      '🟢 [CreateRequest] Checking params:',
      route.params?.selectedAddress,
    );

    if (route.params?.selectedAddress?.address) {
      console.log('🟢 [CreateRequest] Updating from params');
      const newAddress = route.params.selectedAddress.address;

      setSelectedAddress({ address: newAddress });

      // Cập nhật draft ngay để lần sau load đúng
      draftService
        .saveCreateRequestDraft({
          name: productName,
          category: selectedCategory?.label,
          description:
            selectedTags?.length > 0 ? selectedTags.join(', ') : undefined,
          address: newAddress, // ← Lưu địa chỉ mới vào draft
          images: selectedImages,
          timeSlots,
        })
        .catch(() => {});
    }
  }, [route.params?.selectedAddress?.address]); // ← Dependency cụ thể hơn

  useEffect(() => {
    (async () => {
      try {
        await draftService.saveCreateRequestDraft({
          name: productName,
          category: selectedCategory?.label,
          description:
            selectedTags && selectedTags.length > 0
              ? selectedTags.join(', ')
              : undefined,
          address: selectedAddress?.address,
          images: selectedImages,
          timeSlots,
        });
      } catch (e) {
        // ignore
      }
    })();
  }, [
    productName,
    selectedCategory,
    selectedTags,
    selectedImages,
    selectedAddress,
    timeSlots,
  ]);

  useEffect(() => {
    if (route.params?.location) {
      setSelectedAddress({ address: route.params.location.name });
    }
  }, [route.params?.location]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  const handlePickFromGallery = async () => {
    const result = await openGallery(true, 5);

    if (result.success && result.images) {
      const invalidImages = result.images.filter(
        img => !validateImageSize(img.fileSize, 10),
      );

      if (invalidImages.length > 0) {
        Alert.alert(
          'Ảnh quá lớn',
          'Một số ảnh có kích thước lớn hơn 10MB. Vui lòng chọn ảnh khác.',
        );
        return;
      }

      setSelectedImages(prev => [...prev, ...result.images!].slice(0, 5));
    } else if (result.error && result.error !== 'User cancelled') {
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện');
    }
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

  const handlePickVideo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        videoQuality: 'high',
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Lỗi', 'Không thể chọn video từ thư viện');
        return;
      }

      if (result.assets && result.assets.length > 0) {
        if (selectedImages.length >= 5) {
          Alert.alert(
            'Giới hạn media',
            'Bạn chỉ có thể thêm tối đa 5 ảnh/video',
          );
          return;
        }

        setSelectedImages(prev => [...prev, ...result.assets!].slice(0, 5));
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn video từ thư viện');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const isVideo = (item: Asset) => {
    return item.type?.startsWith('video/');
  };

  return (
    <SubLayout
      title="Tạo yêu cầu"
      onBackPress={() =>
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        })
      }
    >
      <ScrollView className="flex-1 bg-white" nestedScrollEnabled={true}>
        <View className="px-6 py-4">
          {/* Category */}
          <AppDropdown
            title="Chọn danh mục sản phẩm"
            options={categories}
            placeholder="Chọn danh mục"
            onSelect={option => setSelectedCategory(option)}
          />

          {/* Product Name */}
          <AppInput
            label="Nhập tên sản phẩm"
            placeholder="Ví dụ: Điện thoại Samsung Galaxy S21"
            required
            value={productName}
            onChangeText={setProductName}
          />

          {/* Product Status Tags */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-3 text-gray-900">
              Nhập mô tả sản phẩm<Text className="text-red-500"> *</Text>
            </Text>
            <View className="flex-row flex-wrap">
              {tags.map(tag => (
                <TouchableOpacity
                  key={tag}
                  className={`px-4 py-2.5 rounded-full mr-2 mb-2 border-2 ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedTags.includes(tag)
                        ? 'text-white'
                        : 'text-gray-600'
                    }`}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address */}
          <PickupAddressSelector
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            onPress={() =>
              navigation.navigate('AddressSelectionScreen', {
                selectedAddress,
                setSelectedAddress,
              })
            }
          />

          {/* Time */}
          <PickupTimeSelector
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
            timeSlots={timeSlots}
            setTimeSlots={setTimeSlots}
          />

          {/* Images */}
          <View className="mb-4">
            <Text className="text-sm font-semibold mb-2 text-gray-900">
              Hình ảnh / Video về sản phẩm
              <Text className="text-red-500"> *</Text>
            </Text>
            <Text className="text-gray-500 text-xs mb-3">
              Tối đa 5 ảnh/video, mỗi file không quá 10MB
            </Text>

            {selectedImages.length > 0 ? (
              <View className="mb-2">
                <View className="flex-row flex-wrap">
                  {selectedImages.map((item, index) => (
                    <View key={index} className="mr-3 mb-3 relative">
                      <Image
                        source={{ uri: item.uri }}
                        className="w-24 h-24 rounded-xl"
                        resizeMode="cover"
                      />

                      {/* Video play button overlay */}
                      {isVideo(item) && (
                        <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-xl">
                          <View className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
                            <Icon
                              name="play"
                              size={20}
                              color="#3B82F6"
                              style={{ marginLeft: 2 }}
                            />
                          </View>
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        className="absolute top-0 -right-2 bg-red-500 rounded-full w-7 h-7 items-center justify-center"
                        style={{
                          shadowColor: '#EF4444',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.4,
                          shadowRadius: 4,
                        }}
                      >
                        <Icon name="close" size={16} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {selectedImages.length < 5 && (
                    <TouchableOpacity
                      className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50 mr-3 mb-3"
                      onPress={() => setShowImagePicker(true)}
                    >
                      <Icon name="add" size={32} color="#9CA3AF" />
                      <Text className="text-gray-400 text-xs mt-1">Thêm</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <TouchableOpacity
                className="border-2 border-dashed border-gray-300 rounded-xl py-8 items-center bg-gray-50"
                onPress={() => setShowImagePicker(true)}
              >
                <View className="w-16 h-16 rounded-full bg-blue-100 items-center justify-center mb-3">
                  <MaterialIcon name="camera-plus" size={32} color="#3B82F6" />
                </View>
                <Text className="text-gray-900 font-semibold text-base">
                  Thêm hình ảnh / video
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Chụp ảnh hoặc chọn từ thư viện
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <AppButton
            title="Tạo Yêu Cầu"
            loading={submitting}
            disabled={
              submitting ||
              !productName.trim() ||
              !selectedAddress?.address ||
              selectedImages.length === 0
            }
            onPress={async () => {
              if (submitting) return;
              setSubmitting(true);
              try {
                const mockReqService = mockRequest;
                // build images array (uri objects or requires)
                const imagesPayload = selectedImages.map(img =>
                  img.uri ? { uri: img.uri } : img,
                );

                // only include timeSlots for days the user selected
                const timeSlotsPayload: Record<string, string[]> | undefined =
                  selectedDays && selectedDays.length > 0
                    ? selectedDays.reduce(
                        (acc: Record<string, string[]>, day) => {
                          if (timeSlots[day] && Array.isArray(timeSlots[day])) {
                            acc[day] = timeSlots[day];
                          }
                          return acc;
                        },
                        {},
                      )
                    : undefined;

                const newReq = await mockReqService.create({
                  name: productName || 'Yêu cầu mới',
                  category: selectedCategory?.label || undefined,
                  description:
                    selectedTags && selectedTags.length > 0
                      ? selectedTags.join(', ')
                      : undefined,
                  address: selectedAddress?.address,
                  images: imagesPayload,
                  timeSlots: timeSlotsPayload,
                  status: selectedTags.includes('Đã hỏng')
                    ? 'Đang chờ duyệt'
                    : 'Đã duyệt',
                });
                Alert.alert('Thành công', 'Tạo yêu cầu thành công');

                // clear draft after successful creation
                try {
                  await draftService.clearCreateRequestDraft();
                } catch (e) {
                  // ignore
                }

                // also clear any address draft to remove all draft data
                try {
                  await draftService.clearCreateAddressDraft();
                } catch (e) {
                  // ignore
                }

                // after creating a request, go to the DeliveryReward screen
                navigation.navigate('DeliveryReward');
              } catch (e) {
                console.warn('Create request failed', e);
                Alert.alert('Lỗi', 'Tạo yêu cầu thất bại. Vui lòng thử lại.');
              } finally {
                setSubmitting(false);
              }
            }}
          />
        </View>
      </ScrollView>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onPickFromGallery={handlePickFromGallery}
        onTakePhoto={handleTakePhoto}
        onPickVideo={handlePickVideo}
      />
    </SubLayout>
  );
};

export default CreateRequestScreen;
