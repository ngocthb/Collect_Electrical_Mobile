import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { maskPhone } from '../utils/validations';
import type { Address } from '../types/Address';
import mockAddressService from '../services/mockAddressService';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  saveAddress,
  setAddressList,
  clearLastAddedId,
} from '../store/slices/addressSlice';

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

  const current = useAppSelector(state => state.address.current);
  const addresses = useAppSelector(state => state.address.list);
  const lastAddedId = useAppSelector(state => state.address.lastAddedId);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchAddresses = async () => {
        // Only fetch if addresses list is empty
        if (addresses.length === 0) {
          setIsLoading(true);
          const data = await mockAddressService.list();
          dispatch(setAddressList(data));
          setIsLoading(false);
        }

        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          // Auto-select newly created address
          if (lastAddedId) {
            const newlyAdded = addresses.find(a => a.id === lastAddedId);
            if (newlyAdded) {
              onSelectAddress(newlyAdded);
              dispatch(clearLastAddedId());
              return;
            }
          }

          if (current && current.id !== '0') {
            const found = addresses.find(a => a.id === current.id);
            if (found) {
              onSelectAddress(found);
              return;
            }
          }

          if (addresses.length > 0 && selectedAddress === null) {
            onSelectAddress(addresses[0]);
          }
        }, 0);
      };

      fetchAddresses();
    }, [
      current,
      addresses.length,
      lastAddedId,
      dispatch,
      onSelectAddress,
      selectedAddress,
    ]),
  );

  const handleEditAddress = async (address: Address) => {
    dispatch(saveAddress(address));
    await new Promise<void>(resolve => setTimeout(resolve, 200));
    navigation.navigate('CreateAddress');
  };

  const handleCreateNewAddress = async () => {
    onSelectAddress(null);
    setIsCreatingNew(true);
    await new Promise<void>(resolve => setTimeout(resolve, 200));
    navigation.navigate('CreateAddress');
    setIsCreatingNew(false);
  };

  const handleDeleteAddress = (addr: Address) => {
    Alert.alert('Xóa địa chỉ', `Bạn có chắc muốn xóa "${addr.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await mockAddressService.remove(addr.id);
          const updated = addresses.filter(a => a.id !== addr.id);
          dispatch(setAddressList(updated));
          if (selectedAddress?.id === addr.id) onSelectAddress(null);
        },
      },
    ]);
  };

  return (
    <View className="mb-4">
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View className="flex-row justify-between mb-2 items-center">
            <Text className="text-sm font-semibold text-gray-900">
              Chọn địa chỉ<Text className="text-red-500"> *</Text>
            </Text>
            <TouchableOpacity
              className="p-2 bg-red-100 rounded-full"
              onPress={() => setIsDeleteMode(!isDeleteMode)}
            >
              <Icon name="trash-2" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {addresses.map(addr => (
            <TouchableOpacity
              key={addr.id}
              className={`px-4 py-2.5 rounded-lg border-2 mb-2 flex-row items-center justify-between ${
                selectedAddress?.id === addr.id
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-white border-gray-300'
              }`}
              onPress={() => onSelectAddress(addr)}
            >
              <View className="flex-1 mr-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm font-semibold text-gray-900">
                    {addr.name}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {maskPhone(addr.phone)}
                  </Text>
                </View>
                <Text className="text-xs text-gray-600" numberOfLines={2}>
                  {addr.address}
                </Text>
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
            className={`px-4 py-2.5 rounded-lg border-2 border-dashed flex-row items-center justify-center ${
              isCreatingNew
                ? 'bg-blue-100 border-blue-500'
                : 'bg-white border-gray-300'
            }`}
            onPress={() => {
              if (addresses.length >= 5) {
                Alert.alert(
                  'Giới hạn địa chỉ',
                  'Bạn chỉ được tạo tối đa 5 địa chỉ.',
                );
                return;
              }
              handleCreateNewAddress();
            }}
            disabled={addresses.length >= 5}
          >
            <Icon
              name="plus"
              size={16}
              color={isCreatingNew ? '#3B82F6' : '#6B7280'}
            />
            <Text
              className={`text-sm font-semibold ml-2 ${
                isCreatingNew ? 'text-blue-600' : 'text-gray-600'
              }`}
              style={addresses.length >= 5 ? { color: '#d1d5db' } : {}}
            >
              Tạo địa chỉ mới
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default AddressSelector;
