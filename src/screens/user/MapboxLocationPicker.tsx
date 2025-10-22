import React from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';
import MapboxPicker, { LocationData } from '../../components/MapboxPicker';

const MapboxLocationPicker: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleLocationSelect = (location: LocationData) => {
    navigation.navigate('CreateRequest', { location });
  };

  return (
    <SubLayout title="Chọn địa chỉ" onBackPress={() => navigation.goBack()}>
      <SafeAreaView className="flex-1 bg-white">
        <MapboxPicker
          onLocationSelect={handleLocationSelect}
          searchPlaceholder="Tìm kiếm địa điểm ..."
          confirmButtonText="Xác nhận vị trí"
          showMyLocationButton={true}
        />
      </SafeAreaView>
    </SubLayout>
  );
};

export default MapboxLocationPicker;
