import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';

import type { Address } from '../types/Address';
import { deleteAddress } from '../services/addressService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAddressList } from '../store/slices/addressSlice';
import ConfirmModal from './ConfirmModal';

interface AddressSelectorProps {
  selectedAddress: Address | null;
  onSelectAddress: (address: Address | null) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddress,
  onSelectAddress,
}) => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const addresses = useAppSelector(state => state.address.list);

  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  // Auto-select default address when component mounts or addresses change
  useEffect(() => {
    if (!selectedAddress && addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr) {
        onSelectAddress(defaultAddr);
      }
    }
  }, [addresses, selectedAddress, onSelectAddress]);

  const handleCreateNewAddress = async () => {
    onSelectAddress(null);

    navigation.navigate('AddressMap', {
      mode: 'create',
    });
  };

  const handleDeleteAddress = (addr: Address) => {
    setAddressToDelete(addr);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!addressToDelete) return;

    try {
      await deleteAddress(addressToDelete.userAddressId);
      const updated = addresses.filter(
        a => a.userAddressId !== addressToDelete.userAddressId,
      );
      dispatch(setAddressList(updated));
      if (selectedAddress?.userAddressId === addressToDelete.userAddressId)
        onSelectAddress(null);

      setDeleteModalVisible(false);
      setAddressToDelete(null);

      toast.show({
        type: 'success',
        text1: 'Xóa thành công',
        text2: `"${addressToDelete.address}" đã được xóa.`,
      });
    } catch (error) {
      console.error('Failed to delete address:', error);
      setDeleteModalVisible(false);
      setAddressToDelete(null);
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể xóa địa chỉ',
      });
    }
  };
  const closeAllSwipers = () => {
    swipeableRefs.current.forEach(ref => {
      ref?.close();
    });
  };

  const renderRightActions = (addr: Address) => {
    return (
      <View className="justify-center mr-2">
        <TouchableOpacity
          className="bg-red-500 rounded-xl h-full px-6 items-center justify-center"
          onPress={() => {
            swipeableRefs.current.get(addr.userAddressId)?.close();
            handleDeleteAddress(addr);
          }}
          activeOpacity={0.8}
        >
          <Icon name="trash-2" size={20} color="#fff" />
          <Text className="text-white text-xs font-semibold mt-1">Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={closeAllSwipers}
      className="flex-1"
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="#e85a4f" />
      ) : (
        <>
          <View className="flex-row justify-between mb-3 items-center">
            <Text className="text-sm font-semibold text-primary-100">
              Danh sách địa chỉ<Text className="text-red-500"> *</Text>
            </Text>
            {addresses.length > 1 && (
              <Text className="text-xs text-gray-500">Vuốt trái để xóa</Text>
            )}
          </View>

          {addresses.map(addr => (
            <View className="mb-2.5" key={addr.userAddressId}>
              <Swipeable
                ref={ref => {
                  if (ref) {
                    swipeableRefs.current.set(addr.userAddressId, ref);
                  } else {
                    swipeableRefs.current.delete(addr.userAddressId);
                  }
                }}
                renderRightActions={() => renderRightActions(addr)}
                overshootRight={false}
                friction={2}
                enabled={addresses.length > 1}
                onSwipeableWillOpen={() => {
                  swipeableRefs.current.forEach((ref, id) => {
                    if (id !== addr.userAddressId) {
                      ref?.close();
                    }
                  });
                }}
              >
                <TouchableOpacity
                  className={
                    'px-4 py-3 rounded-xl  flex-row items-center justify-between bg-white border-2 border-red-200'
                  }
                  disabled={true}
                  activeOpacity={0.7}
                >
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center">
                      <Text
                        className={'text-sm flex-1 text-text-sub font-medium'}
                        numberOfLines={2}
                      >
                        {addr.address}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            </View>
          ))}

          {addresses.length < 5 && (
            <TouchableOpacity
              className="px-4 py-3 rounded-xl border-2 border-dashed border-primary-100 bg-red-50/30 flex-row items-center justify-center mt-1"
              onPress={() => {
                handleCreateNewAddress();
              }}
              activeOpacity={0.7}
            >
              <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center mr-2">
                <Icon name="plus" size={14} color="#fff" />
              </View>
              <Text className="text-sm font-semibold text-primary-100">
                Tạo địa chỉ mới
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <ConfirmModal
        visible={deleteModalVisible}
        title="Xóa địa chỉ"
        message={`Bạn có chắc muốn xóa "${addressToDelete?.address}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setAddressToDelete(null);
        }}
        iconName="trash-2"
        iconColor="#ef4444"
      />
    </TouchableOpacity>
  );
};

export default AddressSelector;
