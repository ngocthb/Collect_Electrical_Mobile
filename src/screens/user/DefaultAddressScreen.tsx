import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import toast from 'react-native-toast-message';
import SubLayout from '../../layout/SubLayout';
import AddressSelector from '../../components/AddressSelector';
import AppButton from '../../components/ui/AppButton';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import type { Address } from '../../types/Address';
import { useNavigation } from '@react-navigation/native';
import { getUserAddresses, updateAddress } from '../../services/addressService';

import { setAddressList } from '../../store/slices/addressSlice';

const DefaultAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const handleSave = () => {
    (async () => {
      if (!selectedAddress) {
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Vui lòng chọn một địa chỉ',
        });
        return;
      }

      if (!user?.userId) {
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Bạn cần đăng nhập để lưu địa chỉ mặc định',
        });
        return;
      }

      try {
        // Set selected address as default on server
        await updateAddress(
          selectedAddress.userAddressId,
          user.userId,
          selectedAddress.address,
          selectedAddress.iat,
          selectedAddress.ing,
          true,
        );

        // Refresh address list from server
        const updatedList = await getUserAddresses(user.userId);
        dispatch(setAddressList(updatedList));

        // Find and set the newly default address
        const newDefaultAddress =
          updatedList.find(addr => addr.isDefault) || null;
        setSelectedAddress(newDefaultAddress);

        // Update local user address field with the new default address
        const updated = {
          ...user,
          address: newDefaultAddress?.address || selectedAddress.address,
        } as any;
        dispatch(setUser(updated));

        toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã lưu thành địa chỉ mặc định',
        });
      } catch (error) {
        console.error('Failed to set default address:', error);
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể lưu địa chỉ mặc định. Vui lòng thử lại.',
        });
      }
    })();
  };

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
      title="Địa chỉ mặc định"
      onBackPress={() => navigation.goBack()}
      onRefresh={handleRefresh}
    >
      <View className="flex-1 px-6  bg-background-50">
        <AddressSelector
          selectedAddress={selectedAddress}
          onSelectAddress={setSelectedAddress}
        />

        {
          <View className="py-4">
            <AppButton
              title="Lưu làm địa chỉ mặc định"
              onPress={handleSave}
              disabled={
                selectedAddress?.isDefault ||
                addresses.length < 0 ||
                selectedAddress === null
              }
            />
          </View>
        }
      </View>
    </SubLayout>
  );
};

export default DefaultAddressScreen;
