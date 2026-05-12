import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface DeliveryOptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectWarehouse: () => void;
  onSelectPickup: () => void;
}

const DeliveryOptionModal: React.FC<DeliveryOptionModalProps> = ({
  visible,
  onClose,
  onSelectWarehouse,
  onSelectPickup,
}) => {
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get('window').height),
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSelectWarehouse = () => {
    onClose();
    setTimeout(() => {
      onSelectWarehouse();
    }, 300);
  };

  const handleSelectPickup = () => {
    onClose();
    setTimeout(() => {
      onSelectPickup();
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            backgroundColor: 'white',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            paddingHorizontal: 20,
            paddingVertical: 20,
            paddingBottom: 40,
          }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xl font-bold text-gray-900">
              Chọn hình thức giao hàng
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon
                name="x"
                size={24}
                color="#000"
                className="p-1 bg-slate-100 rounded-full"
              />
            </TouchableOpacity>
          </View>

          {/* Option 1: Warehouse Delivery */}
          <TouchableOpacity
            onPress={handleSelectWarehouse}
            className="bg-slate-50 rounded-xl p-5 mb-3 border border-red-200 flex-row items-center"
          >
            <View className="bg-primary-100 rounded-xl p-3 mr-4">
              <Icon name="package" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-black mb-1">
                Đưa hàng tại thùng tái chế
              </Text>
              <Text className="text-xs text-primary-100">
                Quét QR để lấy thông tin
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#e85a4f" />
          </TouchableOpacity>

          {/* Option 2: Pickup Registration */}
          <TouchableOpacity
            onPress={handleSelectPickup}
            className="bg-slate-50 rounded-xl p-5 border border-red-200 flex-row items-center"
          >
            <View className="bg-primary-100 rounded-lg p-3 mr-4">
              <Icon name="truck" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-black mb-1">
                Đăng kí thu gom tận nơi
              </Text>
              <Text className="text-xs text-primary-100">
                Thu gom hàng ttừ địa chỉ của bạn
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color="#e85a4f" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DeliveryOptionModal;
