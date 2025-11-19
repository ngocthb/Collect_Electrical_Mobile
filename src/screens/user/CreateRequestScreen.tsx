import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import toast from 'react-native-toast-message';

import type { Asset } from 'react-native-image-picker';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { getSizeOptions, getAttributes } from '../../services/categoryService';
import SubLayout from '../../layout/SubLayout';
import AppSearchableDropdown from '../../components/ui/AppSearchableDropdown';
import AppInput from '../../components/ui/AppInput';
import PickupTimeSelector from '../../components/PickupTimeSelector';
import ImagePickerModal from '../../components/ImagePickerModal';
import AppImageGallery from '../../components/ui/AppImageGallery';
import AppButton from '../../components/ui/AppButton';
import SizeOptions from '../../components/SizeOptions';
import AddressSelector from '../../components/AddressSelector';

import tags from '../../data/tags';
import type { Attribute, SizeTier, SubCategory } from '../../types/Category';
import type { Address } from '../../types/Address';

import { useAppSelector } from '../../store/hooks';
import { uploadImageToCloudinary } from '../../config/cloudinary';
import create from '../../services/requestService';
import { clearTimeSlot } from '../../store/slices/timeSlotSlice';
import { CreateRequestPayload } from '../../types/Request';
import { TimeSlot } from '../../types/TimeSlot';
import { useDispatch } from 'react-redux';

const CreateRequestScreen = () => {
  const router = useRoute<any>();
  const navigation = useNavigation<any>();
  const categoryId = router?.params?.parentCategoryId;
  const user = useAppSelector(state => state.auth.user);
  const timeSlots: TimeSlot[] = useAppSelector(state => state.timeSlots.list);
  const address = useAppSelector(state => state.address.current);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [sizeOptions, setSizeOptions] = useState<SizeTier[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<SubCategory | null>(
    null,
  );
  const [selectedSizeTier, setSelectedSizeTier] = useState<SizeTier | null>(
    null,
  );
  const [customInputEnabled, setCustomInputEnabled] = useState(false);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string>
  >({});
  const [isLoadingSizeOptions, setIsLoadingSizeOptions] = useState(false);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const goToNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  };

  const allAttributesFilled =
    attributes.length > 0 &&
    attributes.every(attr => {
      const val = attributeValues[attr.id];
      return typeof val === 'string' && val.trim() !== '';
    });

  const hasSizeTier = selectedSizeTier !== null;
  const hasSizeOptions = sizeOptions.length > 0;

  const isStep1Valid =
    selectedBrandId !== null &&
    selectedCategory !== null &&
    selectedImages.length > 0 &&
    (!hasSizeOptions ||
      hasSizeTier ||
      (customInputEnabled && allAttributesFilled));

  const isStep2Valid = address !== null && timeSlots.length > 0;

  const isMounted = useRef(true);

  const loadData = async () => {
    if (!categoryId) return;
    try {
      if (!isMounted.current) return;

      if (selectedCategory) {
        setIsLoadingSizeOptions(true);
        try {
          const sizes = await getSizeOptions(selectedCategory.id);
          if (isMounted.current) setSizeOptions(sizes);
        } catch (e) {
          console.error('Failed to fetch size tiers on refresh', e);
        } finally {
          if (isMounted.current) setIsLoadingSizeOptions(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sub-categories', error);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    loadData();
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchSizeOptions = async () => {
      if (selectedCategory) {
        console.log('Fetching size options for category:', selectedCategory);
        setIsLoadingSizeOptions(true);
        try {
          const sizes = await getSizeOptions(selectedCategory.id);
          console.log('Size options received:', sizes);
          setSizeOptions(sizes);
        } catch (error) {
          console.error('Failed to fetch size tiers:', error);
        } finally {
          setIsLoadingSizeOptions(false);
        }
      } else {
        setSizeOptions([]);
      }
    };

    setSelectedSizeTier(null);
    setCustomInputEnabled(false);
    setAttributes([]);
    setAttributeValues({});
    fetchSizeOptions();
  }, [selectedCategory]);

  const handleCustomInputToggle = async () => {
    setSelectedSizeTier(null);
    setCustomInputEnabled(true);

    if (selectedCategory) {
      setIsLoadingAttributes(true);
      try {
        const fetchedAttributes = await getAttributes(selectedCategory.id);
        setAttributes(fetchedAttributes);
      } catch (error) {
        console.error('Failed to fetch attributes:', error);
      } finally {
        setIsLoadingAttributes(false);
      }
    }
  };

  const handleSizeTierSelect = (size: SizeTier | null) => {
    setSelectedSizeTier(size);
    setCustomInputEnabled(false);
    setAttributes([]);
    setAttributeValues({});
  };

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
      const formattedAttributes =
        Object.entries(attributeValues).map(([key, value]) => ({
          attributeId: key,
          value: value,
        })) || null;
      const payload: CreateRequestPayload = {
        senderId: user?.userId || '',
        description: selectedTags.join(', '),
        address: selectedAddress?.address || '',
        images: urls,
        collectionSchedule: timeSlots || [],
        product: {
          parentCategoryId: categoryId,
          subCategoryId: selectedCategory?.id || '',
          sizeTierId: selectedSizeTier?.id || null,
          brandId: selectedBrandId || '',
          attributes: formattedAttributes || null,
        },
      };
      const data = await create.create(payload);

      toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Yêu cầu đã được tạo thành công.',
      });

      dispatch(clearTimeSlot());

      // Navigate ngay lập tức
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      console.error('Error creating request:', error);
      setLoading(false);
    }
  };

  return (
    <SubLayout
      title="Tạo yêu cầu"
      onBackPress={goToPreviousStep}
      onRefresh={loadData}
    >
      <ScrollView className="flex-1 bg-white">
        <View className="px-6 py-4" style={{ flex: 1 }}>
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
                  type="brand"
                  subCategoryId={selectedCategory.id}
                  onChange={(selectedItem: any | null) => {
                    const brand = (selectedItem as any) || null;
                    if (brand) {
                      setSelectedBrandId(brand.brandId);
                    } else {
                      setSelectedBrandId(null);
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

              {isLoadingSizeOptions ? (
                <View className="py-4">
                  <Text className="text-gray-500">Đang tải kích thước...</Text>
                  <ActivityIndicator size="small" color="#4169E1" />
                </View>
              ) : sizeOptions.length > 0 ? (
                <View className="">
                  <SizeOptions
                    title="Chọn kích thước"
                    options={sizeOptions.map(option => option.name)}
                    selectedOptions={
                      selectedSizeTier ? [selectedSizeTier.name] : []
                    }
                    emptyText="Không có kích thước có sẵn"
                    onToggle={name => {
                      const selected = sizeOptions.find(
                        option => option.name === name,
                      );
                      handleSizeTierSelect(selected || null);
                    }}
                  />
                </View>
              ) : selectedCategory ? (
                <View className="py-4">
                  <Text className="text-gray-500">
                    Không có kích thước cho danh mục này
                  </Text>
                </View>
              ) : null}

              {!isLoadingSizeOptions && sizeOptions.length === 0 ? null : (
                <View className="mb-2">
                  <TouchableOpacity
                    className={`px-4 py-2.5 rounded-lg border-2 border-dashed flex-row items-center justify-center ${
                      customInputEnabled
                        ? 'bg-blue-100 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                    onPress={handleCustomInputToggle}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        customInputEnabled ? 'text-blue-500' : 'text-gray-600'
                      }`}
                    >
                      + Tự điền
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {customInputEnabled &&
                (isLoadingAttributes ? (
                  <ActivityIndicator size="small" color="#4169E1" />
                ) : attributes.length > 0 ? (
                  <View className="mt-4">
                    {attributes.map(attribute => (
                      <AppInput
                        key={attribute.id}
                        label={attribute.name}
                        placeholder={`Nhập ${attribute.name.toLowerCase()}`}
                        required
                        value={attributeValues[attribute.id] || ''}
                        onChangeText={text =>
                          setAttributeValues(prev => ({
                            ...prev,
                            [attribute.id]: text,
                          }))
                        }
                      />
                    ))}
                  </View>
                ) : (
                  <View className="mt-4 flex-row items-center justify-center">
                    <Text className="text-sm text-gray-600">
                      Không có thuộc tính để tự điền
                    </Text>
                  </View>
                ))}

              <View className="mb-4 mt-4">
                <AppImageGallery
                  images={selectedImages}
                  onRemove={handleRemoveImage}
                  onAddPress={() => setIsImagePickerVisible(true)}
                />
              </View>
            </>
          </View>

          <View style={{ display: currentStep === 2 ? 'flex' : 'none' }}>
            <AddressSelector
              selectedAddress={selectedAddress}
              onSelectAddress={setSelectedAddress}
            />
            <PickupTimeSelector />
          </View>
        </View>
      </ScrollView>

      <View className="px-6 py-4 bg-white p-4">
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
            onPress={handleCreateRequest}
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
          <ActivityIndicator size="large" color="#4169E1" />
          <Text className="mt-4 text-gray-600 font-medium">Đang xử lý...</Text>
        </View>
      )}
    </SubLayout>
  );
};

export default CreateRequestScreen;
