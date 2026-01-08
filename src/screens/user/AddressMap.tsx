import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';
import CreateAddress from '../../components/CreateAddress';
import MapboxPicker from '../../components/MapboxPicker';
import { LocationData } from '../../types/MapboxPicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  saveAddress,
  setAddressList,
  updateAddress,
} from '../../store/slices/addressSlice';
import { getUserAddresses } from '../../services/addressService';
import toast from 'react-native-toast-message';
import type { Address } from '../../types/Address';
import {
  createAddress,
  updateAddress as updateAddressService,
} from '../../services/addressService';

import AsyncStorage from '@react-native-async-storage/async-storage';
type RouteParams = {
  AddressMap: {
    mode?: 'create' | 'edit';
    address?: Address;
  };
};

const AddressMap: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'AddressMap'>>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const mode = route.params?.mode || 'create';
  const addressData = route.params?.address;

  const [enableMapMode, setEnableMapMode] = useState<boolean>(false);

  useEffect(() => {
    const checkMapMode = async () => {
      try {
        const value = await AsyncStorage.getItem('enable_map_mode');
        setEnableMapMode(value === 'true');
      } catch (error) {
        console.error('Error reading AsyncStorage:', error);
        setEnableMapMode(false);
      }
    };
    checkMapMode();
  }, []);

  const handleLocationSelect = async (location: LocationData) => {
    // If no logged-in user, just save to current address and go back
    if (!user?.userId) {
      dispatch(
        saveAddress({
          address: location.name,
          iat: location.latitude,
          ing: location.longitude,
        }),
      );
      navigation.goBack();
      return;
    }

    // CASE 1: Edit existing address
    if (mode === 'edit' && addressData) {
      try {
        const updated = await updateAddressService(
          addressData?.userAddressId,
          user.userId,
          location.name,
          location.latitude,
          location.longitude,
          true,
        );

        // Convert updated response to Address shape expected by store
        const updatedAddr: Address = {
          userAddressId:
            (updated as any).userAddressId ??
            (updated as any).id ??
            addressData?.userAddressId,
          userId: user.userId,
          address: (updated as any).address ?? location.name,
          iat:
            (updated as any).iat ??
            (updated as any).latitude ??
            location.latitude,
          ing:
            (updated as any).ing ??
            (updated as any).longitude ??
            location.longitude,
          isDefault: addressData.isDefault,
        };

        dispatch(updateAddress(updatedAddr));
        toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã cập nhật địa chỉ',
        });

        navigation.goBack();
      } catch (error) {
        console.error('Failed to update address:', error);
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể cập nhật địa chỉ. Vui lòng thử lại.',
        });
      }
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
      // wait a bit to reduce perceived lag before navigating back
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500));
      navigation.goBack();
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
      title={mode === 'edit' ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
      onBackPress={() => navigation.goBack()}
      enableRefresh={true}
    >
      <SafeAreaView className="flex-1 bg-white">
        {enableMapMode ? (
          <MapboxPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={{
              latitude: addressData?.iat ?? 0,
              longitude: addressData?.ing ?? 0,
              name: addressData?.address ?? '',
            }}
            searchPlaceholder="Tìm kiếm địa điểm ..."
            confirmButtonText={
              mode === 'edit' ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'
            }
            showMyLocationButton={true}
          />
        ) : (
          <CreateAddress onLocationSelect={handleLocationSelect} />
        )}
      </SafeAreaView>
    </SubLayout>
  );
};

export default AddressMap;
