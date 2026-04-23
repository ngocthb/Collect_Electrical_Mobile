import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import reportService from '../services/reportService';
import Toast from 'react-native-toast-message';
import { useAppSelector } from '../store/hooks';
import AppInput from './ui/AppInput';
import AppButton from './ui/AppButton';
import AppImageGallery from './ui/AppImageGallery';
import { openGallery } from '../services/imagePickerService';
import { validateImageSize } from '../utils/validations';
import type { Asset } from 'react-native-image-picker';

interface ReportCreateModalProps {
  visible: boolean;
  reportType: string;
  collectionRouteId?: string | null;
  forceCollectionRouteId?: string | null;
  showTypeSelector?: boolean;
  typeOptions?: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportCreateModal({
  visible,
  reportType,
  collectionRouteId = null,
  forceCollectionRouteId = null,
  showTypeSelector = false,
  typeOptions = ['Lỗi hệ thống', 'Lỗi điểm thu gom'],
  onClose,
  onSuccess,
}: ReportCreateModalProps) {
  const { user } = useAppSelector(s => s.auth);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(reportType);
  const [selectedImages, setSelectedImages] = useState<Asset[]>([]);

  useEffect(() => {
    if (!visible) {
      setDescription('');
      setSelectedImages([]);
    }
    setSelectedReportType(reportType);
  }, [visible, reportType]);

  const REPORT_TYPES_WITHOUT_ROUTE = ['Lỗi hệ thống', 'Lỗi điểm thu gom'];

  const getCollectionRouteId = () => {
    if (forceCollectionRouteId !== null) {
      return forceCollectionRouteId;
    }

    if (REPORT_TYPES_WITHOUT_ROUTE.includes(selectedReportType)) {
      return null;
    }
    return collectionRouteId;
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddImages = async () => {
    try {
      const allowed = Math.max(1, 3 - selectedImages.length);
      const result = await openGallery(true, allowed);

      if (result.success && result.images) {
        const invalidImages = result.images.filter(
          (img: Asset) => !validateImageSize(img.fileSize, 10),
        );

        if (invalidImages.length > 0) {
          Toast.show({
            type: 'warning',
            text1: 'Ảnh quá lớn',
            text2:
              'Một số ảnh có kích thước >= 10MB. Vui lòng chọn ảnh nhỏ hơn 10MB.',
          });
          return;
        }

        setSelectedImages(prev => [
          ...prev,
          ...result.images!.slice(0, allowed),
        ]);
      } else if (result.error && result.error !== 'User cancelled') {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể chọn ảnh từ thư viện',
        });
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể chọn ảnh từ thư viện',
      });
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng nhập nội dung phản ánh',
      });
      return;
    }

    if (!user?.userId) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi xác thực',
        text2: 'Vui lòng đăng nhập lại',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.submitReport({
        userId: user.userId,
        collectionRouteId: getCollectionRouteId(),
        description: description.trim(),
        reportType: selectedReportType,
        images: selectedImages,
      });

      setDescription('');
      setSelectedImages([]);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Report submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-4 pb-6 max-h-[80%]">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-primary-100">
                  Phản ánh dịch vụ
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Icon name="x" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Content */}
                <View className="mb-4">
                  {showTypeSelector && (
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Chọn loại phản ánh
                      </Text>
                      <View className="flex-row gap-2">
                        {typeOptions.map(option => {
                          const isSelected = selectedReportType === option;
                          return (
                            <TouchableOpacity
                              key={option}
                              onPress={() => setSelectedReportType(option)}
                              className={`flex-1 rounded-lg border px-3 py-3 items-center ${
                                isSelected
                                  ? 'border-primary-100 bg-primary-50'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              <Text
                                className={`text-sm font-semibold text-center ${
                                  isSelected ? 'text-white' : 'text-gray-700'
                                }`}
                              >
                                {option}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Description Input */}
                  <View className="mb-4">
                    <AppInput
                      label="Mô tả chi tiết"
                      required
                      placeholder="Nhập nội dung phản ánh của bạn..."
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                      editable={!isSubmitting}
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                      {description.length}/500 ký tự
                    </Text>
                  </View>

                  {/* Image Gallery */}
                  <AppImageGallery
                    images={selectedImages}
                    onRemove={handleRemoveImage}
                    onAddPress={handleAddImages}
                    numberOfImages={3}
                    haveColorText={false}
                    isRequire={false}
                  />
                </View>
              </ScrollView>

              {/* Button */}
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <AppButton
                    title="Hủy"
                    onPress={onClose}
                    disabled={isSubmitting}
                    className="rounded-lg border-0"
                  />
                </View>

                <View className="flex-1">
                  <AppButton
                    title={isSubmitting ? 'Đang gửi...' : 'Gửi phản ánh'}
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting || !description.trim()}
                    color="#2563EB"
                    className="rounded-lg border-0"
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
