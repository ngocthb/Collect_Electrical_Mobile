import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import toast from 'react-native-toast-message';
import SubLayout from '../../layout/SubLayout';
import AddressSelector from '../../components/AddressSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import type { Address } from '../../types/Address';
import { useNavigation } from '@react-navigation/native';
import { getUserAddresses } from '../../services/addressService';

import CreateAddress from '../../components/CreateAddress';
import { LocationData } from '../../types/MapboxPicker';
import { saveAddress, setAddressList } from '../../store/slices/addressSlice';
import { createAddress } from '../../services/addressService';

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

  const handleLocationSelect = async (location: LocationData) => {
    // Check if user already has 5 addresses
    if (addresses.length >= 5) {
      toast.show({
        type: 'error',
        text1: 'Đã đạt giới hạn',
        text2: 'Bạn chỉ có thể tạo tối đa 5 địa chỉ',
      });
      return;
    }

    if (!user?.userId) {
      dispatch(
        saveAddress({
          address: location.name,
          iat: location.latitude,
          ing: location.longitude,
        }),
      );
      return;
    }

    // CASE 2: Create new address
    try {
      const created = await createAddress(
        user.userId,
        location.name,
        location.latitude,
        location.longitude,
        true,
      );

      const addresses = await getUserAddresses(user.userId);
      dispatch(setAddressList(addresses || []));

      toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã thêm địa chỉ mới',
      });
    } catch (error) {
      console.error('Failed to create address:', error);
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể thêm địa chỉ. Vui lòng thử lại.',
      });

      navigation.goBack();
    }
  };

  return (
    <SubLayout
      title="Thông tin địa chỉ"
      onBackPress={() => navigation.goBack()}
      onRefresh={handleRefresh}
    >
      <View className=" px-6  bg-background-50">
        <CreateAddress onLocationSelect={handleLocationSelect} />
        <AddressSelector
          selectedAddress={selectedAddress}
          onSelectAddress={setSelectedAddress}
        />
      </View>
    </SubLayout>
  );
};

export default DefaultAddressScreen;
