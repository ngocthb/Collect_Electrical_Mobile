import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import SubLayout from '../../layout/SubLayout';
import AddressSelector from '../../components/AddressSelector';
import AppButton from '../../components/ui/AppButton';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/authSlice';
import type { Address } from '../../types/Address';
import { useNavigation } from '@react-navigation/native';

const DefaultAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const handleSave = () => {
    if (!selectedAddress) {
      Alert.alert('Lỗi', 'Vui lòng chọn một địa chỉ');
      return;
    }

    const updated = {
      ...user,
      address: selectedAddress.address,
    } as any;

    dispatch(setUser(updated));
    Alert.alert('Thành công', 'Đã lưu địa chỉ mặc định');
    navigation.goBack();
  };

  return (
    <SubLayout title="Địa chỉ mặc định" onBackPress={() => navigation.goBack()}>
      <View className="px-6 pt-6">
        <AddressSelector
          selectedAddress={selectedAddress}
          onSelectAddress={setSelectedAddress}
        />

        <View className="py-4">
          <AppButton title="Lưu làm địa chỉ mặc định" onPress={handleSave} />
        </View>
      </View>
    </SubLayout>
  );
};

export default DefaultAddressScreen;
