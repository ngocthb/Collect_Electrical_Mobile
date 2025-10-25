import React from 'react';
import { SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';
import MapboxPicker, { LocationData } from '../../components/MapboxPicker';
import addrService from '../../services/mockAddressService';
import { useState, useEffect } from 'react';

const MapboxLocationPicker: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, any>, string>>();

  const handleLocationSelect = (location: LocationData) => {
    const returnTo = route.params?.returnTo;
    const action = route.params?.action;
    const addressId = route.params?.addressId;
    const creatorName = route.params?.creatorName;
    const creatorPhone = route.params?.creatorPhone;

    if (returnTo) {
      // forward any creator metadata so the caller can create/update with
      // the entered name/phone after picking the location on the map.
      // Use replace so we don't push another instance of the caller on the
      // stack (avoids duplicated screens and stale params that can re-open the map).
      try {
        navigation.replace(returnTo, {
          location,
          action,
          addressId,
          creatorName,
          creatorPhone,
        });
        return;
      } catch (e) {
        // fallback to navigate if replace isn't supported
        navigation.navigate(returnTo, {
          location,
          action,
          addressId,
          creatorName,
          creatorPhone,
        });
        return;
      }
    }

    navigation.navigate('CreateRequest', { location });
  };

  const [initialLocation, setInitialLocation] = useState<
    LocationData | undefined
  >(undefined);

  useEffect(() => {
    const action = route.params?.action;
    const addressId = route.params?.addressId;
    if (action === 'edit' && addressId) {
      (async () => {
        const addr = await addrService.get(addressId);
        if (
          addr &&
          typeof addr.latitude === 'number' &&
          typeof addr.longitude === 'number'
        ) {
          setInitialLocation({
            name: addr.address,
            latitude: addr.latitude,
            longitude: addr.longitude,
          });
        }
      })();
    }
  }, [route.params?.action, route.params?.addressId]);

  return (
    <SubLayout title="Chọn địa chỉ" onBackPress={() => navigation.goBack()}>
      <SafeAreaView className="flex-1 bg-white">
        <MapboxPicker
          onLocationSelect={handleLocationSelect}
          initialLocation={initialLocation}
          searchPlaceholder="Tìm kiếm địa điểm ..."
          confirmButtonText="Xác nhận vị trí"
          showMyLocationButton={true}
        />
      </SafeAreaView>
    </SubLayout>
  );
};

export default MapboxLocationPicker;
