import React from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';
import MapboxPicker from '../../components/MapboxPicker';
import { LocationData } from '../../types/MapboxPicker';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { saveAddress } from '../../store/slices/addressSlice';

const MapboxLocationPicker: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const address = useAppSelector(s => s.address);
  const handleLocationSelect = (location: LocationData) => {
    dispatch(
      saveAddress({
        address: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    );

    navigation.goBack();
  };

  return (
    <SubLayout title="Chọn địa chỉ" onBackPress={() => navigation.goBack()}>
      <SafeAreaView className="flex-1 bg-white">
        <MapboxPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={{
            latitude: address.latitude ?? 0,
            longitude: address.longitude ?? 0,
            name: address.address ?? '',
          }}
          searchPlaceholder="Tìm kiếm địa điểm ..."
          confirmButtonText="Xác nhận vị trí"
          showMyLocationButton={true}
        />
      </SafeAreaView>
    </SubLayout>
  );
};

export default MapboxLocationPicker;
