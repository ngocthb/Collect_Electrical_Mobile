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
import AppImageGallery from '../../components/ui/AppImageGallery';
import type { Asset } from 'react-native-image-picker';
import AppButton from '../../components/ui/AppButton';
import draftService from '../../services/draftService';
import requestService from '../../services/requestService';
import { useAppSelector } from '../../store/hooks';
import { uploadImageToCloudinary } from '../../config/cloudinary';
const categories = [
  { id: 1, label: 'Điện tử Tiêu dùng' },
  { id: 2, label: 'Điện tử Gia dụng' },
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
  const auth = useAppSelector(s => s.auth);

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
  }, []);

  useEffect(() => {
    if (route.params?.selectedAddress?.address) {
      const newAddress = route.params.selectedAddress.address;

      setSelectedAddress({ address: newAddress });
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

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateRequest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const imagesPayload: string[] = [];
      try {
        const uploadTasks = selectedImages.map(async img => {
          const uri = img.uri ? img.uri : (img as any);
          if (
            typeof uri === 'string' &&
            (uri.startsWith('http://') || uri.startsWith('https://'))
          ) {
            return uri;
          }
          const uploaded = await uploadImageToCloudinary({
            uri: uri as string,
          });
          return uploaded;
        });
        const results = await Promise.all(uploadTasks);
        imagesPayload.push(...results.filter(Boolean));
      } catch (uploadErr) {
        console.warn(
          'Image upload to Cloudinary failed, falling back to original URIs',
          uploadErr,
        );
        const raw = selectedImages.map(img =>
          img.uri ? img.uri : (img as any),
        );
        imagesPayload.push(...(raw as any));
      }

      const collectionSchedule =
        selectedDays && selectedDays.length > 0
          ? selectedDays.map(day => {
              const slotsArr = Array.isArray(timeSlots[day])
                ? timeSlots[day]
                : [];
              const slots = [] as Array<{ startTime: string; endTime: string }>;
              if (slotsArr.length >= 2) {
                slots.push({ startTime: slotsArr[0], endTime: slotsArr[1] });
              } else if (slotsArr.length === 1) {
                slots.push({ startTime: slotsArr[0], endTime: slotsArr[0] });
              }
              return { dayName: day, slots };
            })
          : undefined;

      const senderId = auth.user?.userId;

      const payload = {
        senderId,
        name: productName || 'Yêu cầu mới',
        category: selectedCategory?.label || undefined,
        description:
          selectedTags && selectedTags.length > 0
            ? selectedTags.join(', ')
            : undefined,
        address: selectedAddress?.address,
        images: imagesPayload,
        collectionSchedule,
      };
      const response = await requestService.create(payload);
      await draftService.clearCreateRequestDraft();
      Alert.alert('Thành công', 'Tạo yêu cầu thành công');
      navigation.navigate('DeliveryReward');
    } catch (e) {
      Alert.alert('Lỗi', 'Tạo yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
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
            value={selectedCategory}
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
            <AppImageGallery
              images={selectedImages}
              onRemove={removeImage}
              onAddPress={() => setShowImagePicker(true)}
            />
          </View>

          {/* Submit Button */}
          <AppButton
            title="Tạo Yêu Cầu"
            loading={submitting}
            disabled={
              submitting ||
              !productName.trim() ||
              !selectedAddress?.address ||
              selectedImages.length === 0 ||
              selectedDays.length === 0
            }
            onPress={handleCreateRequest}
          />
        </View>
      </ScrollView>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={assets =>
          setSelectedImages(prev => [...prev, ...assets].slice(0, 5))
        }
        currentCount={selectedImages.length}
        maxItems={5}
      />
    </SubLayout>
  );
};

export default CreateRequestScreen;
