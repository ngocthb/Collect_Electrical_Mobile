import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import toast from 'react-native-toast-message';

import type { Asset } from 'react-native-image-picker';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';
import AppSearchableDropdown from '../../components/ui/AppSearchableDropdown';
import AttributeSizePanel from '../../components/AttributeSizePanel';
import PickupTimeSelector from '../../components/PickupTimeSelector';
import ImagePickerModal from '../../components/ImagePickerModal';
import ConfirmModal from '../../components/ConfirmModal';
import AppImageGallery from '../../components/ui/AppImageGallery';
import AppButton from '../../components/ui/AppButton';
import SizeOptions from '../../components/SizeOptions';
import AddressSelector from '../../components/AddressSelector';

import tags from '../../data/tags';
import type { AttributeOptionData, SubCategory } from '../../types/Category';
import type { Address } from '../../types/Address';
import type { CreateRequestPayload } from '../../types/Request';
import { useAppSelector } from '../../store/hooks';
import { uploadImageToCloudinary } from '../../config/cloudinary';
import { TimeSlot } from '../../types/TimeSlot';
import create from '../../services/requestService';
import { useAppDispatch } from '../../store/hooks';
import { clearTimeSlot } from '../../store/slices/timeSlotSlice';
import Icon from 'react-native-vector-icons/Feather';
import ChooseAddress from '../../components/ChooseAddress';
import Toast from 'react-native-toast-message';

const CreateRequestScreen = () => {
  const router = useRoute<any>();
  const navigation = useNavigation<any>();
  const categoryId = router?.params?.parentCategoryId;
  const user = useAppSelector(state => state.auth.user);
  const timeSlots: TimeSlot[] = useAppSelector(state => state.timeSlots.list);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<SubCategory | null>(
    null,
  );

  const [attributeValues, setAttributeValues] = useState<AttributeOptionData[]>(
    [],
  );
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const dispatch = useAppDispatch();

  // Reset brand when category changes
  useEffect(() => {
    setSelectedBrandId(null);
  }, [selectedCategory]);

  const goToNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      dispatch(clearTimeSlot());
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  const isStep1Valid =
    selectedBrandId !== null &&
    selectedCategory !== null &&
    selectedImages.length > 0 &&
    selectedTags.length > 0;

  const isStep2Valid = selectedAddress !== null && timeSlots.length > 0;

  const handleAddImage = (assets: Asset[]) => {
    setSelectedImages(prev => [...prev, ...assets]);
    setIsImagePickerVisible(false);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadImages = async (images: Asset[]): Promise<string[]> => {
    try {
      const formattedImages = images.map(image => ({
        uri: image.uri,
        mimeType: image.type,
        fileName: image.fileName,
      }));

      const uploadedUrls = await Promise.all(
        formattedImages.map(image => uploadImageToCloudinary(image)),
      );

      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const handleCreateRequest = async () => {
    try {
      setLoading(true);

      const urls = await handleUploadImages(selectedImages);

      const payload: CreateRequestPayload = {
        senderId: user?.userId,
        description: selectedTags.join(', '),
        address: selectedAddress?.address,
        images: urls,
        collectionSchedule: timeSlots || [],
        product: {
          parentCategoryId: categoryId,
          subCategoryId: selectedCategory?.id,
          brandId: selectedBrandId,
          attributes: attributeValues || null,
        },
      };
      console.log(JSON.stringify(payload, null, 2));

      const data = await create.create(payload);
      toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Yêu cầu đã được tạo thành công.',
      });
      dispatch(clearTimeSlot());
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      console.error('Error creating request:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error?.toString() || 'Đã có lỗi xảy ra khi tạo yêu cầu.',
      });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubLayout title="Tạo yêu cầu" onBackPress={goToPreviousStep}>
      <ScrollView className="flex-1 bg-background-50">
        <View className="px-6" style={{ flex: 1 }}>
          <View style={{ display: currentStep === 1 ? 'flex' : 'none' }}>
            <>
              <AppSearchableDropdown
                type="subcategory"
                parentCategoryId={categoryId}
                onChange={(selectedItem: any | null) => {
                  const cat = (selectedItem as any) || null;

                  setSelectedCategory(cat);
                }}
              />

              {selectedCategory && (
                <AppSearchableDropdown
                  key={selectedCategory.id}
                  type="brand"
                  subCategoryId={selectedCategory?.id ?? ''}
                  onChange={(selectedItem: any | null) => {
                    const brand = (selectedItem as any) || null;
                    if (brand) {
                      setSelectedBrandId(brand.brandId);
                    }
                  }}
                />
              )}

              <View className="">
                <SizeOptions
                  title="Tình trạng sản phẩm"
                  options={tags}
                  selectedOptions={selectedTags}
                  onToggle={tag => {
                    setSelectedTags(prev =>
                      prev.includes(tag)
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag],
                    );
                  }}
                />
              </View>

              {selectedCategory && (
                <View>
                  <AttributeSizePanel
                    subCategoryId={selectedCategory.id}
                    onChange={(data: AttributeOptionData) => {
                      setAttributeValues(prev => {
                        const index = prev.findIndex(
                          item => item.attributeId === data.attributeId,
                        );
                        if (index >= 0) {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], ...data };
                          return updated;
                        } else {
                          return [...prev, data];
                        }
                      });
                    }}
                  />
                </View>
              )}

              <View className=" mt-4">
                <AppImageGallery
                  images={selectedImages}
                  onRemove={handleRemoveImage}
                  onAddPress={() => setIsImagePickerVisible(true)}
                />
              </View>
            </>
          </View>

          <View style={{ display: currentStep === 2 ? 'flex' : 'none' }}>
            <ChooseAddress
              selectedAddress={selectedAddress}
              onSelectAddress={setSelectedAddress}
            />
            <PickupTimeSelector />
          </View>
        </View>
      </ScrollView>

      <View className="px-6 py-4 bg-background-50 p-4">
        {currentStep < 2 && (
          <AppButton
            title="Tiếp theo"
            onPress={goToNextStep}
            disabled={!isStep1Valid}
          />
        )}
        {currentStep === 2 && (
          <AppButton
            title="Hoàn tất"
            onPress={() => setShowConfirmModal(true)}
            disabled={!isStep2Valid}
            loading={loading}
          />
        )}
      </View>

      <ImagePickerModal
        visible={isImagePickerVisible}
        onClose={() => setIsImagePickerVisible(false)}
        onSelect={handleAddImage}
        currentCount={selectedImages.length}
        maxItems={5}
      />

      <ConfirmModal
        visible={showConfirmModal}
        iconName="alert-triangle"
        title="Xác nhận tạo yêu cầu"
        message="Chúng tôi có thể từ chối nhận hàng nếu thông tin kích thước không chính xác."
        onConfirm={() => {
          setShowConfirmModal(false);
          handleCreateRequest();
        }}
        onCancel={() => setShowConfirmModal(false)}
      />

      {loading && currentStep === 2 && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            zIndex: 9999,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#e85a4f" />
          <Text className="mt-4 text-gray-600 font-medium">Đang xử lý...</Text>
        </View>
      )}
    </SubLayout>
  );
};

export default CreateRequestScreen;
