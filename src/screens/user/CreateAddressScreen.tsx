import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import SubLayout from '../../layout/SubLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import addrService from '../../services/mockAddressService';
import draftService from '../../services/draftService';
import { LocationData } from '../../components/MapboxPicker';
import { useFocusEffect } from '@react-navigation/native';

const CreateAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [addressInput, setAddressInput] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  const nameRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const hasLoadedRef = useRef(false); // Track đã load chưa
  const processedLocationRef = useRef(false); // Track if a map-picked location was processed

  const action = route.params?.action || 'create'; // 'create' or 'edit'
  const addressId = route.params?.addressId;

  // DEBUG: Log mỗi khi addressInput thay đổi
  useEffect(() => {
    console.log('🔵 addressInput state changed to:', addressInput);
  }, [addressInput]);

  // Load existing address data for editing (only once on mount)
  useEffect(() => {
    if (action === 'edit' && addressId && !hasLoadedRef.current) {
      console.log('📂 Loading address data for edit...');
      hasLoadedRef.current = true; // Đánh dấu đã load
      loadAddressData();
    }

    // also try to load draft if any (only for create flow)
    (async () => {
      if (action !== 'edit') {
        const draft = await draftService.getCreateAddressDraft();
        if (draft) {
          console.log('[CreateAddress] loaded draft', draft);
          if (draft.name) setName(draft.name);
          if (draft.phone) setPhone(draft.phone);
          if (draft.address) {
            setAddressInput(draft.address);
            setSelectedLocation(
              draft.latitude && draft.longitude
                ? {
                    name: draft.address,
                    latitude: draft.latitude,
                    longitude: draft.longitude,
                  }
                : null,
            );
          }
        }
      }
    })();
  }, []); // FIXED: Empty dependency array - chỉ chạy 1 lần khi mount

  const loadAddressData = async () => {
    try {
      console.log('📥 Fetching address data...');
      const addr = await addrService.get(addressId);
      if (addr) {
        console.log('📦 Loaded address:', addr.address);
        setName(addr.name || '');
        setPhone(addr.phone || '');

        // If a map-picked location was processed while this async load
        // was running, don't overwrite the user's picked address.
        if (!processedLocationRef.current) {
          setAddressInput(addr.address || '');

          if (addr.latitude && addr.longitude) {
            setSelectedLocation({
              name: addr.address,
              latitude: addr.latitude,
              longitude: addr.longitude,
            });
          }
        } else {
          console.log(
            '[CreateAddress] Skipping overwrite because a map location was processed',
          );
        }

        setInitialLoadDone(true);
      }
    } catch (error) {
      console.error('[CreateAddress] Load failed:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin địa chỉ');
      navigation.goBack();
    }
  };

  // Handle location selected from map
  useFocusEffect(
    React.useCallback(() => {
      const loc = route.params?.location as LocationData | undefined;

      if (loc) {
        processedLocationRef.current = true;
        hasLoadedRef.current = true;

        // Update location
        setSelectedLocation(loc);

        // Force update address input
        const newAddress = loc.name || '';

        setAddressInput(newAddress);
        setForceUpdateKey(prev => prev + 1); // Force re-render

        // Clear location param
        try {
          navigation.setParams({ location: undefined });
        } catch (e) {
          console.warn('Failed to clear location param', e);
        }

        // persist draft immediately so we don't lose this picked location
        try {
          draftService
            .saveCreateAddressDraft({
              name,
              phone,
              address: newAddress,
              latitude: loc.latitude,
              longitude: loc.longitude,
            })
            .catch(() => {});
        } catch (e) {}
      }
    }, [route.params?.location]),
  );

  const goToMap = () => {
    navigation.navigate('MapboxLocationScreen', {
      returnTo: 'CreateAddress',
      action,
      addressId,
      currentLocation: selectedLocation,
    });
  };

  const handleSave = async () => {
    // Validate name: must contain at least one space (first + last name)
    const hasSpace = name && name.trim().includes(' ');
    if (!hasSpace) {
      setNameError('Tên người dùng phải bao gồm họ và tên');
      nameRef.current?.focus();
      return;
    }

    // Validate phone: only digits count, length 9..15
    const digits = (phone || '').replace(/[^0-9]/g, '');
    if (!/^\d{9,15}$/.test(digits)) {
      setPhoneError('Số điện thoại không hợp lệ');
      phoneRef.current?.focus();
      return;
    }

    const finalAddress = selectedLocation?.name || addressInput;
    if (!finalAddress || !finalAddress.trim()) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập hoặc chọn vị trí trước khi lưu',
      );
      return;
    }

    try {
      if (action === 'edit' && addressId) {
        // Update existing address
        await addrService.update(addressId, {
          name: name || 'Người dùng',
          phone: phone || '+84 900 000 000',
          address: finalAddress,
          latitude: selectedLocation?.latitude,
          longitude: selectedLocation?.longitude,
        });

        Alert.alert('Thành công', 'Cập nhật địa chỉ thành công');

        navigation.navigate('AddressSelectionScreen', {
          createdAddressId: addressId,
        });
      } else {
        // Create new address
        const newAddr = await addrService.create({
          name: name || 'Người dùng',
          phone: phone || '+84 900 000 000',
          address: finalAddress,
          latitude: selectedLocation?.latitude,
          longitude: selectedLocation?.longitude,
          outdated: false,
        });

        Alert.alert('Thành công', 'Thêm địa chỉ mới thành công');

        navigation.navigate('AddressSelectionScreen', {
          createdAddressId: newAddr.id,
        });
      }
    } catch (error) {
      console.error('[CreateAddress] Save failed:', error);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    }
    // clear draft after successful save (create or update)
    try {
      draftService.clearCreateAddressDraft().catch(() => {});
    } catch (e) {}
  };

  return (
    <SubLayout
      title={action === 'edit' ? 'Chỉnh sửa địa chỉ' : 'Tạo địa chỉ mới'}
      onBackPress={() => navigation.navigate('AddressSelectionScreen')}
    >
      <View className="flex-1 bg-white px-5 py-6">
        <AppInput
          ref={nameRef}
          label="Tên người dùng"
          placeholder="Nhập tên người dùng"
          value={name}
          onChangeText={t => {
            setName(t);
            setNameError(null);
            // persist name immediately so it isn't lost when navigating away
            try {
              draftService
                .saveCreateAddressDraft({
                  name: t,
                  phone,
                  address: addressInput,
                  latitude: selectedLocation?.latitude,
                  longitude: selectedLocation?.longitude,
                })
                .catch(() => {});
            } catch (e) {}
          }}
          error={nameError ?? undefined}
          required
        />

        <AppInput
          ref={phoneRef}
          label="Số điện thoại liên hệ"
          placeholder="Nhập số điện thoại"
          value={phone}
          onChangeText={t => {
            setPhone(t);
            setPhoneError(null);
            // persist phone immediately so it isn't lost when navigating away
            try {
              draftService
                .saveCreateAddressDraft({
                  name,
                  phone: t,
                  address: addressInput,
                  latitude: selectedLocation?.latitude,
                  longitude: selectedLocation?.longitude,
                })
                .catch(() => {});
            } catch (e) {}
          }}
          error={phoneError ?? undefined}
          isPhone={true}
          required
        />

        <AppInput
          key={`address-${forceUpdateKey}`}
          label="Địa chỉ"
          placeholder="Chọn vị trí từ bản đồ"
          value={addressInput}
          onChangeText={text => {
            console.log('📝 User typing:', text);
            setAddressInput(text);
            // save draft on user edits
            draftService
              .saveCreateAddressDraft({
                name,
                phone,
                address: text,
                latitude: selectedLocation?.latitude,
                longitude: selectedLocation?.longitude,
              })
              .catch(() => {});
          }}
          required
        />

        <AppButton title="Chọn trên bản đồ" onPress={goToMap} size="small" />

        <View className="flex-grow justify-end">
          <AppButton
            title={action === 'edit' ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            onPress={handleSave}
          />
        </View>
      </View>
    </SubLayout>
  );
};

export default CreateAddressScreen;
