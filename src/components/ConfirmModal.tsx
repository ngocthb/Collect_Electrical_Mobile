import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  iconName?: string;
  iconColor?: string;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  iconName = 'alert-circle',
  iconColor = '#e85a4f',
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-xl p-6 w-[85%] max-w-[400px]">
          <View className="items-center mb-4">
            <Icon name={iconName} size={48} color={iconColor} />
          </View>
          <Text className="text-lg font-bold text-center mb-2 text-gray-800">
            {title}
          </Text>
          <Text className="text-sm text-center text-gray-500 mb-6">
            {message}
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-3 rounded-lg border border-gray-300 bg-white"
              disabled={loading}
            >
              <Text className="text-center text-gray-500 font-semibold">
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-3 rounded-lg bg-primary-100"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-center text-white font-semibold">
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;
