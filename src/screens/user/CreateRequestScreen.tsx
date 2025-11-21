import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import toast from 'react-native-toast-message';

import type { Asset } from 'react-native-image-picker';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { getAttributes } from '../../services/categoryService';
import SubLayout from '../../layout/SubLayout';
import AppSearchableDropdown from '../../components/ui/AppSearchableDropdown';
import AttributeSizePanel from '../../components/AttributeSizePanel';
import PickupTimeSelector from '../../components/PickupTimeSelector';
import ImagePickerModal from '../../components/ImagePickerModal';
import AppImageGallery from '../../components/ui/AppImageGallery';
import AppButton from '../../components/ui/AppButton';
import SizeOptions from '../../components/SizeOptions';
import AddressSelector from '../../components/AddressSelector';

import tags from '../../data/tags';
import type { Attribute, SubCategory } from '../../types/Category';
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

  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<SubCategory | null>(
    null,
  );
  // Default to custom input (no preset size tiers)
  const [customInputEnabled, setCustomInputEnabled] = useState(true);
  const [attributeValues, setAttributeValues] = useState<
    Record<string, string>
  >({});
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

  const isStep1Valid =
    selectedBrandId !== null &&
    selectedCategory !== null &&
    selectedImages.length > 0 &&
    // attributes (if any) must be filled by selection
    (attributes.length === 0 || allAttributesFilled);

  const isStep2Valid = address !== null && timeSlots.length > 0;

  const isMounted = useRef(true);

  const loadData = async () => {
    if (!categoryId) return;
    try {
      if (!isMounted.current) return;

      if (selectedCategory) {
        // Fetch attributes for custom input by default
        setIsLoadingAttributes(true);
        try {
          const fetchedAttributes = await getAttributes(selectedCategory.id);
          if (isMounted.current) setAttributes(fetchedAttributes);
        } catch (e) {
          console.error('Failed to fetch attributes on refresh', e);
        } finally {
          if (isMounted.current) setIsLoadingAttributes(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sub-categories', error);
    }
  };

  useEffect(() => {
    const fetchAttributes = async () => {
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
      } else {
        setAttributes([]);
      }
    };

    // Reset attribute inputs when category changes
    setCustomInputEnabled(true);
    setAttributes([]);
    setAttributeValues({});
    fetchAttributes();
  }, [selectedCategory]);

  // no-op: custom input is enabled by default; attributes are fetched on category change

  // attributes selections handled per-attribute below

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
        Object.entries(attributeValues)
          .map(([key, value]) => {
            const raw = value;

            const rawStr = String(raw).trim();
            if (rawStr === '' || rawStr === 'undefined') {
              console.log('  -> skipped (empty/undefined string)');
              return null;
            }

            try {
              const parsed = JSON.parse(rawStr);

              if (typeof parsed === 'number' || typeof parsed === 'string') {
                return {
                  attributeId: key,
                  value: String(parsed),
                };
              }

              // Check if parsed is an object with .value property (dropdown selections)
              const numeric = parsed?.value;
              if (typeof numeric !== 'undefined' && numeric !== null) {
                return {
                  attributeId: key,
                  value: String(numeric),
                };
              }

              return null;
            } catch (e) {
              return {
                attributeId: key,
                value: rawStr,
              };
            }
          })
          .filter(
            (it): it is { attributeId: string; value: string } => it !== null,
          ) || null;

      const payload: CreateRequestPayload = {
        senderId: user?.userId || '',
        description: selectedTags.join(', '),
        address: selectedAddress?.address || '',
        images: urls,
        collectionSchedule: timeSlots || [],
        product: {
          parentCategoryId: categoryId,
          subCategoryId: selectedCategory?.id || '',
          sizeTierId: null,
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

              {isLoadingAttributes ? (
                <ActivityIndicator size="small" color="#4169E1" />
              ) : attributes.length > 0 ? (
                <View>
                  <AttributeSizePanel
                    attributes={attributes}
                    values={attributeValues}
                    onChange={(id: string, text: string) => {
                      console.log('handleAttributeChange called', id, text);
                      setAttributeValues(prev => {
                        const next = { ...prev, [id]: String(text) };
                        console.log('attributeValues next:', next);
                        return next;
                      });
                    }}
                    isLoading={isLoadingAttributes}
                  />
                </View>
              ) : (
                <View className="mt-4 flex-row items-center justify-center">
                  <Text className="text-sm text-gray-600">
                    Không có thuộc tính để tự điền
                  </Text>
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
