import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import type { Address } from '../types/Address';
import { deleteAddress } from '../services/addressService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { saveAddress, setAddressList } from '../store/slices/addressSlice';

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

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-select default address when component mounts or addresses change
  useEffect(() => {
    if (!selectedAddress && addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr) {
        onSelectAddress(defaultAddr);
      }
    }
  }, [addresses, selectedAddress, onSelectAddress]);

  const handleEditAddress = async (address: Address) => {
    dispatch(saveAddress(address));
    await new Promise<void>(resolve => setTimeout(resolve, 200));
    navigation.navigate('AddressMap', {
      mode: 'edit',
      address: address,
    });
  };

  const handleCreateNewAddress = async () => {
    onSelectAddress(null);
    setIsCreatingNew(true);

    navigation.navigate('AddressMap', {
      mode: 'create',
    });
    setIsCreatingNew(false);
  };

  const handleDeleteAddress = (addr: Address) => {
    if (addr.isDefault) {
      toast.show({
        type: 'warning',
        text1: 'Không thể xóa',
        text2: 'Vui lòng chọn một địa chỉ khác làm mặc định trước khi xóa.',
      });
      return;
    }
    toast.show({
      type: 'confirm',
      text1: 'Xóa địa chỉ',
      text2: `Bạn có chắc muốn xóa "${addr.address}"?`,
      autoHide: false,
      props: {
        button1: 'Hủy',
        button2: 'Xóa',
        onCancel: () => {
          toast.hide();
        },
        onConfirm: async () => {
          try {
            await deleteAddress(addr.userAddressId);
            const updated = addresses.filter(
              a => a.userAddressId !== addr.userAddressId,
            );
            dispatch(setAddressList(updated));
            if (selectedAddress?.userAddressId === addr.userAddressId)
              onSelectAddress(null);

            setIsDeleteMode(false);
            toast.show({
              type: 'success',
              text1: 'Xóa thành công',
              text2: `"${addr.address}" đã được xóa.`,
            });
          } catch (error) {
            console.error('Failed to delete address:', error);
            toast.show({
              type: 'error',
              text1: 'Lỗi',
              text2: 'Không thể xóa địa chỉ',
            });
          }
        },
      },
    });
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => isDeleteMode && setIsDeleteMode(false)}
    >
      <View className="mb-4">
        {isLoading ? (
          <ActivityIndicator size="large" color="#e85a4f" />
        ) : (
          <>
            <View className="flex-row justify-between mb-2 items-center">
              <Text className="text-sm font-semibold text-primary-100">
                Chọn địa chỉ<Text className="text-red-500"> *</Text>
              </Text>
              <TouchableOpacity
                className="p-2 bg-red-100 rounded-full"
                onPress={() => setIsDeleteMode(!isDeleteMode)}
              >
                <Icon name="trash-2" size={18} color="#e85a4f" />
              </TouchableOpacity>
            </View>

            {addresses.map(addr => (
              <TouchableOpacity
                key={addr.userAddressId}
                className={`px-4 py-2.5 rounded-lg border-2 mb-2 flex-row items-center justify-between ${
                  selectedAddress?.userAddressId === addr.userAddressId
                    ? 'bg-red-50 border-primary-100'
                    : 'bg-white  border-red-200'
                }`}
                onPress={() => onSelectAddress(addr)}
              >
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center mb-1">
                    <Text
                      className="text-xs text-gray-600 flex-1"
                      numberOfLines={2}
                    >
                      {addr.address}
                    </Text>
                    {addr.isDefault && (
                      <View className="ml-2 bg-primary-100 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-semibold text-white">
                          Mặc định
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {isDeleteMode ? (
                  <TouchableOpacity
                    className="p-2 bg-red-100 rounded-full"
                    onPress={() => handleDeleteAddress(addr)}
                  >
                    <Icon name="minus" size={18} color="#ef4444" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="p-2"
                    onPress={async () => {
                      onSelectAddress(addr);
                      await new Promise<void>(resolve =>
                        setTimeout(resolve, 200),
                      );
                      handleEditAddress(addr);
                    }}
                  >
                    <Icon name="chevron-right" size={18} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className={`px-4 py-2.5 rounded-xl border-2 border-dashed flex-row items-center justify-center border-red-200 bg-white`}
              onPress={() => {
                if (addresses.length >= 5) {
                  toast.show({
                    type: 'warning',
                    text1: 'Giới hạn địa chỉ',
                    text2:
                      'Đã đạt giới hạn tối đa. Vui lòng xóa bớt địa chỉ cũ.',
                  });
                  return;
                }
                handleCreateNewAddress();
              }}
            >
              <Icon name="plus" size={16} color="#e85a4f" />
              <Text className={`text-sm font-semibold ml-2 text-primary-100`}>
                Tạo địa chỉ mới
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AddressSelector;
