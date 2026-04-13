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

  useEffect(() => {
    if (!visible) {
      setDescription('');
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
      });

      Toast.show({
        type: 'success',
        text1: 'Gửi phản ánh thành công',
        text2: 'Cảm ơn bạn đã góp ý!',
      });

      setDescription('');
      onClose();
      onSuccess?.();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Gửi phản ánh thất bại',
        text2: 'Vui lòng thử lại',
      });
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
        keyboardVerticalOffset={24}
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
