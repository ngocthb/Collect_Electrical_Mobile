import React from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';
import MapboxPicker from '../../components/MapboxPicker';
import { LocationData } from '../../types/MapboxPicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  saveAddress,
  addAddress,
  updateAddress,
} from '../../store/slices/addressSlice';
import addressService from '../../services/addressService';
import toast from 'react-native-toast-message';
import type { Address } from '../../types/Address';

type RouteParams = {
  MapboxLocationScreen: {
    mode?: 'create' | 'edit';
    address?: Address;
  };
};

const MapboxLocationPicker: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RouteParams, 'MapboxLocationScreen'>>();
  const dispatch = useAppDispatch();
  const address = useAppSelector(s => s.address.current);
  const user = useAppSelector(s => s.auth.user);

  const mode = route.params?.mode || 'create';
  const addressData = route.params?.address;

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
        const updated = await addressService.updateAddress(
          addressData?.userAddressId,
          user.userId,
          location.name,
          location.latitude,
          location.longitude,
          addressData.isDefault,
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
        // wait a bit to reduce perceived lag before navigating back

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
      const created = await addressService.createAddress(
        user.userId,
        location.name,
        location.latitude,
        location.longitude,
        false,
      );

      // Convert created response to Address shape expected by store
      const newAddr: Address = {
        userAddressId:
          (created as any).userAddressId ?? (created as any).id ?? '',
        userId: user.userId,
        address: (created as any).address ?? location.name,
        iat:
          (created as any).iat ??
          (created as any).latitude ??
          location.latitude,
        ing:
          (created as any).ing ??
          (created as any).longitude ??
          location.longitude,
        isDefault: (created as any).isDefault ?? false,
      };

      dispatch(addAddress(newAddr));
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
      // Fallback: save to current so user doesn't lose selection
      dispatch(
        saveAddress({
          address: location.name,
          iat: location.latitude,
          ing: location.longitude,
        }),
      );

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
        <MapboxPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={{
            latitude: address.iat ?? 0,
            longitude: address.ing ?? 0,
            name: address.address ?? '',
          }}
          searchPlaceholder="Tìm kiếm địa điểm ..."
          confirmButtonText={
            mode === 'edit' ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'
          }
          showMyLocationButton={true}
        />
      </SafeAreaView>
    </SubLayout>
  );
};

export default MapboxLocationPicker;
