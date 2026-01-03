import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import toast from 'react-native-toast-message';
import SubLayout from '../../layout/SubLayout';
import AddressSelector from '../../components/AddressSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import type { Address } from '../../types/Address';
import { useNavigation } from '@react-navigation/native';
import { getUserAddresses } from '../../services/addressService';

import { setAddressList } from '../../store/slices/addressSlice';

const DefaultAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const addresses = useAppSelector(s => s.address.list);

  // Auto-select default address from Redux on mount
  useEffect(() => {
    const defaultAddr = addresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      setSelectedAddress(defaultAddr);
    }
  }, [addresses]);

  const handleRefresh = async () => {
    if (!user?.userId) return;
    try {
      const updatedList = await getUserAddresses(user.userId);
      dispatch(setAddressList(updatedList));
      const defaultAddr = updatedList.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Failed to refresh addresses:', error);
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải danh sách địa chỉ',
      });
    }
  };

  return (
    <SubLayout
      title="Thông tin địa chỉ"
      onBackPress={() => navigation.goBack()}
      onRefresh={handleRefresh}
    >
      <View className="flex-1 px-6  bg-background-50">
        <AddressSelector
          selectedAddress={selectedAddress}
          onSelectAddress={setSelectedAddress}
        />
      </View>
    </SubLayout>
  );
};

export default DefaultAddressScreen;
