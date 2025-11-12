import React, { useEffect, useState } from 'react';
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

import {
  getSubcategories,
  getSizeOptions,
  getAttributes,
  getBrandsBySubcategory,
  searchSubCategories,
} from '../../services/categoryService';
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
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const dispatch = useDispatch();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [categories, setCategories] = useState<SubCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<SubCategory[]>(
    [],
  );
  const [isSearchingCategories, setIsSearchingCategories] = useState(false);
  const [sizeOptions, setSizeOptions] = useState<SizeTier[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
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

  const productName = selectedBrands.join(', ');

  // Get selected category ID
  const getSelectedCategoryId = () => {
    return selectedCategory?.id || null;
  };

  // Log selected category info whenever it changes
  useEffect(() => {
    if (selectedCategory) {
      console.log('Current selected category:', {
        id: selectedCategory.id,
        name: selectedCategory.name,
        fullObject: selectedCategory,
      });
    } else {
      console.log('No category selected');
    }
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

  const getSubCategories = async (categoryId: string) => {
    try {
      const data = await getSubcategories(categoryId);
      setCategories(data);
      setFilteredCategories(data);
    } catch (error) {
      console.error('Failed to fetch sub-categories', error);
    }
  };

  const handleCategorySearch = async (query: string) => {
    if (!categoryId) return;

    if (query.trim() === '') {
      setFilteredCategories(categories);
      return;
    }

    setIsSearchingCategories(true);
    try {
      const results = await searchSubCategories(categoryId, query);
      setFilteredCategories(results);
    } catch (error) {
      console.error('Failed to search categories:', error);
      setFilteredCategories([]);
    } finally {
      setIsSearchingCategories(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      getSubCategories(categoryId);
    }
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
    // fetch brands for the selected subcategory
    const fetchBrands = async () => {
      if (!selectedCategory) {
        setBrands([]);
        return;
      }
      setIsLoadingBrands(true);
      try {
        const data = await getBrandsBySubcategory(selectedCategory.id);
        setBrands(data || []);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
        setBrands([]);
      } finally {
        setIsLoadingBrands(false);
      }
    };
    fetchBrands();
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

      console.log(payload);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubLayout title="Tạo yêu cầu" onBackPress={goToPreviousStep}>
      <ScrollView className="flex-1 bg-white" nestedScrollEnabled={true}>
        <View className="px-6 py-4">
          {currentStep === 1 && (
            <>
              <AppSearchableDropdown
                title="Chọn danh mục sản phẩm"
                placeholder="Nhập để tìm kiếm danh mục..."
                value={selectedCategory}
                options={filteredCategories}
                onSelect={category => {
                  setSelectedCategory(category);
                  if (category) {
                    console.log('Selected category ID:', category.id);
                    console.log('Selected category name:', category.name);
                    console.log('Full category object:', category);
                  }
                }}
                onSearch={handleCategorySearch}
                displayKey="name"
                required
                loading={isSearchingCategories}
              />

              <View className="">
                {isLoadingBrands ? (
                  <View className="py-2 flex-row items-center">
                    <ActivityIndicator size="small" color="#4169E1" />
                    <Text className="ml-2 text-gray-600">
                      Đang tải thương hiệu...
                    </Text>
                  </View>
                ) : (
                  <SizeOptions
                    title="Chọn thương hiệu"
                    options={brands.map(b => b.name)}
                    selectedOptions={selectedBrands}
                    emptyText={selectedCategory ? 'Không có thương hiệu' : ''}
                    onToggle={brand => {
                      // single-select: toggle selected brand (store name for UI and id for payload)
                      const next = selectedBrands[0] === brand ? [] : [brand];
                      setSelectedBrands(next);
                      if (next.length === 0) {
                        setSelectedBrandId(null);
                      } else {
                        const found = brands.find(b => b.name === brand);
                        setSelectedBrandId(found?.brandId ?? null);
                      }
                    }}
                  />
                )}
              </View>

              <View className="">
                <SizeOptions
                  title="Nhập mô tả sản phẩm"
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
          )}

          {currentStep === 2 && (
            <>
              <AddressSelector
                selectedAddress={selectedAddress}
                onSelectAddress={setSelectedAddress}
              />
              <PickupTimeSelector />
            </>
          )}
        </View>
      </ScrollView>

      <View className="px-6 py-4">
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
            onPress={() => handleCreateRequest()}
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
    </SubLayout>
  );
};

export default CreateRequestScreen;
